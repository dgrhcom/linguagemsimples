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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #fff; }
  </style>
</head>
<body>
  ${simplifiedTextHtml}
</body>
</html>`;
  }

  const findingsListHtml = result.findings.map((f, i) => `
    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
      <div style="font-weight: 600; color: #0f172a;">${i + 1}. "${f.originalText}"</div>
      <div style="font-size: 0.875rem; color: #64748b; margin-top: 4px;">Categoria: <strong>${f.category}</strong> | Gravidade: <strong>${f.severity}</strong></div>
      <p style="margin: 6px 0; color: #334155;"><strong>Problema:</strong> ${f.explanation}</p>
      <p style="margin: 6px 0; color: #166534;"><strong>Recomendação:</strong> ${f.recommendation}</p>
      ${f.suggestedText ? `<p style="margin: 6px 0; color: #1e40af;"><strong>Sugestão:</strong> "${f.suggestedText}"</p>` : ""}
      <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Fonte: ${f.source.title}</div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Linguagem Simples - Unicamp</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 24px; color: #1e293b; line-height: 1.5; background: #fff; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #1e3a8a; margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .card { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .score-badge { display: inline-block; background: #2563eb; color: #fff; padding: 4px 12px; border-radius: 9999px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #475569; }
    .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 0.875rem; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <h1>Relatório de Linguagem Simples e Inclusiva</h1>
  <p style="color: #64748b;">Fundamentado na metodologia do Projeto Linguagem Simples Unicamp</p>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3 style="margin: 0; color: #0f172a;">Diagnóstico Geral: <span class="score-badge">${result.score.overallScore}/100</span></h3>
        <p style="margin: 4px 0 0 0; color: #475569;">${result.score.summary}</p>
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
      <tr><td>Total de Palavras</td><td><strong>${result.metrics.wordCount}</strong></td></tr>
      <tr><td>Total de Frases</td><td><strong>${result.metrics.sentenceCount}</strong></td></tr>
      <tr><td>Média de Palavras por Frase</td><td><strong>${result.metrics.avgWordsPerSentence}</strong></td></tr>
      <tr><td>Frases com mais de 20 palavras</td><td><strong>${result.metrics.longSentencesCount}</strong></td></tr>
      <tr><td>Índice de Facilidade de Leitura (Flesch-BR)</td><td><strong>${result.metrics.fleschReadingEaseBR}/100</strong></td></tr>
    </tbody>
  </table>

  <h2>Problemas Encontrados (${result.findings.length})</h2>
  ${findingsListHtml}

  <h2>Versão em Linguagem Simples</h2>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; color: #166534;">
    ${simplifiedTextHtml}
  </div>

  <div class="footer">
    Documento gerado pelo Assistente de Linguagem Simples e Inclusiva • Referência: <a href="https://linguagemsimples.unicamp.br" style="color: #2563eb;">linguagemsimples.unicamp.br</a>
  </div>
</body>
</html>`;
}
