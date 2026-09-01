"use client";

import React from "react";
import Image from "next/image";
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";

import { DocumentHeader } from "./document-header";
import { UNICAMP_LOGO_JPG_DATA_URL } from "@/data/unicamp-logo-base64";

/**
 * Renderiza texto inline com suporte a **negrito** e *itálico*
 */
export function FormattedInline({ text }: { text: string }) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-bold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return <>{parts}</>;
}

/**
 * Renderiza parágrafos com suporte a listas com marcadores e listas numeradas
 */
export function FormattedParagraphs({
  text,
  paragraphClassName = "text-xs text-zinc-900 leading-[1.6] text-justify indent-8 font-normal"
}: {
  text: string;
  paragraphClassName?: string;
}) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const elements: React.ReactNode[] = [];
  let currentList: { type: "bullet" | "numbered"; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === "bullet") {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-outside my-2 pl-6 space-y-1 text-xs text-zinc-900 leading-[1.6]">
          {currentList.items.map((item, idx) => (
            <li key={idx}><FormattedInline text={item} /></li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-outside my-2 pl-6 space-y-1 text-xs text-zinc-900 leading-[1.6]">
          {currentList.items.map((item, idx) => (
            <li key={idx}><FormattedInline text={item} /></li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)$/);

    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numMatch) {
      if (!currentList || currentList.type !== "numbered") {
        flushList();
        currentList = { type: "numbered", items: [] };
      }
      currentList.items.push(numMatch[2]);
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className={paragraphClassName}>
          <FormattedInline text={line} />
        </p>
      );
    }
  }
  flushList();

  return <div className="space-y-3">{elements}</div>;
}

interface DynamicDocumentSheetProps {
  text: string;
  metadata: UniversalDocumentMetadata;
  docType?: DocumentType;
}

export function DynamicDocumentSheet({
  text,
  metadata,
  docType = "comunicado"
}: DynamicDocumentSheetProps) {
  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];

  // Categorização do tipo de documento
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
  const isRelatorio = ["relatorio", "report"].includes(docType);
  const isDeclaracao = ["declaracao", "declaration"].includes(docType);
  const isCertificado = ["certificado"].includes(docType);

  return (

    <div
      id="printable-document-sheet"
      className="bg-white text-zinc-900 border border-zinc-300 w-full max-w-[210mm] min-h-[297mm] mx-auto p-[15mm_20mm_15mm_25mm] print:p-0 print:border-none print:shadow-none font-sans select-text flex flex-col justify-between"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* CABEÇALHO INSTITUCIONAL OFICIAL UNIFICADO (Apenas se não for Certificado) */}
        {/* ========================================================================= */}
        {!isCertificado && <DocumentHeader metadata={metadata} />}

        {/* ========================================================================= */}
        {/* 1. ATOS NORMATIVOS (Portaria, Resolução, Deliberação, Instrução Normativa) */}
        {/* ========================================================================= */}
        {isNormative && (
          <div className="space-y-6 pt-2">
            {/* Título do Ato Normativo (conforme modelo timbrado oficial) */}
            <div>
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                {docType === "portaria" && `PORTARIA DGRH nº ${metadata.documentNumber || "01/2026"}`}
                {docType === "resolucao" && `RESOLUÇÃO GR-nº ${metadata.documentNumber || "01/2026"}`}
                {docType === "deliberacao" && `DELIBERAÇÃO CONSU-A-nº ${metadata.documentNumber || "01/2026"}`}
                {docType === "instrucao-normativa" && `INSTRUÇÃO NORMATIVA DGRH nº ${metadata.documentNumber || "01/2026"}`}
              </h2>
            </div>

            {/* Ementa (em itálico, alinhada à esquerda) */}
            {metadata.ementa && (
              <div className="text-xs text-zinc-800 italic leading-relaxed pt-2">
                {metadata.ementa}
              </div>
            )}

            {/* Preâmbulo / Fundamento Legal */}
            {metadata.preamble && (
              <p className="text-xs text-zinc-900 leading-relaxed text-justify indent-8 pt-2">
                {metadata.preamble}
              </p>
            )}

            {/* Artigos e Parágrafos */}
            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>

            {/* Cláusula de Vigência */}
            {metadata.effectiveClause && (
              <p className="text-xs text-zinc-900 leading-relaxed text-justify indent-8 pt-2">
                <FormattedInline text={metadata.effectiveClause} />
              </p>
            )}

            {/* Local e Data */}
            <div className="text-left text-xs text-zinc-700 font-medium pt-4">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. REGIMENTO E REGULAMENTO */}
        {/* ========================================================================= */}
        {isRegimentoOuRegulamento && (
          <div className="space-y-6 pt-2">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                {metadata.regimentoTitle || (docType === "regimento" ? "REGIMENTO INTERNO DA UNIDADE" : "REGULAMENTO DO PROGRAMA")}
              </h2>
              <p className="text-xs text-zinc-600 font-bold uppercase">
                {metadata.unitName || "Universidade Estadual de Campinas"}
              </p>
            </div>

            <div className="pt-2">
              <FormattedParagraphs text={text} />
            </div>

            {metadata.effectiveClause && (
              <p className="text-xs text-zinc-900 leading-relaxed text-justify indent-8 pt-2">
                <FormattedInline text={metadata.effectiveClause} />
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. OFÍCIO E OFÍCIO CIRCULAR (conforme modelo timbrado oficial) */}
        {/* ========================================================================= */}
        {isLetter && (
          <div className="space-y-5 pt-1">
            {/* Local e Data (topo) */}
            <div className="text-left text-xs text-zinc-700 font-medium">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>

            {/* Título do Ofício */}
            <div className="border-b border-zinc-300 pb-2">
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                {docType === "oficio-circular" ? "OFÍCIO CIRCULAR" : "OFÍCIO"} DGRH nº {metadata.documentNumber || "105/2026"}
              </h2>
            </div>

            {/* Assunto em Destaque */}
            {metadata.subject && (
              <div className="text-xs text-zinc-900 pt-2">
                <span className="font-black text-black">Assunto: </span>
                <span className="font-normal"><FormattedInline text={metadata.subject} /></span>
              </div>
            )}

            {/* Bloco de Destinatário */}
            <div className="text-xs text-zinc-900 space-y-0.5 pt-2">
              {metadata.recipientTitle && <p className="text-zinc-600">{metadata.recipientTitle}</p>}
              <p className="font-bold text-black">{metadata.recipientName || "Nome do Destinatário"}</p>
              {metadata.recipientRole && <p className="font-medium">{metadata.recipientRole}</p>}
              {metadata.recipientAddress && (
                <p className="text-zinc-600 text-[11px] leading-tight pt-0.5">{metadata.recipientAddress}</p>
              )}
            </div>

            {/* Vocativo Formal */}
            <div className="text-xs font-bold text-black pt-2">
              {metadata.vocativo || "Senhor(a) Diretor(a),"}
            </div>

            {/* Corpo do Ofício */}
            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>

            {/* Fecho Padrão */}
            <div className="text-xs text-zinc-900 indent-8 pt-2 font-normal">
              {metadata.fecho || "Atenciosamente,"}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CARTA */}
        {/* ========================================================================= */}
        {isCarta && (
          <div className="space-y-5 pt-1">
            <div className="text-right text-xs text-zinc-700 font-medium">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>

            {/* Bloco de Destinatário */}
            <div className="text-xs text-zinc-900 space-y-0.5 pt-2">
              {metadata.recipientTitle && <p className="text-zinc-600">{metadata.recipientTitle}</p>}
              <p className="font-bold text-black">{metadata.recipientName || "Nome do Destinatário"}</p>
              <p className="font-medium">{metadata.recipientRole || "Cargo / Função"}</p>
              {metadata.recipientAddress && (
                <p className="text-zinc-600 text-[11px] leading-tight pt-0.5">{metadata.recipientAddress}</p>
              )}
            </div>

            {/* Assunto */}
            {metadata.subject && (
              <div className="text-xs text-zinc-900 pt-1">
                <span className="font-black text-black">Assunto: </span>
                <span className="font-normal"><FormattedInline text={metadata.subject} /></span>
              </div>
            )}

            <div className="text-xs font-bold text-black pt-2">
              {metadata.vocativo || "Prezado(a) Professor(a),"}
            </div>

            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>

            <div className="text-xs text-zinc-900 indent-8 pt-2 font-normal">
              {metadata.fecho || "Cordialmente,"}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. MEMORANDO (conforme modelo timbrado oficial) */}
        {/* ========================================================================= */}
        {isMemo && (
          <div className="space-y-5 pt-1">
            {/* Local e Data (topo) */}
            <div className="text-left text-xs text-zinc-700 font-medium">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>

            {/* Título do Memorando */}
            <div className="border-b-2 border-zinc-900 pb-2">
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                MEMORANDO DGRH nº {metadata.documentNumber || "42/2026"}
              </h2>
            </div>

            {/* Destinatário */}
            <div className="text-xs text-zinc-900 space-y-0.5 pt-2">
              <p>
                /Ao {metadata.recipientTitle || ""} {metadata.recipientName || "Diretoria de Administração"}
              </p>
              {metadata.recipientRole && (
                <p className="pl-6">{metadata.recipientRole}</p>
              )}
            </div>

            {/* Assunto */}
            <div className="text-xs text-zinc-900 pt-2">
              <span className="font-bold text-black">Assunto: </span>
              <span className="font-normal">{metadata.memoAssunto || metadata.subject || "Encaminhamento de relatório de treinamento"}</span>
            </div>

            {/* Corpo do Memorando */}
            <div className="pt-2">
              <FormattedParagraphs text={text} />
            </div>

            {/* Saudação */}
            <div className="text-xs text-zinc-900 pt-2">
              {metadata.vocativo || "Atenciosamente,"}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ATA DE REUNIÃO */}
        {/* ========================================================================= */}
        {isMinutes && (
          <div className="space-y-5 pt-1">
            <div className="border-b border-zinc-300 pb-3">
              <h2 className="text-sm font-black text-black uppercase tracking-wide">
                ATA DA {metadata.meetingNumber?.toUpperCase() || "15ª REUNIÃO ORDINÁRIA DA COMISSÃO"}
              </h2>
            </div>

            {/* Tabela de Dados da Sessão */}
            <div className="border border-zinc-300 text-[11px] leading-tight">
              <div className="grid grid-cols-2 gap-0">
                <div className="border-r border-b border-zinc-300 p-2">
                  <strong className="text-black">Data/Horário:</strong>
                </div>
                <div className="border-b border-zinc-300 p-2">
                  {metadata.meetingDate || "27 de agosto de 2026, às 14h00"}
                </div>
                <div className="border-r border-b border-zinc-300 p-2">
                  <strong className="text-black">Local:</strong>
                </div>
                <div className="border-b border-zinc-300 p-2">
                  {metadata.meetingPlace || "Sala de Reuniões da DGRH / Virtual"}
                </div>
                <div className="border-r border-b border-zinc-300 p-2">
                  <strong className="text-black">Presidência:</strong>
                </div>
                <div className="border-b border-zinc-300 p-2">
                  {metadata.meetingPresident || "Profa. Dra. Coordenadora Geral"}
                </div>
                <div className="border-r border-b border-zinc-300 p-2">
                  <strong className="text-black">Secretário(a):</strong>
                </div>
                <div className="border-b border-zinc-300 p-2">
                  {metadata.meetingSecretary || "Secretário(a) da Comissão"}
                </div>
                {metadata.membersPresent && (
                  <>
                    <div className="border-r border-b border-zinc-300 p-2">
                      <strong className="text-black">Membros Presentes:</strong>
                    </div>
                    <div className="border-b border-zinc-300 p-2">
                      {metadata.membersPresent}
                    </div>
                  </>
                )}
                {metadata.membersAbsent && (
                  <>
                    <div className="border-r border-zinc-300 p-2">
                      <strong className="text-black">Ausências Justificadas:</strong>
                    </div>
                    <div className="p-2">
                      {metadata.membersAbsent}
                    </div>
                  </>
                )}
                {!metadata.membersPresent && !metadata.membersAbsent && (
                  <>
                    <div className="border-r border-zinc-300 p-2">
                      <strong className="text-black">Membros Presentes:</strong>
                    </div>
                    <div className="p-2">
                      {metadata.membersPresent || "12"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Texto da Ata */}
            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>

            {/* Encerramento */}
            <p className="text-xs text-zinc-800 leading-relaxed text-justify indent-8 italic">
              Nada mais havendo a tratar, a Presidência deu por encerrada a reunião, da qual eu, Secretário(a), lavrei a presente ata que, após lida e aprovada, vai assinada por todos os presentes.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. PAUTA DE REUNIÃO */}
        {/* ========================================================================= */}
        {isPauta && (
          <div className="space-y-5 pt-1">
            <div className="border-b border-zinc-300 pb-3">
              <h2 className="text-sm font-black text-black uppercase tracking-wide">
                PAUTA DA {metadata.meetingNumber?.toUpperCase() || "12ª REUNIÃO ORDINÁRIA"}
              </h2>
            </div>

            <div className="border border-zinc-300 text-[11px] leading-tight">
              <div className="grid grid-cols-2 gap-0">
                <div className="border-r border-b border-zinc-300 p-2">
                  <strong className="text-black">Data/Horário:</strong>
                </div>
                <div className="border-b border-zinc-300 p-2">
                  {metadata.meetingDate || "02 de setembro de 2026, às 09h30"}
                </div>
                <div className="border-r border-zinc-300 p-2">
                  <strong className="text-black">Local:</strong>
                </div>
                <div className="p-2">
                  {metadata.meetingPlace || "Sala de Reuniões nº 2 - DGRH / Teams"}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. PARECER (conforme modelo timbrado oficial) */}
        {/* ========================================================================= */}
        {isParecer && (
          <div className="space-y-5 pt-1">
            {/* Título do Parecer */}
            <div>
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                PARECER DGRH nº {metadata.documentNumber || "01/2026"}
              </h2>
            </div>

            {/* Referência */}
            {metadata.referenceProcess && (
              <div className="text-xs text-zinc-900 pt-2">
                <span className="font-bold text-black">Referência: </span>
                <span className="font-normal">{metadata.referenceProcess}</span>
              </div>
            )}

            {/* Interessado */}
            {metadata.interestedParty && (
              <div className="text-xs text-zinc-900 pt-1">
                <span className="font-bold text-black">Interessado: </span>
                <span className="font-normal">{metadata.interestedParty}</span>
              </div>
            )}

            {/* Assunto */}
            {metadata.subject && (
              <div className="text-xs text-zinc-900 pt-1">
                <span className="font-bold text-black">Assunto: </span>
                <span className="font-normal">{metadata.subject}</span>
              </div>
            )}

            {/* Corpo do Parecer */}
            <div className="pt-2">
              <FormattedParagraphs text={text} />
            </div>

            {/* Local e Data */}
            <div className="text-left text-xs text-zinc-700 font-medium pt-4">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8b. INFORMAÇÃO, DECISÃO E DESPACHO */}
        {/* ========================================================================= */}
        {(isDecisaoOuDespacho || isInformacao) && (
          <div className="space-y-5 pt-1">
            <div className="border-b border-zinc-300 pb-2">
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                {isInformacao && `INFORMAÇÃO Nº ${metadata.documentNumber || "18/2026"} - DGRH`}
                {isDecisaoOuDespacho && (docType === "decisao" ? `DECISÃO Nº ${metadata.documentNumber || "08/2026"}` : "DESPACHO DO COORDENADOR GERAL")}
              </h2>
            </div>

            {/* Tabela de Referência Processual */}
            {(metadata.referenceProcess || metadata.interestedParty || metadata.subject) && (
              <div className="text-xs space-y-1 leading-tight pt-1">
                {metadata.referenceProcess && (
                  <p><strong className="text-black">Processo nº:</strong> {metadata.referenceProcess}</p>
                )}
                {metadata.interestedParty && (
                  <p><strong className="text-black">Interessado(a):</strong> {metadata.interestedParty}</p>
                )}
                {metadata.subject && (
                  <p><strong className="text-black">Assunto:</strong> {metadata.subject}</p>
                )}
              </div>
            )}

            {/* Corpo Técnico */}
            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. DECLARAÇÃO */}
        {/* ========================================================================= */}
        {isDeclaracao && (
          <div className="space-y-6 pt-4">
            <div className="text-center pt-4 pb-2">
              <h2 className="text-base font-black text-black tracking-widest uppercase">
                DECLARAÇÃO
              </h2>
            </div>

            <div className="pt-4">
              <FormattedParagraphs text={text} paragraphClassName="text-xs text-zinc-900 leading-[1.8] text-justify indent-8 font-normal" />
            </div>

            {/* Data e Local (justificado como o parágrafo do texto) */}
            <div className="text-justify text-xs text-zinc-700 font-medium pt-4">
              {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
            </div>

            {/* Assinatura Centralizada */}
            <div className="flex flex-col items-center text-center pt-4">
              <div className="w-64 border-t border-zinc-950 pt-1.5 text-center">
                <p className="text-xs font-bold text-black">
                  {metadata.authorName || "Responsável pelo Atendimento Funcional"}
                </p>
                <p className="text-[10px] text-zinc-600 font-medium">
                  {metadata.authorRole || "Divisão de Atendimento e Benefícios - DGRH"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. CERTIFICADO (Layout Nobre Paisagem/Retrato) */}
        {/* ========================================================================= */}
        {isCertificado && (
          <div className="border-4 border-double border-[#d98a1a] rounded-2xl p-6 sm:p-8 space-y-6 text-center bg-gradient-to-b from-white to-amber-50/20">
            {/* Logo Unicamp Centralizada */}
            <div className="flex justify-center" style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
              <div
                className="shrink-0 flex items-center justify-center"
                style={{ height: "64px", maxHeight: "64px", width: "57px", maxWidth: "57px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
              >
                <img
                  src={UNICAMP_LOGO_JPG_DATA_URL || "/images/logo-unicamp.jpg"}
                  alt="Logo Unicamp"
                  width="57"
                  height="64"
                  style={{
                    width: "57px",
                    height: "64px",
                    maxWidth: "57px",
                    maxHeight: "64px",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
              </div>
            </div>


            <div className="space-y-1">
              <h1 className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
                UNIVERSIDADE ESTADUAL DE CAMPINAS
              </h1>
              <h2 className="text-xl font-black text-black tracking-widest uppercase text-[#b36b00]">
                CERTIFICADO
              </h2>
            </div>

            <div className="space-y-3 max-w-xl mx-auto py-2">
              <p className="text-xs text-zinc-700 leading-relaxed">
                Certificamos que
              </p>
              <h3 className="text-sm font-black text-black border-b border-zinc-400 pb-1 inline-block px-4">
                {metadata.targetPerson || "Nome Completo do(a) Participante"}
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed text-justify sm:text-center pt-2">
                concluiu com êxito as atividades de <strong>{metadata.courseName || "Capacitação em Redação Oficial e Linguagem Simples"}</strong> promovido pela {metadata.unitName || "Diretoria Geral de Recursos Humanos"}, realizado no período de {metadata.coursePeriod || "10 a 25 de agosto de 2026"}, com carga horária total de <strong>{metadata.courseHours || "20 horas"}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 11. COMUNICADO, RELATÓRIO E OUTROS DOCUMENTOS */}
        {/* ========================================================================= */}
        {(!isNormative && !isRegimentoOuRegulamento && !isLetter && !isCarta && !isMemo && !isMinutes && !isPauta && !isParecer && !isDecisaoOuDespacho && !isInformacao && !isDeclaracao && !isCertificado) && (
          <div className="space-y-5 pt-1">
            <div className="pb-2">
              <h2 className="text-sm font-black text-black tracking-wide uppercase">
                {currentTypeInfo.label.toUpperCase()} DGRH Nº {metadata.documentNumber || "01/2026"}
              </h2>
              {metadata.subject && (
                <p className="text-xs text-zinc-800 font-bold mt-2">
                  Assunto: {metadata.subject}
                </p>
              )}
            </div>

            <div className="pt-1">
              <FormattedParagraphs text={text} />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RODAPÉ DO DOCUMENTO: LOCAL, DATA E ASSINATURA */}
      {/* ========================================================================= */}
      <footer className="pt-8 space-y-6">
        {/* Local e Data à direita (demais documentos, exceto ofício, carta e declaração) */}
        {!isLetter && !isCarta && !isDeclaracao && (
          <div className="text-right text-xs text-zinc-700 font-medium">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
        )}

        {/* Bloco de Assinatura padrão (demais documentos, exceto declaração) */}
        {!isDeclaracao && (
          <div className="pt-6 flex flex-col items-end text-right">
            <div className="w-64 border-t border-zinc-950 pt-1.5">
              <p className="text-xs font-bold text-black">
                {metadata.authorName || "Coordenação Geral da DGRH"}
              </p>
              <p className="text-[10px] text-zinc-600 font-medium">
                {metadata.authorRole || "Diretoria Geral de Recursos Humanos"}
              </p>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
