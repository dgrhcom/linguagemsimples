import { AnalysisResult } from "@/types/analysis";

export function exportToHtml(result: AnalysisResult, mode: "simplified_only" | "full_report" = "full_report"): string {
  const simplifiedTextHtml = (result.rewrittenText || result.input.text)
    .split("\n\n")
    .map(p => `<p style="margin-bottom: 1rem; line-height: 1.6;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  if (mode === "simplified_only") {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Texto Simplificado - Linguagem Simples</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #2e2d2b; background: #ead7b8; }
  </style>
</head>
<body>
  ${simplifiedTextHtml}
</body>
</html>`;
  }

  const findingsListHtml = result.findings.map((f, i) => `
    <div style="background: #ead7b8; border-left: 4px solid #ffb546; border: 1px solid #e5dfd5; border-left-width: 4px; padding: 12px 16px; margin-bottom: 12px; border-radius: 8px;">
      <div style="font-weight: 700; color: #2e2d2b;">${i + 1}. "${f.originalText}"</div>
      <div style="font-size: 0.875rem; color: #73706b; margin-top: 4px;">Categoria: <strong>${f.category}</strong> | Gravidade: <strong>${f.severity}</strong></div>
      <p style="margin: 6px 0; color: #333333;"><strong>Problema:</strong> ${f.explanation}</p>
      <p style="margin: 6px 0; color: #2e2d2b;"><strong>Recomendação:</strong> ${f.recommendation}</p>
      ${f.suggestedText ? `<p style="margin: 6px 0; color: #2e2d2b; background: #ffb54620; padding: 6px 10px; border-radius: 6px; border: 1px solid #ffb54660;"><strong>Sugestão:</strong> "${f.suggestedText}"</p>` : ""}
      ${f.source?.title ? `<div style="font-size: 0.75rem; color: #73706b; margin-top: 4px;">Fonte: ${f.source.title}</div>` : ""}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Linguagem Simples - Unicamp</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 24px; color: #2e2d2b; line-height: 1.5; background: #ead7b8; }
    h1 { color: #2e2d2b; border-bottom: 2px solid #e5dfd5; padding-bottom: 12px; }
    h2 { color: #2e2d2b; margin-top: 32px; border-bottom: 1px solid #e5dfd5; padding-bottom: 8px; }
    .card { background: #2e2d2b; color: #ead7b8; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .score-badge { display: inline-block; background: #ffb546; color: #2e2d2b; padding: 4px 12px; border-radius: 9999px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #ead7b8; border-radius: 8px; overflow: hidden; border: 1px solid #e5dfd5; }
    th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #e5dfd5; }
    th { background: #e5dfd5; color: #2e2d2b; font-weight: 700; }
    .footer { margin-top: 48px; border-top: 1px solid #e5dfd5; padding-top: 16px; font-size: 0.875rem; color: #73706b; text-align: center; }
  </style>
</head>
<body>
  <h1>Relatório de Linguagem Simples e Inclusiva</h1>
  <p style="color: #73706b;">Fundamentado na metodologia do Projeto Linguagem Simples Unicamp</p>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0; color: #ead7b8;">Diagnóstico Geral: <span class="score-badge">${result.score.overallScore}/100</span></h3>
        <p style="margin: 6px 0 0 0; color: #e5dfd5;">${result.score.summary}</p>
      </div>
    </div>
  </div>

  <h2>Os Três Pilares da Comunicação</h2>
  <table>
    <thead>
      <tr>
        <th>Pilar</th>
        <th>Score</th>
        <th>Diagnóstico</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>🔍 Encontrar</strong></td>
        <td>${result.score.pillars.encontrar.score}/100</td>
        <td>${result.score.pillars.encontrar.summary}</td>
      </tr>
      <tr>
        <td><strong>💡 Compreender</strong></td>
        <td>${result.score.pillars.compreender.score}/100</td>
        <td>${result.score.pillars.compreender.summary}</td>
      </tr>
      <tr>
        <td><strong>🎯 Usar</strong></td>
        <td>${result.score.pillars.usar.score}/100</td>
        <td>${result.score.pillars.usar.summary}</td>
      </tr>
    </tbody>
  </table>

  <h2>Métricas do Texto</h2>
  <table>
    <tbody>
      <tr><td>Total de Palavras</td><td><strong>${result.metrics.wordsCount ?? result.metrics.wordCount ?? 0}</strong></td></tr>
      <tr><td>Total de Frases</td><td><strong>${result.metrics.sentencesCount ?? result.metrics.sentenceCount ?? 0}</strong></td></tr>
      <tr><td>Média de Palavras por Frase</td><td><strong>${result.metrics.avgSentenceLengthWords ?? result.metrics.avgWordsPerSentence ?? 0}</strong></td></tr>
      <tr><td>Frases com mais de 20 palavras</td><td><strong>${result.metrics.longSentencesCount}</strong></td></tr>
      <tr><td>Índice de Facilidade de Leitura (Flesch-BR)</td><td><strong>${result.metrics.fleschReadingEaseBR}/100</strong></td></tr>
    </tbody>
  </table>

  <h2>Problemas Encontrados (${result.findings.length})</h2>
  ${findingsListHtml}

  <h2>Versão em Linguagem Simples</h2>
  <div style="background: #ffb54620; border: 1px solid #ffb54660; padding: 20px; border-radius: 12px; color: #2e2d2b; font-weight: 500;">
    ${simplifiedTextHtml}
  </div>

  <div class="footer">
    Documento gerado pelo Assistente de Linguagem Simples e Inclusiva • Referência: <a href="https://linguagemsimples.unicamp.br" style="color: #2e2d2b; font-weight: 700;">linguagemsimples.unicamp.br</a>
  </div>
</body>
</html>`;
}
