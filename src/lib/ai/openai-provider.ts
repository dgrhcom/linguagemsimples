import { AnalysisInput, Finding } from "@/types/analysis";
import { AIAnalysisOutput, AIExplainOutput, AIRewriteOutput, LanguageModelProvider } from "./provider";
import { SYSTEM_PROMPT_ANALYSIS, buildAnalysisUserPrompt, buildRewriteUserPrompt } from "./prompts";
import { MockLanguageModelProvider } from "./mock-provider";
import { rewriteToPlainLanguage } from "@/lib/analysis/plain-language-rewriter";

export class OpenAILanguageModelProvider implements LanguageModelProvider {
  private apiKey: string;
  private model: string;
  private fallback: MockLanguageModelProvider;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new MockLanguageModelProvider();
  }

  async analyzeText(input: AnalysisInput, deterministicFindings: Finding[]): Promise<AIAnalysisOutput> {
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
            { role: "user", content: buildAnalysisUserPrompt(input) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) {
        console.warn("OpenAI API error, falling back to mock provider:", response.statusText);
        return this.fallback.analyzeText(input, deterministicFindings);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return this.fallback.analyzeText(input, deterministicFindings);

      const parsed = JSON.parse(content);
      const findings: Finding[] = (parsed.additionalFindings || []).map((f: any, idx: number) => ({
        id: `ai-openai-${idx + 1}`,
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

      const aiRewritten = parsed.rewrittenText;
      const finalRewritten = (aiRewritten && aiRewritten.trim() !== input.text.trim())
        ? aiRewritten.trim()
        : rewriteToPlainLanguage(input.text);

      return {
        findings,
        rewrittenText: finalRewritten
      };
    } catch (e) {
      console.error("Error in OpenAILanguageModelProvider, using fallback:", e);
      return this.fallback.analyzeText(input, deterministicFindings);
    }
  }

  async rewriteText(input: AnalysisInput): Promise<AIRewriteOutput> {
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
            { role: "user", content: buildRewriteUserPrompt(input) }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) return this.fallback.rewriteText(input);

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
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
