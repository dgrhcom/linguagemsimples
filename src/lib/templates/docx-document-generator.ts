import {
  Document,
  Header,
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
import documentTypesData from "@/data/document-types/document-types.json";
import { UNICAMP_LOGO_BASE64 } from "@/data/unicamp-logo-base64";

export type { UniversalDocumentMetadata, UniversalDocumentMetadata as ComunicadoMetadata };

/**
 * Converte Data URL (Base64) em Uint8Array para o ImageRun do docx
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Busca o PNG oficial da Unicamp em base64 nativo seguro para client e server
 */
function getUnicampLogoBytes(): Uint8Array | null {
  try {
    return dataUrlToUint8Array(UNICAMP_LOGO_BASE64);
  } catch (e) {
    return null;
  }
}


/**
 * Gera documento Word (.DOCX) profissional nos padrões rigorosos da Unicamp
 */
export async function generateDocumentDocx(
  docType: DocumentType = "comunicado",
  text: string,
  metadata: UniversalDocumentMetadata
): Promise<Blob> {
  // Margens Oficiais da Unicamp (em DXA: 1 cm = 567 dxa):
  // Superior: 2,5 cm, Inferior: 2,5 cm
  // Esquerda: 3,0 cm, Direita: 2,0 cm
  const MARGIN_TOP = 1417;    // 2.5 cm
  const MARGIN_BOTTOM = 1417; // 2.5 cm
  const MARGIN_LEFT = 1701;   // 3.0 cm
  const MARGIN_RIGHT = 1134;  // 2.0 cm
  const CONTENT_WIDTH_DXA = 11906 - MARGIN_LEFT - MARGIN_RIGHT; // 9071 dxa

  const LOGO_COL_WIDTH = 3400;  // Espaço flexível para Unicamp + Logo da Unidade
  const TEXT_COL_WIDTH = CONTENT_WIDTH_DXA - LOGO_COL_WIDTH;

  const isNormative = [
    "portaria", "resolucao", "deliberacao", "instrucao-normativa",
    "ordinance", "resolution", "instruction", "regulation"
  ].includes(docType);

  const isRegimentoOuRegulamento = ["regimento", "regulamento"].includes(docType);
  const isLetter = ["oficio", "oficio-circular", "official-letter"].includes(docType);
  const isCarta = ["carta"].includes(docType);
  const isMemo = ["memorando", "memo"].includes(docType);
  const isMinutes = ["ata", "minutes"].includes(docType);
  const isPauta = ["pauta"].includes(docType);
  const isParecer = ["parecer", "opinion"].includes(docType);
  const isDecisaoOuDespacho = ["decisao", "despacho"].includes(docType);
  const isInformacao = ["informacao"].includes(docType);
  const isDeclaracao = ["declaracao", "declaration"].includes(docType);
  const isCertificado = ["certificado"].includes(docType);

  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];

/**
 * Detecta as dimensões nativas (largura e altura) de uma imagem em Base64 / Data URL
 */
function getImageDimensionsFromDataUrl(dataUrl: string): { width: number; height: number } {
  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // 1. Verificar se é PNG (Assinatura: 0x89 0x50 0x4E 0x47)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }

    // 2. Verificar se é JPEG (Assinatura: 0xFF 0xD8)
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      let offset = 2;
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) break;
        const marker = bytes[offset + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
          const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
          if (width > 0 && height > 0) {
            return { width, height };
          }
        }
        const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
        offset += 2 + length;
      }
    }
  } catch (err) {}

  return { width: 120, height: 40 };
}

  // 1. Preparação dos Logotipos do Cabeçalho
  const logoRuns: ImageRun[] = [];

  // Logotipo Unicamp: Altura 40px, Largura 36px (proporção oficial)
  if (!metadata.hideUnicampLogo) {
    const defaultLogoBytes = getUnicampLogoBytes();
    if (defaultLogoBytes) {
      try {
        logoRuns.push(
          new ImageRun({
            data: defaultLogoBytes,
            transformation: {
              width: 36,
              height: 40
            },
            type: "jpg"
          })
        );
      } catch (err) {}
    }
  }

  // Logotipo Customizado da Unidade: Altura 40px (idêntica ao logo da Unicamp),
  // e Largura calculada PROPORCIONALMENTE às dimensões originais da imagem
  if (metadata.customUnitLogo) {
    try {
      const customBytes = dataUrlToUint8Array(metadata.customUnitLogo);
      const originalDim = getImageDimensionsFromDataUrl(metadata.customUnitLogo);
      const TARGET_HEIGHT = 40; // Mesma altura do logotipo Unicamp
      const aspectRatio = originalDim.width / (originalDim.height || 40);
      const targetWidth = Math.max(20, Math.min(200, Math.round(TARGET_HEIGHT * aspectRatio)));

      logoRuns.push(
        new ImageRun({
          data: customBytes,
          transformation: {
            width: targetWidth,
            height: TARGET_HEIGHT
          },
          type: "png"
        })
      );
    } catch (err) {}
  }

  // 2. Construção da Tabela de Cabeçalho Institucional Oficial
  let headerTable: Table | null = null;

  if (!isCertificado) {
    headerTable = new Table({
      width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          height: { value: 720, rule: "atLeast" },
          children: [
            // Coluna Esquerda: Logotipos
            new TableCell({
              width: { size: LOGO_COL_WIDTH, type: WidthType.DXA },
              verticalAlign: "center",
              borders: {
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 60, after: 60 },
                  children: logoRuns.length > 0 ? logoRuns : [new TextRun({ text: "UNICAMP", bold: true, size: 20, font: "Arial" })]
                })
              ]
            }),
            // Coluna Direita: Texto da Unidade
            new TableCell({
              width: { size: TEXT_COL_WIDTH, type: WidthType.DXA },
              verticalAlign: "center",
              borders: {
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE }
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { line: 240, after: 40 },
                  children: [
                    new TextRun({
                      text: metadata.unitName || "Diretoria Geral de Recursos Humanos",
                      bold: true,
                      size: 18, // 9pt
                      font: "Arial",
                      color: "111111"
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { line: 220, after: 20 },
                  children: [
                    new TextRun({
                      text: metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br",
                      size: 15, // 7.5pt
                      font: "Arial",
                      color: "555555"
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { line: 220 },
                  children: [
                    new TextRun({
                      text: "Universidade Estadual de Campinas",
                      size: 15,
                      font: "Arial",
                      color: "777777"
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  }

  // 3. Montagem dos Filhos do Documento conforme o Tipo
  const docChildren: (Paragraph | Table)[] = [];

  // A. ATOS NORMATIVOS
  if (isNormative) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: docType === "portaria" ? `PORTARIA DGRH nº ${metadata.documentNumber || "01/2026"}` :
                  docType === "resolucao" ? `RESOLUÇÃO GR-nº ${metadata.documentNumber || "01/2026"}` :
                  docType === "deliberacao" ? `DELIBERAÇÃO CONSU-A-nº ${metadata.documentNumber || "01/2026"}` :
                  `INSTRUÇÃO NORMATIVA DGRH nº ${metadata.documentNumber || "01/2026"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    if (metadata.ementa) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: metadata.ementa,
              italics: true,
              size: 20,
              font: "Arial",
              color: "333333"
            })
          ]
        })
      );
    }

    if (metadata.preamble) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { before: 120, after: 120, line: 360 },
          children: [new TextRun({ text: metadata.preamble, size: 22, font: "Arial" })]
        })
      );
    }

    // Corpo do documento
    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }

    if (metadata.effectiveClause) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { before: 240, after: 120, line: 360 },
          children: [new TextRun({ text: metadata.effectiveClause, size: 22, font: "Arial" })]
        })
      );
    }

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );
  }

  // B. REGIMENTO E REGULAMENTO
  else if (isRegimentoOuRegulamento) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: metadata.regimentoTitle || (docType === "regimento" ? "REGIMENTO INTERNO DA UNIDADE" : "REGULAMENTO DO PROGRAMA"),
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      const isTitle = /^(TÍTULO|CAPÍTULO|SEÇÃO)/i.test(p);
      docChildren.push(
        new Paragraph({
          alignment: isTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          indent: isTitle ? undefined : { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), bold: isTitle, size: 22, font: "Arial" })]
        })
      );
    }
  }

  // C. OFÍCIO E OFÍCIO CIRCULAR
  else if (isLetter) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 180 },
        children: [
          new TextRun({
            text: `${docType === "oficio-circular" ? "OFÍCIO CIRCULAR" : "OFÍCIO"} DGRH nº ${metadata.documentNumber || "105/2026"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    if (metadata.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 22, font: "Arial" })
          ]
        })
      );
    }

    // Destinatário
    if (metadata.recipientTitle || metadata.recipientName) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 60 },
          children: [
            new TextRun({ text: metadata.recipientTitle || "", size: 22, font: "Arial" }),
            new TextRun({ text: metadata.recipientName || "Nome do Destinatário", bold: true, size: 22, font: "Arial" })
          ]
        })
      );
      if (metadata.recipientRole) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: metadata.recipientRole, size: 22, font: "Arial" })]
          })
        );
      }
      if (metadata.recipientAddress) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: metadata.recipientAddress, size: 18, font: "Arial", color: "555555" })]
          })
        );
      }
    }

    // Vocativo
    docChildren.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: metadata.vocativo || "Senhor(a) Diretor(a),",
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    // Corpo
    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }

    // Fecho
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 567 },
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: metadata.fecho || "Atenciosamente,",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );
  }

  // D. MEMORANDO
  else if (isMemo) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 180 },
        children: [
          new TextRun({
            text: `MEMORANDO DGRH nº ${metadata.documentNumber || "42/2026"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    if (metadata.recipientName) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `/Ao ${metadata.recipientTitle || ""} ${metadata.recipientName}`, size: 22, font: "Arial" })
          ]
        })
      );
    }

    if (metadata.memoAssunto || metadata.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: metadata.memoAssunto || metadata.subject || "", size: 22, font: "Arial" })
          ]
        })
      );
    }

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }

    docChildren.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: metadata.vocativo || "Atenciosamente,", size: 22, font: "Arial" })
        ]
      })
    );
  }

  // E. ATA DE REUNIÃO
  else if (isMinutes) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: `ATA DA ${metadata.meetingNumber?.toUpperCase() || "15ª REUNIÃO ORDINÁRIA DA COMISSÃO"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }
  }

  // F. PARECER
  else if (isParecer) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: `PARECER DGRH nº ${metadata.documentNumber || "01/2026"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );
  }

  // G. CERTIFICADO
  else if (isCertificado) {
    if (logoRuns.length > 0) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 240 },
          children: logoRuns
        })
      );
    }

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: "UNIVERSIDADE ESTADUAL DE CAMPINAS",
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 360 },
        children: [
          new TextRun({
            text: "CERTIFICADO",
            bold: true,
            size: 36,
            font: "Arial",
            color: "B36B00"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, before: 240, after: 240 },
        children: [
          new TextRun({ text: "Certificamos que ", size: 22, font: "Arial" }),
          new TextRun({ text: metadata.targetPerson || "Nome Completo do(a) Participante", bold: true, size: 24, font: "Arial" }),
          new TextRun({ text: `, portador(a) do documento ${metadata.targetDocument || "CPF nº 000.000.000-00"}, concluiu com êxito as atividades de `, size: 22, font: "Arial" }),
          new TextRun({ text: metadata.courseName || "Capacitação em Redação Oficial e Linguagem Simples", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: `, realizado no período de ${metadata.coursePeriod || "10 a 25 de agosto de 2026"}, com carga horária total de `, size: 22, font: "Arial" }),
          new TextRun({ text: metadata.courseHours || "20 horas", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: ".", size: 22, font: "Arial" })
        ]
      })
    );
  }

  // H. DECLARAÇÃO
  else if (isDeclaracao) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 360 },
        children: [
          new TextRun({
            text: "DECLARAÇÃO",
            bold: true,
            size: 26,
            font: "Arial"
          })
        ]
      })
    );

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );
  }

  // I. DEMAIS MODELOS (Comunicado, Relatório, etc.)
  else {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: `${currentTypeInfo.label.toUpperCase()} DGRH Nº ${metadata.documentNumber || "01/2026"}`,
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      })
    );

    if (metadata.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 240 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 22, font: "Arial" })
          ]
        })
      );
    }

    const rawParagraphs = text.split(/\n+/).filter(p => p.trim());
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 567 },
          spacing: { line: 360, after: 120 },
          children: [new TextRun({ text: p.trim(), size: 22, font: "Arial" })]
        })
      );
    }
  }

  // 4. Rodapé do Documento (Local, Data e Assinatura)
  if (!isCertificado && !isLetter && !isCarta && !isDeclaracao) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 480, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 22,
            font: "Arial"
          })
        ]
      })
    );
  }

  if (!isDeclaracao) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 480, after: 60 },
        children: [
          new TextRun({ text: "\n\n", size: 22, font: "Arial" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: "___________________________________",
            size: 22,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: metadata.authorName || "Coordenação Geral da DGRH",
            bold: true,
            size: 22,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: metadata.authorRole || "Diretoria Geral de Recursos Humanos",
            size: 18,
            font: "Arial",
            color: "555555"
          })
        ]
      })
    );
  }

  // 5. Instanciação e Empacotamento do Documento DOCX
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838
            },
            margin: {
              top: headerTable ? 2268 : MARGIN_TOP,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
              right: MARGIN_RIGHT,
              header: 720
            }
          }
        },
        headers: headerTable
          ? {
              default: new Header({
                children: [headerTable]
              })
            }
          : undefined,
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}
