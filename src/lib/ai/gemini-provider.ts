import { AnalysisInput, Finding } from "@/types/analysis";
import { AIAnalysisOutput, AIExplainOutput, AIRewriteOutput, LanguageModelProvider } from "./provider";
import { SYSTEM_PROMPT_ANALYSIS, buildAnalysisUserPrompt, buildRewriteUserPrompt } from "./prompts";
import { MockLanguageModelProvider } from "./mock-provider";
import { rewriteToPlainLanguage } from "@/lib/analysis/plain-language-rewriter";

export class GeminiLanguageModelProvider implements LanguageModelProvider {
  private apiKey: string;
  private model: string;
  private fallback: MockLanguageModelProvider;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new MockLanguageModelProvider();
  }

  async analyzeText(input: AnalysisInput, deterministicFindings: Finding[]): Promise<AIAnalysisOutput> {
    try {
      const prompt = `${SYSTEM_PROMPT_ANALYSIS}\n\n${buildAnalysisUserPrompt(input)}\n\nFormato de Resposta (JSON estrito):\n{\n  "additionalFindings": [\n    {\n      "category": "clarity" | "concision" | "sentence" | "vocabulary" | "inclusivity" | "instruction" | "formatting",\n      "severity": "info" | "suggestion" | "warning" | "critical",\n      "originalText": "trecho exato do texto",\n      "explanation": "por que precisa melhorar segundo a Unicamp",\n      "recommendation": "o que fazer",\n      "suggestedText": "sugestão de substituição"\n    }\n  ],\n  "rewrittenText": "versão integral em linguagem simples"\n}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        })
      });

      if (!response.ok) {
        console.warn("Gemini API error, falling back to mock provider:", response.statusText);
        return this.fallback.analyzeText(input, deterministicFindings);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return this.fallback.analyzeText(input, deterministicFindings);

      const parsed = JSON.parse(rawText);
      const findings: Finding[] = (parsed.additionalFindings || []).map((f: any, idx: number) => ({
        id: `ai-${idx + 1}`,
        category: f.category || "clarity",
        severity: f.severity || "suggestion",
        originalText: f.originalText || "",
        explanation: f.explanation || "",
        recommendation: f.recommendation || "",
        suggestedText: f.suggestedText,
        source: {
          title: "Análise por IA (baseada nas diretrizes Unicamp)",
          url: "https://linguagemsimples.unicamp.br/",
          type: "ai"
        }
      }));

      // Se a IA retornar texto idêntico, aplica o motor de reescrita da Unicamp
      const aiRewritten = parsed.rewrittenText;
      const finalRewritten = (aiRewritten && aiRewritten.trim() !== input.text.trim())
        ? aiRewritten.trim()
        : rewriteToPlainLanguage(input.text);

      return {
        findings,
        rewrittenText: finalRewritten
      };
    } catch (e) {
      console.error("Error in GeminiLanguageModelProvider, using fallback:", e);
      return this.fallback.analyzeText(input, deterministicFindings);
    }
  }

  async rewriteText(input: AnalysisInput): Promise<AIRewriteOutput> {
    try {
      const prompt = `${SYSTEM_PROMPT_ANALYSIS}\n\n${buildRewriteUserPrompt(input)}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!response.ok) return this.fallback.rewriteText(input);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text && text.trim() !== input.text.trim()) {
        return { rewrittenText: text.trim() };
      }

      return { rewrittenText: rewriteToPlainLanguage(input.text) };
    } catch (e) {
      return this.fallback.rewriteText(input);
    }
  }

  async explainFinding(finding: Finding): Promise<AIExplainOutput> {
    return this.fallback.explainFinding(finding);
  }
}
