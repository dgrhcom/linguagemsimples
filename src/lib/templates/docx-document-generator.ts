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
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";

export type { UniversalDocumentMetadata, UniversalDocumentMetadata as ComunicadoMetadata };


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

/**
 * Gerador Universal de DOCX para todos os tipos de documentos da Unicamp
 */
export async function generateDocumentDocx(
  docType: DocumentType,
  text: string,
  metadata: UniversalDocumentMetadata
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

  // Larguras exatas em DXA para A4
  const leftColWidth = 4200; // ~7,4 cm
  const rightColWidth = 5155; // ~9,1 cm
  const totalTableWidth = leftColWidth + rightColWidth; // 9355 dxa

  const isNormative = ["portaria", "resolucao", "deliberacao", "instrucao-normativa", "regimento", "regulamento", "ordinance", "resolution", "instruction", "regulation"].includes(docType);
  const isLetter = ["oficio", "oficio-circular", "carta", "official-letter"].includes(docType);
  const isMemo = ["memorando", "memo"].includes(docType);
  const isMinutes = ["ata", "pauta", "minutes"].includes(docType);
  const isDeclaration = ["declaracao", "certificado", "declaration"].includes(docType);

  const docChildren: (Paragraph | Table)[] = [];

  // 1. Cabeçalho Institucional
  docChildren.push(
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
    })
  );

  docChildren.push(new Paragraph({ spacing: { before: 360, after: 360 } }));

  // 2. Título / Identificação do Documento conforme o Tipo
  if (isNormative) {
    const typeTitle = docType === "portaria" || docType === "ordinance"
      ? "PORTARIA"
      : docType === "resolucao" || docType === "resolution"
      ? "RESOLUÇÃO"
      : docType === "deliberacao"
      ? "DELIBERAÇÃO"
      : docType === "instrucao-normativa" || docType === "instruction"
      ? "INSTRUÇÃO NORMATIVA"
      : docType === "regimento"
      ? "REGIMENTO"
      : docType === "regulamento" || docType === "regulation"
      ? "REGULAMENTO"
      : "ATO NORMATIVO";

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: metadata.documentNumber ? `${typeTitle} Nº ${metadata.documentNumber}` : typeTitle,
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Ementa à direita
    if (metadata.ementa) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { left: 4500 }, // ~8 cm à direita
          spacing: { line: 240, before: 180, after: 360 },
          children: [

            new TextRun({
              text: metadata.ementa,
              italics: true,
              size: 20, // 10pt
              font: "Arial"
            })
          ]
        })
      );
    }

    // Preâmbulo
    if (metadata.preamble) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, before: 180, after: 240 },
          children: [
            new TextRun({
              text: metadata.preamble,
              size: 24,
              font: "Arial"
            })
          ]
        })
      );
    }
  } else if (isLetter) {
    // Ofício / Carta
    const letterTitle = docType === "oficio-circular"
      ? "OFÍCIO CIRCULAR"
      : docType === "carta"
      ? "CARTA"
      : "OFÍCIO";

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: metadata.documentNumber ? `${letterTitle} Nº ${metadata.documentNumber}` : letterTitle,
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Destinatário
    if (metadata.recipientName) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, before: 100, after: 40 },
          children: [
            new TextRun({ text: "A Sua Senhoria o(a) Senhor(a)", size: 22, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, before: 0, after: 40 },
          children: [
            new TextRun({ text: metadata.recipientName, bold: true, size: 22, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, before: 0, after: 40 },
          children: [
            new TextRun({ text: metadata.recipientRole || "", size: 20, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, before: 0, after: 200 },
          children: [
            new TextRun({ text: metadata.recipientAddress || "", size: 20, color: "444444", font: "Arial" })
          ]
        })
      );
    }

    // Assunto
    if (metadata.subject) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 100, after: 200 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 24, font: "Arial" })
          ]
        })
      );
    }

    // Vocativo
    const voc = metadata.vocativo || "Senhor(a) Diretor(a),";
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        indent: { firstLine: 708 },
        spacing: { before: 150, after: 250 },
        children: [
          new TextRun({ text: voc, size: 24, font: "Arial" })
        ]
      })
    );
  } else if (isMemo) {
    // Memorando
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: metadata.documentNumber ? `MEMORANDO Nº ${metadata.documentNumber}` : "MEMORANDO",
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240, before: 50, after: 50 },
        children: [
          new TextRun({ text: "PARA: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: metadata.recipientName || "Setor de Destino", size: 22, font: "Arial" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240, before: 50, after: 50 },
        children: [
          new TextRun({ text: "DE: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: metadata.authorName || "Coordenação", size: 22, font: "Arial" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240, before: 50, after: 200 },
        children: [
          new TextRun({ text: "ASSUNTO: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: metadata.subject || "Comunicação Interna", size: 22, font: "Arial" })
        ]
      })
    );
  } else if (isMinutes) {
    // Ata / Pauta
    const minTitle = docType === "pauta" ? "PAUTA" : "ATA";
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: metadata.meetingNumber ? `${minTitle} - ${metadata.meetingNumber}` : minTitle,
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  } else if (isDeclaration) {
    const decTitle = docType === "certificado" ? "CERTIFICADO" : "DECLARAÇÃO";
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
        children: [
          new TextRun({
            text: decTitle,
            bold: true,
            size: 28, // 14pt
            font: "Arial"
          })
        ]
      })
    );
  } else {
    // Comunicado / Geral
    docChildren.push(
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
            font: "Arial"
          })
        ]
      })
    );
  }

  // 3. Corpo do Texto (Parágrafos com recuo de 1,25 cm e entrelinha 1,5)
  paragraphs.forEach(p => {
    const isBullet = p.startsWith("-") || p.startsWith("•") || p.startsWith("*") || /^\d+[\.\)]/.test(p);
    docChildren.push(
      new Paragraph({
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
      })
    );
  });

  // 4. Fecho de Correspondência (para Ofício / Carta)
  if (isLetter) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        indent: { firstLine: 708 },
        spacing: { before: 240, after: 180 },
        children: [
          new TextRun({
            text: metadata.fecho || "Atenciosamente,",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  }

  // Espaçamento antes da data
  docChildren.push(new Paragraph({ spacing: { before: 240, after: 120 } }));

  // 5. Local e Data
  if (metadata.locationAndDate) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        indent: { firstLine: 708 },
        spacing: { line: 240, before: 120, after: 360 },
        children: [
          new TextRun({
            text: metadata.locationAndDate.endsWith(".")
              ? metadata.locationAndDate
              : `${metadata.locationAndDate}.`,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  }

  // 4 linhas em branco antes da assinatura
  docChildren.push(new Paragraph({ spacing: { line: 240, before: 480, after: 480 } }));

  // 6. Assinatura Centralizada
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, before: 0, after: 40 },
      children: [
        new TextRun({
          text: metadata.authorName || "Nome da Autora ou Autor",
          bold: true,
          size: 24,
          font: "Arial"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, before: 0, after: 0 },
      children: [
        new TextRun({
          text: metadata.authorRole || "Cargo ou Função",
          size: 24,
          color: "333333",
          font: "Arial"
        })
      ]
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 24,
            color: "000000"
          },
          paragraph: {
            spacing: {
              line: 360
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
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Backward compatibility alias para generateComunicadoDocx
 */
export async function generateComunicadoDocx(
  text: string,
  metadata: UniversalDocumentMetadata
): Promise<Blob> {
  return generateDocumentDocx("comunicado", text, metadata);
}
