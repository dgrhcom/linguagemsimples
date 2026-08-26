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
  WidthType,
  ImageRun
} from "docx";

export interface ComunicadoMetadata {
  unitName: string;
  documentNumber?: string;
  emailSite: string;
  locationAndDate: string;
  authorName: string;
  authorRole: string;
  customUnitLogo?: string; // Data URL Base64
  hideUnicampLogo?: boolean; // Opção para ocultar logo Unicamp
}

/**
 * Converte Data URL (Base64) em Uint8Array para o ImageRun do docx
 */
export function dataUriToBuffer(dataUri: string): Uint8Array {
  const base64Str = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
  const binaryStr = typeof window !== "undefined"
    ? window.atob(base64Str)
    : Buffer.from(base64Str, "base64").toString("binary");
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converte qualquer imagem ou SVG em PNG Data URL e calcula suas dimensões proporcionais
 */
export async function loadImageAsPngDataUrl(
  src: string,
  targetHeight = 56
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (typeof window === "undefined") {
    return null;
  }
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const naturalW = img.naturalWidth || 240;
      const naturalH = img.naturalHeight || 270;
      const scale = targetHeight / naturalH;
      const targetWidth = Math.max(20, Math.round(naturalW * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth * 2; // Alta densidade
      canvas.height = targetHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(null);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth * 2, targetHeight * 2);
      const dataUrl = canvas.toDataURL("image/png");
      resolve({ dataUrl, width: targetWidth, height: targetHeight });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

export async function generateComunicadoDocx(
  text: string,
  metadata: ComunicadoMetadata
): Promise<Blob> {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const logoRuns: ImageRun[] = [];

  // 1. Logotipo oficial da Unicamp (a menos que o usuário tenha marcado para ocultar)
  if (!metadata.hideUnicampLogo) {
    try {
      const unicampPng = await loadImageAsPngDataUrl("/images/logo-unicamp.svg", 54);
      if (unicampPng) {
        const unicampBytes = dataUriToBuffer(unicampPng.dataUrl);
        logoRuns.push(
          new ImageRun({
            data: unicampBytes,
            transformation: {
              width: unicampPng.width,
              height: 54
            },
            type: "png"
          })
        );
      }
    } catch (e) {
      console.warn("Erro ao processar logotipo da Unicamp para DOCX:", e);
    }
  }

  // 2. Logotipo da Unidade (mesma altura que o da Unicamp, largura proporcional irrestrita)
  if (metadata.customUnitLogo && metadata.customUnitLogo.startsWith("data:")) {
    try {
      const unitPng = await loadImageAsPngDataUrl(metadata.customUnitLogo, 54);
      if (unitPng) {
        const unitBytes = dataUriToBuffer(unitPng.dataUrl);
        logoRuns.push(
          new ImageRun({
            data: unitBytes,
            transformation: {
              width: unitPng.width,
              height: 54
            },
            type: "png"
          })
        );
      }
    } catch (e) {
      console.warn("Erro ao processar logotipo da unidade para DOCX:", e);
    }
  }

  const headerLeftChildren = logoRuns.length > 0
    ? [new Paragraph({ spacing: { before: 0, after: 0 }, children: logoRuns })]
    : [new Paragraph({ children: [new TextRun({ text: "UNICAMP", bold: true, size: 22, font: "Arial" })] })];

  // Larguras exatas em DXA (twips) para A4: 
  // Largura total da página = 11.906 dxa
  // Margem Esquerda = 1.417 dxa (2,5cm) | Margem Direita = 1.134 dxa (2,0cm)
  // Largura Útil = 9.355 dxa (16,5cm)
  const leftColWidth = 4200; // ~7,4 cm
  const rightColWidth = 5155; // ~9,1 cm
  const totalTableWidth = leftColWidth + rightColWidth; // 9355 dxa

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 24, // 12pt (docx mede em half-points, 24 = 12pt)
            color: "000000"
          },
          paragraph: {
            spacing: {
              line: 360 // Espaçamento 1,5 linha (240 * 1.5 = 360)
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 850, // ~1,5 cm
              bottom: 850, // ~1,5 cm
              left: 1417, // ~2,5 cm
              right: 1134 // ~2,0 cm
            }
          }
        },
        children: [
          // 1. Cabeçalho Institucional (Tabela com larguras absolutas em DXA para compatibilidade total com Google Docs e Word)
          new Table({
            columnWidths: [leftColWidth, rightColWidth],
            width: {
              size: totalTableWidth,
              type: WidthType.DXA
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
                    width: { size: leftColWidth, type: WidthType.DXA },
                    children: headerLeftChildren
                  }),
                  new TableCell({
                    width: { size: rightColWidth, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { line: 240, before: 0, after: 30 },
                        children: [
                          new TextRun({
                            text: "Universidade Estadual de Campinas",
                            bold: true,
                            size: 20, // 10pt
                            font: "Arial"
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { line: 240, before: 0, after: 30 },
                        children: [
                          new TextRun({
                            text: metadata.unitName || "Diretoria Geral de Recursos Humanos",
                            size: 18, // 9pt
                            font: "Arial"
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { line: 240, before: 0, after: 0 },
                        children: [
                          new TextRun({
                            text: metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br",
                            size: 16, // 8pt
                            color: "555555",
                            font: "Arial"
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // 1 linha em branco após o cabeçalho (360 twips)
          new Paragraph({ spacing: { before: 360, after: 360 } }),

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
                size: 24, // 12pt
                font: "Arial"
              })
            ]
          }),

          // 3. Corpo do Texto (Alinhamento Justificado, Entrelinha 1,5, Recuo de 1,25 cm / 708 twips)
          ...paragraphs.map(p => {
            const isBullet = p.startsWith("-") || p.startsWith("•") || p.startsWith("*") || /^\d+[\.\)]/.test(p);
            return new Paragraph({
              alignment: AlignmentType.BOTH,
              indent: isBullet ? { left: 708 } : { firstLine: 708 },
              spacing: { line: 360, before: 120, after: 120 },
              children: [
                new TextRun({
                  text: p,
                  size: 24, // 12pt
                  font: "Arial"
                })
              ]
            });
          }),

          // Espaçamento antes da data
          new Paragraph({ spacing: { before: 360, after: 180 } }),

          // 4. Local e Data (Alinhado com avanço de parágrafo de 1,25 cm)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { firstLine: 708 },
            spacing: { line: 240, before: 180, after: 360 },
            children: [
              new TextRun({
                text: metadata.locationAndDate.endsWith(".")
                  ? metadata.locationAndDate
                  : `${metadata.locationAndDate}.`,
                size: 24, // 12pt
                font: "Arial"
              })
            ]
          }),

          // 4 linhas em branco com espaçamento simples antes da assinatura (conforme regra da Unicamp)
          new Paragraph({ spacing: { line: 240, before: 480, after: 480 } }),

          // 5. Identificação da Autora ou Autor (Centralizado, Espaçamento Simples)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 40 },
            children: [
              new TextRun({
                text: metadata.authorName,
                bold: true,
                size: 24, // 12pt negrito
                font: "Arial"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 0 },
            children: [
              new TextRun({
                text: metadata.authorRole,
                size: 24, // 12pt regular
                color: "333333",
                font: "Arial"
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}
