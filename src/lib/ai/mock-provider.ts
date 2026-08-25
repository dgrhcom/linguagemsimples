import { AnalysisInput, Finding } from "@/types/analysis";
import { AIAnalysisOutput, AIExplainOutput, AIRewriteOutput, LanguageModelProvider, RewriteOptions } from "./provider";
import { rewriteToPlainLanguage, guaranteeDifferentSuggestion } from "@/lib/analysis/plain-language-rewriter";
import { generateShortSentenceSuggestion } from "@/lib/analysis/deterministic-engine";

export class MockLanguageModelProvider implements LanguageModelProvider {
  async analyzeText(
    input: AnalysisInput,
    deterministicFindings: Finding[],
    unicampBaseRewrite?: string
  ): Promise<AIAnalysisOutput> {
    const text = input.text;
    const additionalFindings: Finding[] = [];
    const baseRewrite = unicampBaseRewrite || rewriteToPlainLanguage(text);

    // 1. Garante que todos os achados determinísticos tenham uma sugestão simplificada válida
    for (const df of deterministicFindings) {
      if (!df.suggestedText || df.suggestedText === df.originalText) {
        if (df.category === "sentence") {
          df.suggestedText = generateShortSentenceSuggestion(df.originalText);
        } else {
          df.suggestedText = guaranteeDifferentSuggestion(df.originalText, rewriteToPlainLanguage(df.originalText));
        }
      }
    }


    // 2. Verificação de voz passiva ou inversões sintáticas comuns
    const passiveRegex = /\b(foi|foram|será|serão|sendo)\s+([a-z]+do|[a-z]+da|[a-z]+dos|[a-z]+das)\s+pelo|\b(foi|foram|será|serão)\s+([a-z]+do|[a-z]+da|[a-z]+dos|[a-z]+das)\s+pela\b/gi;
    let match: RegExpExecArray | null;
    while ((match = passiveRegex.exec(text)) !== null) {
      const original = match[0];
      const suggested = original
        .replace(/foi\s+([a-z]+da)\s+pela\s+([a-z]+)/i, "a $2 $1")
        .replace(/foi\s+([a-z]+do)\s+pelo\s+([a-z]+)/i, "o $2 $1");

      const suggestedText = guaranteeDifferentSuggestion(original, suggested !== original ? suggested : undefined);

      additionalFindings.push({
        id: `ai-passive-${match.index}`,
        category: "clarity",
        severity: "suggestion",
        originalText: original,
        location: { startIndex: match.index, endIndex: match.index + match[0].length },
        explanation: "Construção em voz passiva analítica que torna a leitura mais pesada e pode obscurecer quem é o agente responsável.",
        recommendation: "Prefira a voz ativa e a ordem direta (quem faz a ação + verbo direto + complemento).",
        suggestedText,
        source: {
          title: "Linguagem Simples Unicamp - Escreva",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          type: "unicamp"
        }
      });
    }

    const finalRewritten = guaranteeDifferentSuggestion(text, baseRewrite);

    return {
      findings: additionalFindings,
      rewrittenText: finalRewritten
    };
  }

  async rewriteText(input: AnalysisInput, options?: RewriteOptions): Promise<AIRewriteOutput> {
    const base = options?.unicampBase || rewriteToPlainLanguage(input.text);
    const rewrittenText = guaranteeDifferentSuggestion(input.text, base);
    return { rewrittenText };
  }

  async explainFinding(finding: Finding): Promise<AIExplainOutput> {
    return {
      detailedExplanation: `O problema identificado '${finding.originalText}' enquadra-se na categoria de ${finding.category}. ${finding.explanation}`,
      whyItMatters: "Textos claros, diretos e sem jargões reduzem o tempo de atendimento no serviço público, evitam retrabalho e democratizam o acesso à informação para todos os cidadãos.",
      pedagogicalTip: "Antes de publicar, faça a si mesmo a pergunta: 'Uma pessoa sem conhecimento prévio sobre o assunto entenderia esta frase logo na primeira leitura?'",
      sourceReference: finding.source?.title || "Projeto Linguagem Simples e Inclusiva da Unicamp"
    };
  }
}

