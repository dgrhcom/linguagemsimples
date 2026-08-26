"use client";

import React from "react";
import { ComunicadoMetadata } from "@/lib/templates/docx-comunicado-generator";

interface ComunicadoSheetProps {
  text: string;
  metadata: ComunicadoMetadata;
  scale?: number;
  className?: string;
}

export function ComunicadoSheet({
  text,
  metadata,
  scale = 1,
  className = ""
}: ComunicadoSheetProps) {
  const paragraphs = text
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const formattedDate = metadata.locationAndDate.endsWith(".")
    ? metadata.locationAndDate
    : `${metadata.locationAndDate}.`;

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
      {/* 1. Cabeçalho Institucional (Div para evitar conflitos com regras de print em tags <header>) */}
      <div className="border-b border-zinc-400 pb-3 mb-6 block">
        <div className="flex items-center justify-between gap-4">
          {/* Logotipos à Esquerda */}
          <div className="flex items-center gap-3">
            {/* Logotipo da Unicamp (se não estiver ocultado) */}
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

            {/* Logotipo da Unidade / Órgão (mesma altura que o da Unicamp) */}
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
      <div className="h-6" />

      {/* 2. Identificação do Documento (Centralizado, Negrito, Caixa Alta) */}
      <div className="text-center my-6">
        <h2
          className="font-bold tracking-wide uppercase text-black"
          style={{ fontSize: "12pt" }}
        >
          {metadata.documentNumber
            ? `COMUNICADO Nº ${metadata.documentNumber}`
            : "COMUNICADO"}
        </h2>
      </div>

      {/* 3. Corpo do Texto (Alinhamento Justificado, Entrelinha 1,5, Recuo 1,25 cm) */}
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
          <p
            style={{ textIndent: "1.25cm" }}
            className="text-zinc-400 italic"
          >
            [O texto formatado do comunicado será exibido aqui em tempo real...]
          </p>
        )}
      </div>

      {/* 4. Local e Data (Alinhado com avanço de parágrafo de 1,25 cm) */}
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

      {/* 4 linhas em branco com espaçamento simples antes do nome da pessoa que assina */}
      <div className="h-16" />

      {/* 5. Identificação da Autora ou Autor (Centralizado, Espaçamento Simples) */}
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
