import { AnalysisResult } from "@/types/analysis";

export function exportToMarkdown(result: AnalysisResult, mode: "simplified_only" | "full_report" = "full_report"): string {
  if (mode === "simplified_only") {
    return result.rewrittenText || result.input.text;
  }

  const lines: string[] = [];
  lines.push("# Relatório de Linguagem Simples e Inclusiva");
  lines.push("> Metodologia: Projeto Linguagem Simples Unicamp (`https://linguagemsimples.unicamp.br`)");
  lines.push("");
  lines.push(`**Data da Análise:** ${new Date(result.timestamp).toLocaleString("pt-BR")}  `);
  lines.push(`**Tipo de Documento:** ${result.input.documentType}  `);
  lines.push(`**Público-Alvo:** ${result.input.targetAudience || "Público em geral"}  `);
  lines.push(`**Objetivo:** ${result.input.textGoal || "Não informado"}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 📊 Diagnóstico Geral");
  lines.push(`* **Score Geral:** \`${result.score.overallScore}/100\` (${result.score.overallLevel.toUpperCase()})`);
  lines.push(`* **Resumo:** ${result.score.summary}`);
  lines.push("");
  lines.push("### Os Três Pilares da Comunicação");
  lines.push(`* 🔍 **Encontrar (${result.score.pillars.encontrar.score}/100):** ${result.score.pillars.encontrar.summary}`);
  lines.push(`* 💡 **Compreender (${result.score.pillars.compreender.score}/100):** ${result.score.pillars.compreender.summary}`);
  lines.push(`* 🎯 **Usar (${result.score.pillars.usar.score}/100):** ${result.score.pillars.usar.summary}`);
  lines.push("");
  lines.push("### Métricas de Legibilidade");
  lines.push("| Métrica | Valor |");
  lines.push("| :--- | :--- |");
  lines.push(`| Total de Palavras | ${result.metrics.wordCount} |`);
  lines.push(`| Total de Frases | ${result.metrics.sentenceCount} |`);
  lines.push(`| Média de Palavras/Frase | ${result.metrics.avgWordsPerSentence} |`);
  lines.push(`| Frases Longas (> 20 palavras) | ${result.metrics.longSentencesCount} |`);
  lines.push(`| Facilidade de Leitura Flesch-BR | ${result.metrics.fleschReadingEaseBR}/100 |`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`## 🔍 Problemas Encontrados (${result.findings.length})`);
  lines.push("");
  result.findings.forEach((f, idx) => {
    lines.push(`### ${idx + 1}. Trecho: \`${f.originalText}\``);
    lines.push(`* **Categoria:** \`${f.category}\` | **Gravidade:** \`${f.severity}\``);
    lines.push(`* **Explicação:** ${f.explanation}`);
    lines.push(`* **Recomendação:** ${f.recommendation}`);
    if (f.suggestedText) {
      lines.push(`* **Sugestão:** \`${f.suggestedText}\``);
    }
    lines.push(`* **Fonte:** [${f.source.title}](${f.source.url || "#"})`);
    lines.push("");
  });
  lines.push("---");
  lines.push("");
  lines.push("## ✨ Versão em Linguagem Simples");
  lines.push("");
  lines.push(result.rewrittenText || result.input.text);
  lines.push("");

  return lines.join("\n");
}
