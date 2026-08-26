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

export class OpenAILanguageModelProvider implements LanguageModelProvider {
  private apiKey: string;
  private model: string;
  private fallback: MockLanguageModelProvider;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new MockLanguageModelProvider();
  }

  async analyzeText(
    input: AnalysisInput,
    deterministicFindings: Finding[],
    unicampBaseRewrite?: string
  ): Promise<AIAnalysisOutput> {
    const baseRewrite = unicampBaseRewrite || rewriteToPlainLanguage(input.text);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT_ANALYSIS },
            { role: "user", content: buildAnalysisUserPrompt(input, deterministicFindings, baseRewrite) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        console.warn("OpenAI API error, falling back to mock provider:", response.statusText);
        return this.fallback.analyzeText(input, deterministicFindings, baseRewrite);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return this.fallback.analyzeText(input, deterministicFindings, baseRewrite);

      const parsed = JSON.parse(content);

      // 1. Mapeia sugestões para os achados determinísticos
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
          df.suggestedText = guaranteeDifferentSuggestion(df.originalText, rewriteToPlainLanguage(df.originalText));
        }
      }


      // 2. Achados adicionais contextuais
      const rawAdditional: any[] = Array.isArray(parsed.additionalFindings) ? parsed.additionalFindings : [];
      const findings: Finding[] = rawAdditional
        .filter(f => f && f.originalText && f.originalText.trim())
        .map((f: any, idx: number) => {
          const original = f.originalText.trim();
          const candidateSuggestion = (f.suggestedText || "").trim();
          const suggestedText = guaranteeDifferentSuggestion(original, candidateSuggestion);

          return {
            id: `ai-openai-${idx + 1}`,
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
        findings,
        rewrittenText: finalRewritten
      };
    } catch (e) {
      console.error("Error in OpenAILanguageModelProvider, using fallback:", e);
      return this.fallback.analyzeText(input, deterministicFindings, baseRewrite);
    }
  }

  async rewriteText(input: AnalysisInput, options?: RewriteOptions): Promise<AIRewriteOutput> {
    const isSegmentMode = options?.mode === "segment";
    const baseRewrite = options?.unicampBase || rewriteToPlainLanguage(input.text);

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

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT_ANALYSIS },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          rewrittenText: input.text,
          isOffline: false,
          status: "ai_error",
          error: `Erro na OpenAI (${response.status}): ${errText}`
        };
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      let cleaned = (text || "").replace(/^["']|["']$/g, "").trim();

      const finalRewritten = guaranteeDifferentSuggestion(input.text, cleaned || baseRewrite);
      const isUnchanged = finalRewritten.trim() === input.text.trim();

      return {
        rewrittenText: finalRewritten,
        isOffline: false,
        status: isUnchanged ? "unchanged" : "success",
        message: isUnchanged
          ? "A IA analisou a frase e considerou que ela não necessita de alteração ou não permite simplificação sem alteração de termos técnicos. Você pode personalizar o texto pelo botão 'Editar'."
          : undefined
      };
    } catch (e: any) {
      return {
        rewrittenText: input.text,
        isOffline: false,
        status: "ai_error",
        error: e?.message || "Erro de conexão com a OpenAI."
      };
    }
  }


  async explainFinding(finding: Finding): Promise<AIExplainOutput> {
    return this.fallback.explainFinding(finding);
  }
}

