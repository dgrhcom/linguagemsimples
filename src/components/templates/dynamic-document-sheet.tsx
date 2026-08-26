"use client";

import React from "react";
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";

interface DynamicDocumentSheetProps {
  docType: DocumentType;
  text: string;
  metadata: UniversalDocumentMetadata;
  scale?: number;
  className?: string;
}

export function DynamicDocumentSheet({
  docType,
  text,
  metadata,
  scale = 1,
  className = ""
}: DynamicDocumentSheetProps) {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const formattedDate = metadata.locationAndDate.endsWith(".")
    ? metadata.locationAndDate
    : `${metadata.locationAndDate}.`;

  const isNormative = [
    "portaria",
    "resolucao",
    "deliberacao",
    "instrucao-normativa",
    "regimento",
    "regulamento",
    "ordinance",
    "resolution",
    "instruction",
    "regulation"
  ].includes(docType);

  const isLetter = ["oficio", "oficio-circular", "carta", "official-letter"].includes(docType);
  const isMemo = ["memorando", "memo"].includes(docType);
  const isMinutes = ["ata", "pauta", "minutes"].includes(docType);
  const isDeclaration = ["declaracao", "certificado", "declaration"].includes(docType);

  // Helper para obter o título principal do documento
  const getDocumentHeading = () => {
    switch (docType) {
      case "portaria":
      case "ordinance":
        return metadata.documentNumber ? `PORTARIA GR Nº ${metadata.documentNumber}` : "PORTARIA";
      case "resolucao":
      case "resolution":
        return metadata.documentNumber ? `RESOLUÇÃO GR Nº ${metadata.documentNumber}` : "RESOLUÇÃO";
      case "deliberacao":
        return metadata.documentNumber ? `DELIBERAÇÃO Nº ${metadata.documentNumber}` : "DELIBERAÇÃO";
      case "instrucao-normativa":
      case "instruction":
        return metadata.documentNumber ? `INSTRUÇÃO NORMATIVA Nº ${metadata.documentNumber}` : "INSTRUÇÃO NORMATIVA";
      case "regimento":
        return metadata.documentNumber ? `REGIMENTO INTERNO Nº ${metadata.documentNumber}` : "REGIMENTO INTERNO";
      case "regulamento":
      case "regulation":
        return metadata.documentNumber ? `REGULAMENTO Nº ${metadata.documentNumber}` : "REGULAMENTO";
      case "decisao":
        return metadata.documentNumber ? `DECISÃO Nº ${metadata.documentNumber}` : "DECISÃO";
      case "despacho":
        return metadata.documentNumber ? `DESPACHO Nº ${metadata.documentNumber}` : "DESPACHO";
      case "oficio":
      case "official-letter":
        return metadata.documentNumber ? `Ofício nº ${metadata.documentNumber}` : "Ofício";
      case "oficio-circular":
        return metadata.documentNumber ? `Ofício Circular nº ${metadata.documentNumber}` : "Ofício Circular";
      case "carta":
        return metadata.documentNumber ? `Carta nº ${metadata.documentNumber}` : "Carta";
      case "memorando":
      case "memo":
        return metadata.documentNumber ? `MEMORANDO Nº ${metadata.documentNumber}` : "MEMORANDO";
      case "pauta":
        return metadata.meetingNumber ? `PAUTA - ${metadata.meetingNumber}` : "PAUTA DA REUNIÃO";
      case "ata":
      case "minutes":
        return metadata.meetingNumber ? `ATA - ${metadata.meetingNumber}` : "ATA DA REUNIÃO";
      case "declaracao":
      case "declaration":
        return "DECLARAÇÃO";
      case "certificado":
        return "CERTIFICADO";
      case "parecer":
      case "opinion":
        return metadata.documentNumber ? `PARECER TÉCNICO Nº ${metadata.documentNumber}` : "PARECER TÉCNICO";
      case "relatorio":
      case "report":
        return "RELATÓRIO DE ATIVIDADES";
      case "informacao":
        return metadata.documentNumber ? `INFORMAÇÃO Nº ${metadata.documentNumber}` : "INFORMAÇÃO";
      case "comunicado":
      case "notice":
      default:
        return metadata.documentNumber ? `COMUNICADO Nº ${metadata.documentNumber}` : "COMUNICADO";
    }
  };

  return (
    <div
      id="printable-comunicado"
      className={`bg-white text-black shadow-2xl border border-zinc-300 rounded-sm select-text printable-document ${className}`}
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        paddingTop: "15mm",
        paddingBottom: "15mm",
        paddingLeft: "25mm",
        paddingRight: "20mm",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "12pt",
        lineHeight: "1.5",
        color: "#000000",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center"
      }}
    >
      {/* 1. Cabeçalho Institucional Oficial da Unicamp */}
      <div className="border-b border-zinc-400 pb-3 mb-6 block">
        <div className="flex items-center justify-between gap-4">
          {/* Logotipos à Esquerda */}
          <div className="flex items-center gap-3">
            {!metadata.hideUnicampLogo && (
              <img
                src="/images/logo-unicamp.svg"
                alt="Logotipo da Unicamp"
                style={{
                  height: "56px",
                  width: "auto",
                  display: "inline-block",
                  objectFit: "contain"
                }}
                className="print:inline-block"
              />
            )}

            {metadata.customUnitLogo && (
              <div className={!metadata.hideUnicampLogo ? "border-l border-zinc-300 pl-3" : ""}>
                <img
                  src={metadata.customUnitLogo}
                  alt="Logotipo da Unidade"
                  style={{
                    height: "56px",
                    width: "auto",
                    display: "inline-block",
                    objectFit: "contain"
                  }}
                  className="print:inline-block"
                />
              </div>
            )}
          </div>

          {/* Textos Institucionais à Direita */}
          <div className="text-right leading-tight space-y-1" style={{ fontSize: "10pt" }}>
            <p className="font-bold text-black">
              Universidade Estadual de Campinas
            </p>
            <p className="font-normal text-zinc-800">
              {metadata.unitName || "Diretoria Geral de Recursos Humanos"}
            </p>
            <p className="text-zinc-600 font-normal" style={{ fontSize: "8.5pt" }}>
              {metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br"}
            </p>
          </div>
        </div>
      </div>

      {/* 1 linha em branco após o cabeçalho */}
      <div className="h-4" />

      {/* 2. Seções Contextuais de Acordo com o Tipo */}
      {isNormative ? (
        // Layout de Ato Normativo (Portaria, Resolução, Deliberação, etc.)
        <div className="space-y-4 mb-6">
          <div className="text-center my-4">
            <h2 className="font-bold tracking-wide uppercase text-black" style={{ fontSize: "12pt" }}>
              {getDocumentHeading()}
            </h2>
          </div>

          {/* Ementa alinhada à direita */}
          {metadata.ementa && (
            <div className="flex justify-end my-4">
              <div
                className="w-1/2 text-justify italic text-zinc-900 border-l-2 border-zinc-300 pl-3 py-1"
                style={{ fontSize: "10pt", lineHeight: "1.3" }}
              >
                {metadata.ementa}
              </div>
            </div>
          )}

          {/* Preâmbulo / Atribuições */}
          {metadata.preamble && (
            <div style={{ textIndent: "1.25cm", fontSize: "12pt", lineHeight: "1.5" }} className="text-justify my-3 font-normal">
              {metadata.preamble}
            </div>
          )}
        </div>
      ) : isLetter ? (
        // Layout de Ofício / Carta
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-start my-3">
            <h2 className="font-bold text-black" style={{ fontSize: "12pt" }}>
              {getDocumentHeading()}
            </h2>
            <p style={{ fontSize: "11pt" }} className="text-zinc-700">
              {formattedDate}
            </p>
          </div>

          {/* Destinatário */}
          {metadata.recipientName && (
            <div className="my-4 leading-snug space-y-0.5" style={{ fontSize: "11pt" }}>
              <p className="text-zinc-700">A Sua Senhoria o(a) Senhor(a)</p>
              <p className="font-bold text-black">{metadata.recipientName}</p>
              {metadata.recipientRole && <p className="text-zinc-800">{metadata.recipientRole}</p>}
              {metadata.recipientAddress && <p className="text-zinc-600 text-xs">{metadata.recipientAddress}</p>}
            </div>
          )}

          {/* Assunto */}
          {metadata.subject && (
            <div className="my-3 font-bold text-black" style={{ fontSize: "12pt" }}>
              Assunto: <span className="font-normal text-zinc-900">{metadata.subject}</span>
            </div>
          )}

          {/* Vocativo */}
          <div style={{ textIndent: "1.25cm", fontSize: "12pt" }} className="my-3 font-normal text-black">
            {metadata.vocativo || "Senhor(a) Diretor(a),"}
          </div>
        </div>
      ) : isMemo ? (
        // Layout de Memorando
        <div className="space-y-3 mb-6 border border-zinc-300 rounded-lg p-4 bg-zinc-50/50">
          <div className="text-center font-bold text-black uppercase" style={{ fontSize: "12pt" }}>
            {getDocumentHeading()}
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
            <p><strong>PARA:</strong> {metadata.recipientName || "Setor de Destino"}</p>
            <p><strong>DE:</strong> {metadata.authorName || "Coordenação"}</p>
            <p><strong>ASSUNTO:</strong> {metadata.subject || "Comunicação Interna"}</p>
            <p><strong>DATA:</strong> {formattedDate}</p>
          </div>
        </div>
      ) : isMinutes ? (
        // Layout de Ata / Pauta
        <div className="space-y-3 mb-6 text-center">
          <h2 className="font-bold uppercase tracking-wide text-black" style={{ fontSize: "13pt" }}>
            {getDocumentHeading()}
          </h2>
          {(metadata.meetingDate || metadata.meetingPlace) && (
            <p className="text-xs text-zinc-600 italic">
              {[metadata.meetingDate, metadata.meetingPlace].filter(Boolean).join(" - ")}
            </p>
          )}
        </div>
      ) : isDeclaration ? (
        // Layout de Declaração / Certificado
        <div className="text-center my-6">
          <h2 className="font-bold tracking-widest uppercase text-black text-xl" style={{ fontSize: "14pt" }}>
            {getDocumentHeading()}
          </h2>
        </div>
      ) : (
        // Layout Padrão (Comunicado, Informação, Parecer, Relatório)
        <div className="space-y-3 mb-6">
          <div className="text-center my-4">
            <h2 className="font-bold tracking-wide uppercase text-black" style={{ fontSize: "12pt" }}>
              {getDocumentHeading()}
            </h2>
          </div>
          {metadata.subject && (
            <div className="my-2 font-bold text-black" style={{ fontSize: "12pt" }}>
              Assunto: <span className="font-normal text-zinc-900">{metadata.subject}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Corpo do Texto com Recuo de 1,25 cm e Entrelinha 1,5 */}
      <div
        className="space-y-4 text-justify"
        style={{
          fontSize: "12pt",
          lineHeight: "1.5"
        }}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => {
            const isBullet =
              p.startsWith("-") ||
              p.startsWith("•") ||
              p.startsWith("*") ||
              /^\d+[\.\)]/.test(p);

            if (isBullet) {
              return (
                <div
                  key={idx}
                  style={{ paddingLeft: "1.25cm", textIndent: "0" }}
                  className="text-left my-2"
                >
                  {p}
                </div>
              );
            }

            return (
              <p
                key={idx}
                style={{ textIndent: "1.25cm" }}
                className="my-3"
              >
                {p}
              </p>
            );
          })
        ) : (
          <p style={{ textIndent: "1.25cm" }} className="text-zinc-400 italic">
            [O texto simplificado do documento será renderizado aqui em tempo real...]
          </p>
        )}
      </div>

      {/* 4. Fecho de Correspondência (para Ofício / Carta) */}
      {isLetter && (
        <div
          className="mt-6 mb-4"
          style={{ textIndent: "1.25cm", fontSize: "12pt", lineHeight: "1.5" }}
        >
          <p>{metadata.fecho || "Atenciosamente,"}</p>
        </div>
      )}

      {/* 5. Local e Data (para documentos que levam data no rodapé) */}
      {!isLetter && !isMemo && metadata.locationAndDate && (
        <div
          className="mt-8 mb-6"
          style={{
            textIndent: "1.25cm",
            fontSize: "12pt",
            lineHeight: "1.5"
          }}
        >
          <p>{formattedDate}</p>
        </div>
      )}

      {/* 4 linhas em branco antes da assinatura */}
      <div className="h-16" />

      {/* 6. Identificação da Autora ou Autor / Signatário */}
      <div
        className="text-center space-y-1"
        style={{
          fontSize: "12pt",
          lineHeight: "1.2"
        }}
      >
        <p className="font-bold text-black">
          {metadata.authorName || "Nome da Autora ou Autor"}
        </p>
        <p className="text-zinc-800">
          {metadata.authorRole || "Cargo ou Função"}
        </p>
      </div>
    </div>
  );
}

/**
 * Backward compatibility alias para ComunicadoSheet
 */
export function ComunicadoSheet({
  text,
  metadata,
  scale = 1,
  className = ""
}: {
  text: string;
  metadata: UniversalDocumentMetadata;
  scale?: number;
  className?: string;
}) {
  return (
    <DynamicDocumentSheet
      docType="comunicado"
      text={text}
      metadata={metadata}
      scale={scale}
      className={className}
    />
  );
}
