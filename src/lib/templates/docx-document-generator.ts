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
 * Redimensiona uma imagem PNG usando Canvas (client-side)
 * Retorna os bytes da imagem redimensionada
 */
async function resizeImageToBytes(data: Uint8Array, targetWidth: number, targetHeight: number): Promise<Uint8Array> {
  if (typeof document === "undefined") return data;

  return new Promise((resolve) => {
    try {
      // Convert Uint8Array to base64 data URL
      let binary = "";
      for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = `data:image/png;base64,${base64}`;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              blob.arrayBuffer().then((buffer) => {
                resolve(new Uint8Array(buffer));
              });
            } else {
              resolve(data);
            }
          }, "image/png");
        } else {
          resolve(data);
        }
      };

      img.onerror = () => {
        resolve(data);
      };

      img.src = dataUrl;
    } catch {
      resolve(data);
    }
  });
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
  // Superior: 1,5 cm (850 dxa), Inferior: 1,5 cm (850 dxa)
  // Esquerda: 2,5 cm (1417 dxa), Direita: 2,0 cm (1134 dxa)
  // Largura útil total da folha A4 (11906 - 1417 - 1134 = 9355 dxa)
  const PAGE_WIDTH_DXA = 11906;
  const MARGIN_TOP = 850;
  const MARGIN_BOTTOM = 850;
  const MARGIN_LEFT = 1417;
  const MARGIN_RIGHT = 1134;
  const CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_LEFT - MARGIN_RIGHT; // 9355 dxa

  const LOGO_COL_WIDTH = 2800;
  const TEXT_COL_WIDTH = CONTENT_WIDTH_DXA - LOGO_COL_WIDTH; // 6555 dxa

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

  // 1. Preparação dos Logotipos do Cabeçalho
  const logoRuns: ImageRun[] = [];

  // Logotipo Unicamp - Redimensionado para 200x60 pixels
  if (!metadata.hideUnicampLogo) {
    const defaultLogoBytes = getUnicampLogoBytes();
    if (defaultLogoBytes) {
      try {
        const resizedLogo = await resizeImageToBytes(defaultLogoBytes, 200, 60);
        logoRuns.push(
          new ImageRun({
            data: resizedLogo,
            transformation: {
              width: 200,
              height: 60
            },
            type: "png"
          })
        );
      } catch (err) {}
    }
  }

  // Logotipo Customizado da Unidade - Redimensionado para 180x50 pixels
  if (metadata.customUnitLogo) {
    try {
      const customBytes = dataUrlToUint8Array(metadata.customUnitLogo);
      const resizedCustom = await resizeImageToBytes(customBytes, 180, 50);
      logoRuns.push(
        new ImageRun({
          data: resizedCustom,
          transformation: {
            width: 180,
            height: 50
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
          height: { value: 900, rule: "atLeast" },
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
                  spacing: { before: 100, after: 100 },
                  children: logoRuns.length > 0 ? logoRuns : [new TextRun({ text: "UNICAMP", bold: true, size: 24, font: "Arial" })]
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
                  spacing: { line: 276, after: 60 },
                  children: [
                    new TextRun({
                      text: metadata.unitName || "Diretoria Geral de Recursos Humanos",
                      bold: true,
                      size: 20, // 10pt
                      font: "Arial",
                      color: "111111"
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { line: 240, after: 40 },
                  children: [
                    new TextRun({
                      text: metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br",
                      size: 17, // 8.5pt
                      font: "Arial",
                      color: "555555"
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { line: 240 },
                  children: [
                    new TextRun({
                      text: "Universidade Estadual de Campinas",
                      size: 17,
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

  if (headerTable) {
    docChildren.push(headerTable);
    docChildren.push(new Paragraph({ spacing: { before: 240 } }));
  }

  const rawParagraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);

  // A. ATOS NORMATIVOS (Portaria, Resolução, Deliberação, Instrução Normativa)
  if (isNormative) {
    // Título do Ato Normativo (conforme modelo timbrado oficial)
    let title = `PORTARIA DGRH nº ${metadata.documentNumber || "01/2026"}`;
    if (docType === "resolucao") {
      title = `RESOLUÇÃO GR-nº ${metadata.documentNumber || "01/2026"}`;
    } else if (docType === "deliberacao") {
      title = `DELIBERAÇÃO CONSU-A-nº ${metadata.documentNumber || "01/2026"}`;
    } else if (docType === "instrucao-normativa") {
      title = `INSTRUÇÃO NORMATIVA DGRH nº ${metadata.documentNumber || "01/2026"}`;
    }

    // Título Alinhado à Esquerda
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26,
            font: "Arial"
          })
        ]
      })
    );

    // Ementa (Itálico, alinhada à esquerda conforme modelo oficial)
    if (metadata.ementa) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 240, before: 240, after: 240 },
          children: [
            new TextRun({
              text: metadata.ementa,
              italics: true,
              size: 24,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Preâmbulo / Fundamento Legal
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

    // Artigos
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 180 },
          children: [
            new TextRun({
              text: p,
              size: 24,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Cláusula de Vigência
    if (metadata.effectiveClause) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, before: 240, after: 240 },
          children: [
            new TextRun({
              text: metadata.effectiveClause,
              size: 24,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Local e Data
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  }

  // B. OFÍCIO E OFÍCIO CIRCULAR (conforme modelo timbrado oficial)
  else if (isLetter) {
    // Local e Data (topo, alinhado à esquerda)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Título do Ofício
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: `${docType === "oficio-circular" ? "OFÍCIO CIRCULAR" : "OFÍCIO"} DGRH nº ${metadata.documentNumber || "105/2026"}`,
            bold: true,
            size: 26,
            font: "Arial"
          })
        ]
      })
    );

    // Assunto em Destaque
    if (metadata.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 240 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 24, font: "Arial" })
          ]
        })
      );
    }

    // Destinatário (para ofícios dirigidos a órgãos externos)
    if (metadata.recipientName) {
      const recipientChildren: TextRun[] = [];
      if (metadata.recipientTitle) {
        recipientChildren.push(new TextRun({ text: metadata.recipientTitle + " ", size: 24, font: "Arial" }));
      }
      recipientChildren.push(new TextRun({ text: metadata.recipientName, bold: true, size: 24, font: "Arial" }));

      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 60 },
          children: recipientChildren
        })
      );

      if (metadata.recipientRole) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: metadata.recipientRole, size: 24, font: "Arial" })
            ]
          })
        );
      }

      if (metadata.recipientAddress) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({ text: metadata.recipientAddress, size: 22, font: "Arial", color: "555555" })
            ]
          })
        );
      }
    }

    // Vocativo
    docChildren.push(
      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: metadata.vocativo || "Senhor(a) Diretor(a),",
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Corpo
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }

    // Fecho
    docChildren.push(
      new Paragraph({
        indent: { firstLine: 708 },
        spacing: { before: 240, after: 360 },
        children: [new TextRun({ text: metadata.fecho || "Atenciosamente,", size: 24, font: "Arial" })]
      })
    );
  }

  // C. MEMORANDO (conforme modelo timbrado oficial)
  else if (isMemo) {
    // Local e Data (topo, alinhado à esquerda)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Título do Memorando
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: `MEMORANDO DGRH nº ${metadata.documentNumber || "42/2026"}`,
            bold: true,
            size: 26,
            font: "Arial"
          })
        ]
      })
    );

    // Destinatário (/Ao [Pronome de tratamento + Nome])
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 60 },
        children: [
          new TextRun({
            text: `/Ao ${metadata.recipientTitle || ""} ${metadata.recipientName || "Diretoria de Administração"}`,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Cargo do destinatário
    if (metadata.recipientRole) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 240 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: metadata.recipientRole,
              size: 24,
              font: "Arial"
            })
          ]
        })
      );
    }

    // Assunto
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: "Assunto: ",
            bold: true,
            size: 24,
            font: "Arial"
          }),
          new TextRun({
            text: metadata.memoAssunto || metadata.subject || "Encaminhamento de relatório",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Corpo do Memorando
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }

    // Saudação
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 240 },
        children: [
          new TextRun({
            text: metadata.vocativo || "Atenciosamente,",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  }

  // D. ATA DE REUNIÃO
  else if (isMinutes) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 240 },
        children: [
          new TextRun({
            text: `ATA DA ${metadata.meetingNumber?.toUpperCase() || "15ª REUNIÃO ORDINÁRIA DA COMISSÃO"}`,
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Bloco de Dados da Sessão
    docChildren.push(
      new Table({
        width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
          insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Data/Horário: ", bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: (metadata.meetingDate || "27 de agosto de 2026, às 14h00") + "  |  ", size: 20, font: "Arial" }),
                      new TextRun({ text: "Local: ", bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: metadata.meetingPlace || "Sala de Reuniões da DGRH / Virtual", size: 20, font: "Arial" })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Presidência: ", bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: (metadata.meetingPresident || "Profa. Dra. Coordenadora Geral") + "  |  ", size: 20, font: "Arial" }),
                      new TextRun({ text: "Secretaria: ", bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: metadata.meetingSecretary || "Secretário(a) da Comissão", size: 20, font: "Arial" })
                    ]
                  }),
                  ...(metadata.membersPresent ? [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Membros Presentes: ", bold: true, size: 20, font: "Arial" }),
                        new TextRun({ text: metadata.membersPresent, size: 20, font: "Arial" })
                      ]
                    })
                  ] : [])
                ]
              })
            ]
          })
        ]
      })
    );

    docChildren.push(new Paragraph({ spacing: { before: 240 } }));

    // Corpo da Ata
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }
  }

  // E. CERTIFICADO
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
            size: 26,
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
            size: 44, // 22pt
            font: "Arial",
            color: "B36B00"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 360, before: 240, after: 240 },
        children: [
          new TextRun({ text: "Certificamos que ", size: 28, font: "Arial" }),
          new TextRun({ text: metadata.targetPerson || "Nome Completo do(a) Participante", bold: true, size: 30, font: "Arial" }),
          new TextRun({ text: `, portador(a) do documento ${metadata.targetDocument || "CPF nº 000.000.000-00"}, concluiu com êxito as atividades de `, size: 28, font: "Arial" }),
          new TextRun({ text: metadata.courseName || "Capacitação em Redação Oficial e Linguagem Simples", bold: true, size: 28, font: "Arial" }),
          new TextRun({ text: `, realizado no período de ${metadata.coursePeriod || "10 a 25 de agosto de 2026"}, com carga horária total de `, size: 28, font: "Arial" }),
          new TextRun({ text: metadata.courseHours || "20 horas", bold: true, size: 28, font: "Arial" }),
          new TextRun({ text: ".", size: 28, font: "Arial" })
        ]
      })
    );
  }

  // F. DECLARAÇÃO
  else if (isDeclaracao) {
    // Título centralizado
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 360 },
        children: [
          new TextRun({
            text: "DECLARAÇÃO",
            bold: true,
            size: 28,
            font: "Arial"
          })
        ]
      })
    );

    // Corpo do texto
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }

    // Data e Local (justificado como o parágrafo do texto, logo após o conteúdo)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );

    // Assinatura (centralizada, logo abaixo da data)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 40 },
        children: [
          new TextRun({
            text: metadata.authorName || "Responsável pelo Atendimento Funcional",
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 220 },
        children: [
          new TextRun({
            text: metadata.authorRole || "Divisão de Atendimento e Benefícios - DGRH",
            size: 20,
            font: "Arial",
            color: "555555"
          })
        ]
      })
    );
  }

  // H. PARECER (conforme modelo timbrado oficial)
  else if (isParecer) {
    // Título do Parecer
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: `PARECER DGRH nº ${metadata.documentNumber || "01/2026"}`,
            bold: true,
            size: 26,
            font: "Arial"
          })
        ]
      })
    );

    // Referência
    if (metadata.referenceProcess) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 60 },
          children: [
            new TextRun({ text: "Referência: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.referenceProcess, size: 24, font: "Arial" })
          ]
        })
      );
    }

    // Interessado
    if (metadata.interestedParty) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: "Interessado: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.interestedParty, size: 24, font: "Arial" })
          ]
        })
      );
    }

    // Assunto
    if (metadata.subject) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 240 },
          children: [
            new TextRun({ text: "Assunto: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 24, font: "Arial" })
          ]
        })
      );
    }

    // Corpo do Parecer
    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }

    // Local e Data
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 60 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
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
            size: 26,
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
            new TextRun({ text: "Assunto: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: metadata.subject, size: 24, font: "Arial" })
          ]
        })
      );
    }

    for (const p of rawParagraphs) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          indent: { firstLine: 708 },
          spacing: { line: 360, after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Arial" })]
        })
      );
    }
  }

  // 4. Assinatura e Rodapé (apenas para tipos que não são Carta, Certificado, Declaração ou Memorando)
  if (!isLetter && !isCarta && !isCertificado && !isDeclaracao && !isMemo) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 400 },
        children: [
          new TextRun({
            text: metadata.locationAndDate || "Campinas, 27 de agosto de 2026.",
            size: 24,
            font: "Arial"
          })
        ]
      })
    );
  }

  // Bloco de Assinatura Centralizado (exceto para Declaração que já tem sua assinatura)
  if (!isDeclaracao) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 60 },
        children: [
          new TextRun({
            text: "____________________________________________",
            color: "666666",
            size: 20
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 240, after: 40 },
        children: [
          new TextRun({
            text: metadata.authorName || "Coordenação Geral da DGRH",
            bold: true,
            size: 24,
            font: "Arial"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 220 },
        children: [
          new TextRun({
            text: metadata.authorRole || "Diretoria Geral de Recursos Humanos",
            size: 20,
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
            margin: {
              top: MARGIN_TOP,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
              right: MARGIN_RIGHT
            }
          }
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}
