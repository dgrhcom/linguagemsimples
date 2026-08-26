import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType
} from "docx";

export interface ComunicadoMetadata {
  unitName: string;
  documentNumber?: string;
  emailSite: string;
  locationAndDate: string;
  authorName: string;
  authorRole: string;
}

export async function generateComunicadoDocx(
  text: string,
  metadata: ComunicadoMetadata
): Promise<Blob> {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 850, // ~1.5cm
              bottom: 850, // ~1.5cm
              left: 1417, // ~2.5cm
              right: 1134 // ~2.0cm
            }
          }
        },
        children: [
          // 1. Cabeçalho Institucional (Tabela com 2 colunas: Esquerda = Unicamp Logo text / Direita = Dados do Órgão)
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "UNICAMP",
                            bold: true,
                            size: 26,
                            font: "Montserrat"
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: metadata.unitName || "UNIDADE / ÓRGÃO",
                            size: 16,
                            color: "666666",
                            font: "Montserrat"
                          })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: "Universidade Estadual de Campinas",
                            bold: true,
                            size: 18,
                            font: "Montserrat"
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: metadata.unitName || "Diretoria Geral de Recursos Humanos",
                            size: 16,
                            font: "Montserrat"
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br",
                            size: 14,
                            color: "555555",
                            font: "Montserrat"
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Espaço após o cabeçalho
          new Paragraph({ spacing: { before: 400, after: 400 } }),

          // 2. Identificação do Documento (Centralizado, Negrito, Caixa Alta)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [
              new TextRun({
                text: metadata.documentNumber
                  ? `COMUNICADO Nº ${metadata.documentNumber}`
                  : "COMUNICADO",
                bold: true,
                size: 24,
                font: "Montserrat"
              })
            ]
          }),

          // 3. Corpo do Texto (Parágrafos com recuo de 1,25cm / 708 twips)
          ...paragraphs.map(p => {
            const isBullet = p.startsWith("-") || p.startsWith("•") || /^\d+[\.\)]/.test(p);
            return new Paragraph({
              alignment: AlignmentType.BOTH,
              indent: isBullet ? { left: 708 } : { firstLine: 708 },
              spacing: { line: 276, before: 120, after: 120 },
              children: [
                new TextRun({
                  text: p,
                  size: 22,
                  font: "Montserrat"
                })
              ]
            });
          }),

          // Espaçamento antes da data
          new Paragraph({ spacing: { before: 400, after: 200 } }),

          // 4. Local e Data (Alinhado ao parágrafo com recuo à esquerda)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 708 },
            spacing: { before: 200, after: 600 },
            children: [
              new TextRun({
                text: metadata.locationAndDate.endsWith(".")
                  ? metadata.locationAndDate
                  : `${metadata.locationAndDate}.`,
                size: 22,
                font: "Montserrat"
              })
            ]
          }),

          // Espaçamento da assinatura
          new Paragraph({ spacing: { before: 600, after: 100 } }),

          // 5. Identificação da Autora ou Autor (Centralizado)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: metadata.authorName,
                bold: true,
                size: 22,
                font: "Montserrat"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 50, after: 200 },
            children: [
              new TextRun({
                text: metadata.authorRole,
                size: 20,
                color: "444444",
                font: "Montserrat"
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}
