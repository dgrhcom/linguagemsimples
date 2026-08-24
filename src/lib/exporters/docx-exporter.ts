import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { AnalysisResult } from "@/types/analysis";

export async function exportToDocxBlob(result: AnalysisResult, mode: "simplified_only" | "full_report" = "full_report"): Promise<Blob> {
  const simplifiedParagraphs = (result.rewrittenText || result.input.text)
    .split("\n\n")
    .map(p => new Paragraph({
      children: [new TextRun({ text: p, size: 24 })],
      spacing: { after: 200, line: 360 }
    }));

  if (mode === "simplified_only") {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Texto Simplificado (Linguagem Simples)",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 }
          }),
          ...simplifiedParagraphs
        ]
      }]
    });

    return await Packer.toBlob(doc);
  }

  // Full Report DOCX
  const findingParagraphs = result.findings.flatMap((f, idx) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${idx + 1}. "${f.originalText}"`, bold: true, size: 22 }),
        new TextRun({ text: ` [${f.category} - ${f.severity}]`, italics: true, color: "555555", size: 20 })
      ],
      spacing: { before: 150, after: 80 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Problema: ", bold: true, size: 20 }),
        new TextRun({ text: f.explanation, size: 20 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Recomendação: ", bold: true, color: "008000", size: 20 }),
        new TextRun({ text: f.recommendation, size: 20 })
      ],
      spacing: { after: 150 }
    })
  ]);

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Relatório de Linguagem Simples e Inclusiva",
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Metodologia: Projeto Linguagem Simples Unicamp", italics: true, color: "666666" })
          ],
          spacing: { after: 300 }
        }),
        new Paragraph({
          text: `Diagnóstico Geral: ${result.score.overallScore}/100 (${result.score.overallLevel.toUpperCase()})`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: result.score.summary, size: 22 })],
          spacing: { after: 250 }
        }),
        new Paragraph({
          text: "Problemas Encontrados",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        }),
        ...findingParagraphs,
        new Paragraph({
          text: "Versão em Linguagem Simples",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        }),
        ...simplifiedParagraphs
      ]
    }]
  });

  return await Packer.toBlob(doc);
}
