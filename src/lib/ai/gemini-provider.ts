import { AnalysisInput, Finding } from "@/types/analysis";
import { AIAnalysisOutput, AIExplainOutput, AIRewriteOutput, LanguageModelProvider, RewriteOptions } from "./provider";
import {
  SYSTEM_PROMPT_ANALYSIS,
  buildAnalysisUserPrompt,
  buildRewriteUserPrompt,
  buildSegmentRewritePrompt
} from "./prompts";
import { MockLanguageModelProvider } from "./mock-provider";
import { rewriteToPlainLanguage, guaranteeDifferentSuggestion } from "@/lib/analysis/plain-language-rewriter";
import { generateShortSentenceSuggestion } from "@/lib/analysis/deterministic-engine";

export class GeminiLanguageModelProvider implements LanguageModelProvider {

  private apiKey: string;
  private primaryModel: string;
  private fallback: MockLanguageModelProvider;
  private candidateModels: string[];

  constructor(apiKey: string, model: string = "gemini-2.0-flash") {
    this.apiKey = apiKey;
    this.primaryModel = model;
    this.candidateModels = Array.from(new Set([model, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]));
    this.fallback = new MockLanguageModelProvider();
  }

  private cleanJsonResponse(rawText: string): any {
    try {
      let cleaned = rawText.trim();
      // Remove delimitadores de código markdown (```json ... ```)
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      }
      return JSON.parse(cleaned);
    } catch (e) {
      // Tenta encontrar o primeiro objeto JSON no texto
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
        } catch (inner) {}
      }
      throw e;
    }
  }

  private async callGemini(systemPrompt: string, userPrompt: string, isJson: boolean = false): Promise<string> {
    let lastError: any = null;

    for (const model of this.candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: userPrompt }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                ...(isJson ? { responseMimeType: "application/json" } : {})
              }
            })
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          console.warn(`[Gemini API] Falha no modelo ${model} (${response.status}):`, errBody);

          // Tenta chamada com prompt inline se falhar com erro 400 (ex: system_instruction não aceita na versão)
          try {
            const inlineRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      role: "user",
                      parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                    }
                  ],
                  generationConfig: { temperature: 0.2 }
                })
              }
            );
            if (inlineRes.ok) {
              const inlineData = await inlineRes.json();
              const inlineText = inlineData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (inlineText && inlineText.trim()) {
                return inlineText.trim();
              }
            }
          } catch (retryErr) {}

          lastError = new Error(`Gemini API ${response.status}: ${errBody}`);
          continue; // Tenta o próximo modelo candidato
        }


        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (err: any) {
        console.warn(`[Gemini API] Erro de conexão com ${model}:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("Não foi possível obter resposta de nenhum modelo Gemini");
  }

  async analyzeText(
    input: AnalysisInput,
    deterministicFindings: Finding[],
    unicampBaseRewrite?: string
  ): Promise<AIAnalysisOutput> {
    const baseRewrite = unicampBaseRewrite || rewriteToPlainLanguage(input.text);

    try {
      const userPrompt = buildAnalysisUserPrompt(input, deterministicFindings, baseRewrite);
      const rawResponse = await this.callGemini(SYSTEM_PROMPT_ANALYSIS, userPrompt, true);
      const parsed = this.cleanJsonResponse(rawResponse);

      // 1. Mapeamento e refinamento de sugestões para os achados determinísticos da Unicamp
      const deterministicMap = new Map<string, string>();
      if (Array.isArray(parsed.deterministicSuggestions)) {
        for (const ds of parsed.deterministicSuggestions) {
          if (ds.originalText && ds.suggestedText) {
            deterministicMap.set(ds.originalText.trim().toLowerCase(), ds.suggestedText.trim());
          }
        }
      }

      for (const df of deterministicFindings) {
        const key = df.originalText.trim().toLowerCase();
        let aiSuggestion = deterministicMap.get(key);

        // Se não houver correspondência exata, busca por inclusão em deterministicSuggestions
        if (!aiSuggestion && deterministicMap.size > 0) {
          for (const [dKey, dVal] of deterministicMap.entries()) {
            if (key.includes(dKey) || dKey.includes(key)) {
              aiSuggestion = dVal;
              break;
            }
          }
        }

        // Se ainda não encontrou, busca em additionalFindings
        if (!aiSuggestion && Array.isArray(parsed.additionalFindings)) {
          const match = parsed.additionalFindings.find((af: any) =>
            af && af.originalText && (
              af.originalText.trim().toLowerCase() === key ||
              key.includes(af.originalText.trim().toLowerCase()) ||
              af.originalText.trim().toLowerCase().includes(key)
            )
          );
          if (match && match.suggestedText) {
            aiSuggestion = match.suggestedText.trim();
          }
        }

        if (aiSuggestion && aiSuggestion !== df.originalText) {
          df.suggestedText = aiSuggestion;
        } else if (!df.suggestedText || df.suggestedText === df.originalText) {
          if (df.category === "sentence") {
            df.suggestedText = generateShortSentenceSuggestion(df.originalText);
          } else {
            df.suggestedText = guaranteeDifferentSuggestion(df.originalText, rewriteToPlainLanguage(df.originalText));
          }
        }
      }

      // 2. Achados adicionais identificados contextualmente pela IA
      const rawAdditional: any[] = Array.isArray(parsed.additionalFindings) ? parsed.additionalFindings : [];
      const additionalFindings: Finding[] = rawAdditional
        .filter(f => f && f.originalText && f.originalText.trim())
        .map((f: any, idx: number) => {
          const original = f.originalText.trim();
          const candidateSuggestion = (f.suggestedText || "").trim();
          const suggestedText = guaranteeDifferentSuggestion(original, candidateSuggestion);

          return {
            id: `ai-${idx + 1}`,
            category: f.category || "clarity",
            severity: f.severity || "suggestion",
            originalText: original,
            explanation: f.explanation || "Construção que pode ser simplificada segundo as diretrizes da Unicamp.",
            recommendation: f.recommendation || "Utilize ordem direta e termos simples e diretos.",
            suggestedText,
            source: {
              title: "Análise Neural (baseada nas diretrizes Unicamp)",
              url: "https://linguagemsimples.unicamp.br/",
              type: "ai" as const
            }
          };
        });

      // 3. Reescrita integral com garantia de simplificação
      let aiRewritten = (parsed.rewrittenText || "").trim();
      const finalRewritten = guaranteeDifferentSuggestion(input.text, aiRewritten || baseRewrite);

      return {
        findings: additionalFindings,
        rewrittenText: finalRewritten
      };
    } catch (e) {
      console.error("[Gemini Provider] Erro no analyzeText, utilizando motor Unicamp enriquecido:", e);
      return this.fallback.analyzeText(input, deterministicFindings, baseRewrite);
    }
  }

  async rewriteText(input: AnalysisInput, options?: RewriteOptions): Promise<AIRewriteOutput> {
    const isSegmentMode = options?.mode === "segment";
    const baseRewrite = options?.unicampBase || (isSegmentMode ? generateShortSentenceSuggestion(input.text) : rewriteToPlainLanguage(input.text));

    try {
      let prompt: string;
      if (isSegmentMode) {
        prompt = buildSegmentRewritePrompt(
          input.text,
          options?.segmentIssue,
          options?.targetAudience || input.targetAudience,
          options?.unicampBase
        );
      } else {
        prompt = buildRewriteUserPrompt(input, baseRewrite);
      }

      const rawText = await this.callGemini(SYSTEM_PROMPT_ANALYSIS, prompt, false);
      let cleaned = rawText
        .replace(/^```(?:text|markdown)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .replace(/^(?:Aqui está a (?:frase|versão|reescrita)[^:\n]*:?\s*|Sugestão[^:\n]*:?\s*|Reescrita[^:\n]*:?\s*)/i, "")
        .replace(/^["'“”«»]+|["'“”«»]+$/g, "")
        .trim();

      const candidate = cleaned || baseRewrite;
      const finalRewritten = guaranteeDifferentSuggestion(input.text, candidate);
      return { rewrittenText: finalRewritten };
    } catch (e) {
      console.error("[Gemini Provider] Erro no rewriteText, utilizando motor Unicamp enriquecido:", e);
      return this.fallback.rewriteText(input, options);
    }
  }


  async explainFinding(finding: Finding): Promise<AIExplainOutput> {
    return this.fallback.explainFinding(finding);
  }
}

