import { AnalysisInput, Finding } from "@/types/analysis";
import { AIAnalysisOutput, AIExplainOutput, AIRewriteOutput, LanguageModelProvider } from "./provider";
import { rewriteToPlainLanguage } from "@/lib/analysis/plain-language-rewriter";

export class MockLanguageModelProvider implements LanguageModelProvider {
  async analyzeText(input: AnalysisInput, deterministicFindings: Finding[]): Promise<AIAnalysisOutput> {
    const text = input.text;
    const additionalFindings: Finding[] = [];

    // Verificação de voz passiva ou inversões sintáticas comuns
    const passiveRegex = /\b(foi|foram|será|serão|sendo)\s+([a-z]+do|[a-z]+da|[a-z]+dos|[a-z]+das)\s+pelo|\b(foi|foram|será|serão)\s+([a-z]+do|[a-z]+da|[a-z]+dos|[a-z]+das)\s+pela\b/gi;
    let match: RegExpExecArray | null;
    while ((match = passiveRegex.exec(text)) !== null) {
      const original = match[0];
      const suggested = original
        .replace(/foi\s+([a-z]+da)\s+pela\s+([a-z]+)/i, "a $2 $1")
        .replace(/foi\s+([a-z]+do)\s+pelo\s+([a-z]+)/i, "o $2 $1");

      additionalFindings.push({
        id: `ai-passive-${match.index}`,
        category: "clarity",
        severity: "suggestion",
        originalText: original,
        location: { startIndex: match.index, endIndex: match.index + match[0].length },
        explanation: "Construção em voz passiva analítica que torna a leitura mais pesada e pode obscurecer quem é o agente responsável.",
        recommendation: "Prefira a voz ativa e a ordem direta (quem faz a ação + verbo direto + complemento).",
        suggestedText: suggested !== original ? suggested : undefined,
        source: {
          title: "Linguagem Simples Unicamp - Escreva",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          type: "unicamp"
        }
      });
    }

    const rewrittenText = rewriteToPlainLanguage(text);

    return {
      findings: additionalFindings,
      rewrittenText
    };
  }

  async rewriteText(input: AnalysisInput): Promise<AIRewriteOutput> {
    const rewrittenText = rewriteToPlainLanguage(input.text);
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
