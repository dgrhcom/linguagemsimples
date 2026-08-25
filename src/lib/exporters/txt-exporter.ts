import { AnalysisResult } from "@/types/analysis";

export function exportToTxt(result: AnalysisResult, mode: "simplified_only" | "full_report" = "full_report"): string {
  if (mode === "simplified_only") {
    return result.rewrittenText || result.input.text;
  }

  const lines: string[] = [];
  lines.push("==================================================================");
  lines.push("       RELATÓRIO DE LINGUAGEM SIMPLES E INCLUSIVA");
  lines.push("       Metodologia: Projeto Linguagem Simples Unicamp");
  lines.push("==================================================================");
  lines.push(`Data da Análise: ${new Date(result.timestamp).toLocaleString("pt-BR")}`);
  lines.push(`Tipo de Documento: ${result.input.documentType}`);
  lines.push(`Público-Alvo: ${result.input.targetAudience || "Geral"}`);
  lines.push(`Objetivo: ${result.input.textGoal || "Não informado"}`);
  lines.push("");
  lines.push("--- DIAGNÓSTICO GERAL ---");
  lines.push(`Score Geral: ${result.score.overallScore}/100 (${result.score.overallLevel.toUpperCase()})`);
  lines.push(`Resumo: ${result.score.summary}`);
  lines.push("");
  lines.push("--- OS TRÊS PILARES ---");
  lines.push(`1. ENCONTRAR: ${result.score.pillars.encontrar.score}/100 - ${result.score.pillars.encontrar.summary}`);
  lines.push(`2. COMPREENDER: ${result.score.pillars.compreender.score}/100 - ${result.score.pillars.compreender.summary}`);
  lines.push(`3. USAR: ${result.score.pillars.usar.score}/100 - ${result.score.pillars.usar.summary}`);
  lines.push("");
  lines.push("--- MÉTRICAS DO TEXTO ---");
  lines.push(`Total de Palavras: ${result.metrics.wordsCount ?? result.metrics.wordCount ?? 0}`);
  lines.push(`Total de Frases: ${result.metrics.sentencesCount ?? result.metrics.sentenceCount ?? 0}`);
  lines.push(`Média de Palavras por Frase: ${result.metrics.avgSentenceLengthWords ?? result.metrics.avgWordsPerSentence ?? 0}`);
  lines.push(`Frases Longas (> 20 palavras): ${result.metrics.longSentencesCount}`);
  lines.push(`Índice Flesch-BR: ${result.metrics.fleschReadingEaseBR}/100`);
  lines.push("");
  lines.push(`--- PROBLEMAS ENCONTRADOS (${result.findings.length}) ---`);
  result.findings.forEach((f, idx) => {
    lines.push(`[${idx + 1}] Trecho: "${f.originalText}"`);
    lines.push(`    Categoria: ${f.category} | Gravidade: ${f.severity}`);
    lines.push(`    Explicação: ${f.explanation}`);
    lines.push(`    Recomendação: ${f.recommendation}`);
    if (f.suggestedText) lines.push(`    Sugestão: "${f.suggestedText}"`);
    if (f.source?.title) lines.push(`    Fonte: ${f.source.title}`);
    lines.push("");
  });
  lines.push("==================================================================");
  lines.push("       VERSÃO SIMPLIFICADA (LINGUAGEM SIMPLES)");
  lines.push("==================================================================");
  lines.push(result.rewrittenText || result.input.text);
  lines.push("");

  return lines.join("\n");
}
