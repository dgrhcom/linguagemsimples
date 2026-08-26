"use client";

import React from "react";
import Image from "next/image";
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
      className={`bg-white text-zinc-900 shadow-2xl border border-zinc-300 rounded-sm select-text ${className}`}
      style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        paddingTop: "15mm",
        paddingBottom: "15mm",
        paddingLeft: "25mm",
        paddingRight: "20mm",
        boxSizing: "border-box",
        fontFamily: "'Montserrat', Arial, sans-serif",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center"
      }}
    >
      {/* 1. Cabeçalho Institucional */}
      <header className="border-b border-zinc-400 pb-3 mb-8">
        <div className="flex items-start justify-between gap-4">
          {/* Logo e Órgão à Esquerda */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 shrink-0">
              <Image
                src="/images/logo-unicamp.svg"
                alt="Logotipo Unicamp"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <div className="border-l border-zinc-300 pl-3">
              <span className="text-[11px] font-black tracking-tight text-zinc-900 block leading-tight">
                UNICAMP
              </span>
              <span className="text-[9px] font-bold text-zinc-600 block uppercase leading-tight mt-0.5">
                {metadata.unitName || "Unidade / Órgão"}
              </span>
            </div>
          </div>

          {/* Textos Institucionais à Direita */}
          <div className="text-right text-[11px] text-zinc-800 leading-tight space-y-1">
            <p className="font-bold text-zinc-900">
              Universidade Estadual de Campinas
            </p>
            <p className="font-medium text-zinc-700">
              {metadata.unitName || "Diretoria Geral de Recursos Humanos"}
            </p>
            <p className="text-[10px] text-zinc-500 font-normal">
              {metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br"}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Identificação do Documento */}
      <div className="text-center my-8">
        <h2 className="text-base sm:text-lg font-black tracking-wide text-zinc-950 uppercase">
          {metadata.documentNumber
            ? `COMUNICADO Nº ${metadata.documentNumber}`
            : "COMUNICADO"}
        </h2>
      </div>

      {/* 3. Corpo do Texto com Recuo de Primeira Linha (1,25cm / 32px) */}
      <main className="space-y-4 text-xs sm:text-sm text-zinc-900 leading-relaxed text-justify">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => {
            const isBullet =
              p.startsWith("-") ||
              p.startsWith("•") ||
              p.startsWith("*") ||
              /^\d+[\.\)]/.test(p);

            if (isBullet) {
              return (
                <div key={idx} className="pl-6 text-left my-1 font-medium">
                  {p}
                </div>
              );
            }

            return (
              <p
                key={idx}
                style={{ textIndent: "1.25cm" }}
                className="leading-relaxed"
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
            [O conteúdo do comunicado será exibido aqui em tempo real conforme as edições e simplificações...]
          </p>
        )}
      </main>

      {/* 4. Local e Data */}
      <div
        className="mt-10 mb-14 text-xs sm:text-sm text-zinc-900"
        style={{ textIndent: "1.25cm" }}
      >
        <p>{formattedDate}</p>
      </div>

      {/* 5. Identificação e Assinatura da Autora ou Autor */}
      <footer className="mt-12 text-center space-y-1">
        <div className="w-48 border-t border-zinc-400 mx-auto mb-2 opacity-60" />
        <p className="text-xs sm:text-sm font-bold text-zinc-950">
          {metadata.authorName || "Nome da Autora ou Autor"}
        </p>
        <p className="text-xs text-zinc-600">
          {metadata.authorRole || "Cargo ou Função"}
        </p>
      </footer>
    </div>
  );
}
