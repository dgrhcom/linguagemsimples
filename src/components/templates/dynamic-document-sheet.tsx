"use client";

import React, { useMemo, useState, useLayoutEffect, useRef, useEffect } from "react";
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

export type BodyBlock =
  | { type: "paragraph"; text: string; id: string }
  | { type: "bullet-list"; items: string[]; id: string }
  | { type: "numbered-list"; items: string[]; id: string };

/**
 * Divide parágrafos longos (> 500 caracteres) em frases menores
 * para que a quebra entre páginas ocorra de maneira fluida.
 */
function splitParagraphIntoSentenceBlocks(text: string, baseId: string, maxChars = 500): BodyBlock[] {
  if (text.length <= maxChars) {
    return [{ type: "paragraph", text, id: baseId }];
  }

  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  if (sentences.length <= 1) {
    return [{ type: "paragraph", text, id: baseId }];
  }

  const result: BodyBlock[] = [];
  let current = "";
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (current.length + s.length > maxChars && current.length > 0) {
      result.push({ type: "paragraph", text: current.trim(), id: `${baseId}-c${result.length}` });
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) {
    result.push({ type: "paragraph", text: current.trim(), id: `${baseId}-c${result.length}` });
  }
  return result.length > 0 ? result : [{ type: "paragraph", text, id: baseId }];
}

/**
 * Converte o texto bruto do documento em blocos de parágrafos e listas
 */
export function parseTextToBlocks(text: string): BodyBlock[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const blocks: BodyBlock[] = [];
  let currentList: { type: "bullet-list" | "numbered-list"; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    blocks.push({
      type: currentList.type,
      items: currentList.items,
      id: `list-${blocks.length}`
    });
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)$/);

    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet-list") {
        flushList();
        currentList = { type: "bullet-list", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numMatch) {
      if (!currentList || currentList.type !== "numbered-list") {
        flushList();
        currentList = { type: "numbered-list", items: [] };
      }
      currentList.items.push(numMatch[2]);
    } else {
      flushList();
      const sentenceBlocks = splitParagraphIntoSentenceBlocks(line, `p-${blocks.length}`);
      blocks.push(...sentenceBlocks);
    }
  }
  flushList();
  return blocks;
}

/**
 * Renderiza blocos de conteúdo com suporte a listas e parágrafos formatados
 */
export function RenderBlocks({
  blocks,
  paragraphClassName = "text-xs text-zinc-900 leading-[1.6] text-justify indent-8 font-normal"
}: {
  blocks: BodyBlock[];
  paragraphClassName?: string;
}) {
  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <p key={block.id} className={paragraphClassName}>
              <FormattedInline text={block.text} />
            </p>
          );
        }
        if (block.type === "bullet-list") {
          return (
            <ul key={block.id} className="list-disc list-outside my-2 pl-6 space-y-1 text-xs text-zinc-900 leading-[1.6]">
              {block.items.map((item, idx) => (
                <li key={idx}><FormattedInline text={item} /></li>
              ))}
            </ul>
          );
        }
        if (block.type === "numbered-list") {
          return (
            <ol key={block.id} className="list-decimal list-outside my-2 pl-6 space-y-1 text-xs text-zinc-900 leading-[1.6]">
              {block.items.map((item, idx) => (
                <li key={idx}><FormattedInline text={item} /></li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
  );
}

/**
 * Compatibilidade legada para renderização direta de texto contínuo
 */
export function FormattedParagraphs({
  text,
  paragraphClassName = "text-xs text-zinc-900 leading-[1.6] text-justify indent-8 font-normal"
}: {
  text: string;
  paragraphClassName?: string;
}) {
  const blocks = useMemo(() => parseTextToBlocks(text), [text]);
  return <RenderBlocks blocks={blocks} paragraphClassName={paragraphClassName} />;
}

/**
 * Estimativa analítica da altura de um bloco (em pixels @ 96 DPI)
 */
function estimateBlockHeight(block: BodyBlock): number {
  if (block.type === "paragraph") {
    const lines = Math.max(1, Math.ceil((block.text || "").length / 85));
    return lines * 19.5 + 14; // linha ~19.5px + margem inferior ~14px
  }
  if (block.type === "bullet-list" || block.type === "numbered-list") {
    const totalLines = (block.items || []).reduce(
      (sum, item) => sum + Math.max(1, Math.ceil(item.length / 80)),
      0
    );
    return totalLines * 19.5 + 16;
  }
  return 30;
}

/**
 * Estimativa de altura da seção inicial (Top Matter) na Página 1
 */
function getTopMatterHeight(docType: DocumentType, metadata: UniversalDocumentMetadata): number {
  if (["portaria", "resolucao", "deliberacao", "instrucao-normativa"].includes(docType)) {
    let h = 40; // Título
    if (metadata.ementa) h += Math.max(1, Math.ceil(metadata.ementa.length / 45)) * 18 + 12;
    if (metadata.preamble) h += Math.max(1, Math.ceil(metadata.preamble.length / 85)) * 19 + 12;
    return h;
  }
  if (["oficio", "oficio-circular"].includes(docType)) {
    return 120 + (metadata.subject ? 30 : 0);
  }
  if (docType === "carta") {
    return 140 + (metadata.subject ? 30 : 0);
  }
  if (["memorando", "memo"].includes(docType)) {
    return 130 + (metadata.subject || metadata.memoAssunto ? 30 : 0);
  }
  if (["ata", "minutes"].includes(docType)) {
    return 210; // Título + Grid da Sessão
  }
  if (docType === "pauta") {
    return 140;
  }
  if (["parecer", "opinion"].includes(docType)) {
    return 110;
  }
  if (docType === "informacao") {
    return 125;
  }
  if (["decisao", "despacho"].includes(docType)) {
    return 110;
  }
  if (["declaracao", "declaration"].includes(docType)) {
    return 65;
  }
  return 75; // Comunicado, Relatório, Outros
}

/**
 * Estimativa de altura da seção de Fechamento/Assinatura na última página
 */
function getClosingHeight(docType: DocumentType, metadata: UniversalDocumentMetadata): number {
  if (["portaria", "resolucao", "deliberacao", "instrucao-normativa"].includes(docType)) {
    let h = 120; // Data + Assinatura
    if (metadata.effectiveClause) h += Math.max(1, Math.ceil(metadata.effectiveClause.length / 85)) * 19 + 12;
    return h;
  }
  if (["oficio", "oficio-circular"].includes(docType)) {
    return 190; // Fecho + Assinatura + Bloco de Destinatário na base
  }
  if (docType === "carta") {
    return 120;
  }
  if (["memorando", "memo"].includes(docType)) {
    return 115;
  }
  if (["ata", "minutes"].includes(docType)) {
    return 120; // Encerramento + Assinaturas duplas
  }
  if (docType === "pauta") {
    return 0; // Pauta não possui assinatura na base
  }
  return 115; // Parecer, Informação, Decisão, Declaração, Outros
}

/**
 * Título resumido para o cabeçalho de continuação (Páginas 2+)
 */
function getDocumentTitleSummary(docType: DocumentType, metadata: UniversalDocumentMetadata): string {
  switch (docType) {
    case "portaria":
      return `Portaria ${metadata.documentNumber || "01/2026"}`;
    case "resolucao":
      return `Resolução GR-${metadata.documentNumber || "01/2026"}`;
    case "deliberacao":
      return `Deliberação CONSU-A-${metadata.documentNumber || "01/2026"}`;
    case "instrucao-normativa":
      return `Instrução Normativa ${metadata.documentNumber || "01/2026"}`;
    case "oficio":
      return `Ofício ${metadata.documentNumber || "105/2026"}`;
    case "oficio-circular":
      return `Ofício Circular ${metadata.documentNumber || "105/2026"}`;
    case "memorando":
    case "memo":
      return `Memorando ${metadata.documentNumber || "42/2026"}`;
    case "ata":
    case "minutes":
      return `Ata ${metadata.meetingNumber || "15ª Reunião"}`;
    case "pauta":
      return `Pauta ${metadata.meetingNumber || "12ª Reunião"}`;
    case "parecer":
    case "opinion":
      return `Parecer ${metadata.documentNumber || "01/2026"}`;
    case "informacao":
      return `Informação ${metadata.documentNumber || "18/2026"}`;
    case "decisao":
      return `Decisão ${metadata.documentNumber || "08/2026"}`;
    case "despacho":
      return "Despacho";
    case "declaracao":
    case "declaration":
      return "Declaração";
    case "regimento":
      return "Regimento Interno";
    case "regulamento":
      return "Regulamento";
    default:
      return "Documento Oficial";
  }
}

/**
 * Estilo de parágrafo conforme o tipo de documento
 */
function getParagraphClassName(docType: DocumentType): string {
  if (docType === "portaria") {
    // Portaria: sem recuo de parágrafos conforme regra oficial Unicamp
    return "text-xs text-zinc-900 leading-[1.6] text-justify font-normal";
  }
  if (["declaracao", "declaration"].includes(docType)) {
    return "text-xs text-zinc-900 leading-[1.8] text-justify indent-8 font-normal";
  }
  return "text-xs text-zinc-900 leading-[1.6] text-justify indent-8 font-normal";
}

/**
 * Algoritmo de particionamento de blocos em páginas A4 com limites estritos
 */
export function partitionBlocksIntoPages(
  blocks: BodyBlock[],
  docType: DocumentType,
  metadata: UniversalDocumentMetadata,
  measuredHeights?: {
    headerHeight?: number;
    topMatterHeight?: number;
    closingHeight?: number;
    blockHeights?: number[];
  }
): BodyBlock[][] {
  const isCertificado = ["certificado"].includes(docType);
  if (isCertificado) {
    return [blocks];
  }

  // Dimensões A4 a 96 DPI: 297mm = 1122.5px.
  // Margens: 15mm superior + 15mm inferior = 113.4px.
  // Altura útil interna: 1009px.
  // Reservando 35px para o rodapé oficial ("Página X de Y"):
  const USABLE_PAGE_HEIGHT = 960;
  const CONTINUATION_HEADER_HEIGHT = 38;

  const headerHeight = measuredHeights?.headerHeight ?? 90;
  const topMatterHeight = measuredHeights?.topMatterHeight ?? getTopMatterHeight(docType, metadata);
  const closingHeight = measuredHeights?.closingHeight ?? getClosingHeight(docType, metadata);

  const blockHeights = blocks.map((b, idx) => {
    return measuredHeights?.blockHeights?.[idx] ?? estimateBlockHeight(b);
  });

  const totalBlocksHeight = blockHeights.reduce((acc, h) => acc + h, 0);
  const page1Capacity = USABLE_PAGE_HEIGHT - headerHeight - topMatterHeight;

  // Se todo o conteúdo + assinaturas couberem na Página 1:
  if (totalBlocksHeight + closingHeight <= page1Capacity) {
    return [blocks];
  }

  // Particionamento multipágina
  const pages: BodyBlock[][] = [];
  let currentPageBlocks: BodyBlock[] = [];
  let currentHeight = 0;
  let currentCapacity = page1Capacity;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const h = blockHeights[i];

    if (currentHeight + h <= currentCapacity) {
      currentPageBlocks.push(block);
      currentHeight += h;
    } else {
      if (currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks);
      }
      currentPageBlocks = [block];
      currentHeight = h;
      currentCapacity = USABLE_PAGE_HEIGHT - CONTINUATION_HEADER_HEIGHT;
    }
  }

  // Verificar se o fechamento/assinatura cabe na página atual
  if (currentHeight + closingHeight <= currentCapacity) {
    pages.push(currentPageBlocks);
  } else {
    // Se não couber, mover o último bloco (se houver mais de 1) para a nova página junto com a assinatura
    if (currentPageBlocks.length > 1) {
      const lastBlock = currentPageBlocks.pop()!;
      pages.push(currentPageBlocks);
      pages.push([lastBlock]);
    } else {
      pages.push(currentPageBlocks);
      pages.push([]);
    }
  }

  return pages.length > 0 ? pages : [[]];
}

interface DynamicDocumentSheetProps {
  text: string;
  metadata: UniversalDocumentMetadata;
  docType?: DocumentType;
  onPageCountChange?: (count: number) => void;
}

export function DynamicDocumentSheet({
  text,
  metadata,
  docType = "comunicado",
  onPageCountChange
}: DynamicDocumentSheetProps) {
  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];

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

  const paragraphClassName = getParagraphClassName(docType);

  // Converte texto em blocos estruturados
  const blocks = useMemo(() => parseTextToBlocks(text), [text]);

  // Particionamento inicial analítico
  const [pages, setPages] = useState<BodyBlock[][]>(() =>
    partitionBlocksIntoPages(blocks, docType, metadata)
  );

  const measureContainerRef = useRef<HTMLDivElement>(null);

  // Refinamento de paginação com medições reais do motor de renderização do navegador
  useLayoutEffect(() => {
    if (isCertificado) {
      setPages([blocks]);
      return;
    }

    const container = measureContainerRef.current;
    if (!container) {
      const estimated = partitionBlocksIntoPages(blocks, docType, metadata);
      setPages(estimated);
      return;
    }

    const headerEl = container.querySelector('[data-measure="header"]') as HTMLElement | null;
    const topMatterEl = container.querySelector('[data-measure="top-matter"]') as HTMLElement | null;
    const closingEl = container.querySelector('[data-measure="closing"]') as HTMLElement | null;
    const blockEls = container.querySelectorAll('[data-measure="block"]');

    const headerHeight = headerEl ? headerEl.offsetHeight + 16 : 90;
    const topMatterHeight = topMatterEl ? topMatterEl.offsetHeight + 12 : getTopMatterHeight(docType, metadata);
    const closingHeight = closingEl ? closingEl.offsetHeight + 16 : getClosingHeight(docType, metadata);

    const measuredBlockHeights: number[] = [];
    blockEls.forEach((el) => {
      measuredBlockHeights.push((el as HTMLElement).offsetHeight + 12);
    });

    const refined = partitionBlocksIntoPages(blocks, docType, metadata, {
      headerHeight,
      topMatterHeight,
      closingHeight,
      blockHeights: measuredBlockHeights
    });

    setPages(refined);
  }, [blocks, docType, metadata, isCertificado]);

  useEffect(() => {
    onPageCountChange?.(pages.length);
  }, [pages.length, onPageCountChange]);

  // =========================================================================
  // SUBCOMPONENTES DE RENDERIZAÇÃO
  // =========================================================================

  const renderTopMatter = () => {
    if (isNormative) {
      return (
        <div className="space-y-4 pt-1">
          <div>
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              {docType === "portaria" && `PORTARIA ${metadata.documentNumber || "01/2026"}`}
              {docType === "resolucao" && `RESOLUÇÃO GR-${metadata.documentNumber || "01/2026"}`}
              {docType === "deliberacao" && `DELIBERAÇÃO CONSU-A-${metadata.documentNumber || "01/2026"}`}
              {docType === "instrucao-normativa" && `INSTRUÇÃO NORMATIVA ${metadata.documentNumber || "01/2026"}`}
            </h2>
          </div>

          {metadata.ementa && (
            <div className={`text-xs text-zinc-800 italic leading-relaxed pt-1 ${docType === "portaria" ? "flex justify-end" : ""}`}>
              <div className={docType === "portaria" ? "w-1/2 text-right" : ""}>
                {metadata.ementa}
              </div>
            </div>
          )}

          {metadata.preamble && (
            <p className={`text-xs text-zinc-900 leading-relaxed text-justify pt-1 ${docType === "portaria" ? "" : "indent-8"}`}>
              {metadata.preamble}
            </p>
          )}
        </div>
      );
    }

    if (isRegimentoOuRegulamento) {
      return (
        <div className="space-y-1 pt-1 pb-2">
          <h2 className="text-sm font-black text-black tracking-wide uppercase">
            {metadata.regimentoTitle || (docType === "regimento" ? "REGIMENTO INTERNO DA UNIDADE" : "REGULAMENTO DO PROGRAMA")}
          </h2>
          <p className="text-xs text-zinc-600 font-bold uppercase">
            {metadata.unitName || "Universidade Estadual de Campinas"}
          </p>
        </div>
      );
    }

    if (isLetter) {
      return (
        <div className="space-y-3 pt-1">
          <div className="text-right text-xs text-zinc-700 font-medium">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div>
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              {docType === "oficio-circular" ? "OFÍCIO CIRCULAR" : "OFÍCIO"} {metadata.documentNumber || "105/2026"}
            </h2>
          </div>
          {metadata.subject && (
            <div className="text-xs text-zinc-900 pt-0.5">
              <span className="font-black text-black">Assunto: </span>
              <span className="font-normal"><FormattedInline text={metadata.subject} /></span>
            </div>
          )}
          <div className="text-xs font-bold text-black pt-1">
            {metadata.vocativo || "Senhor(a) Diretor(a),"}
          </div>
        </div>
      );
    }

    if (isCarta) {
      return (
        <div className="space-y-3 pt-1">
          <div className="text-right text-xs text-zinc-700 font-medium">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div className="text-xs text-zinc-900 space-y-0.5 pt-1">
            {metadata.recipientTitle && <p className="text-zinc-600">{metadata.recipientTitle}</p>}
            <p className="font-bold text-black">{metadata.recipientName || "Nome do Destinatário"}</p>
            <p className="font-medium">{metadata.recipientRole || "Cargo / Função"}</p>
            {metadata.recipientAddress && (
              <p className="text-zinc-600 text-[11px] leading-tight pt-0.5">{metadata.recipientAddress}</p>
            )}
          </div>
          {metadata.subject && (
            <div className="text-xs text-zinc-900 pt-1">
              <span className="font-black text-black">Assunto: </span>
              <span className="font-normal"><FormattedInline text={metadata.subject} /></span>
            </div>
          )}
          <div className="text-xs font-bold text-black pt-1">
            {metadata.vocativo || "Prezado(a) Professor(a),"}
          </div>
        </div>
      );
    }

    if (isMemo) {
      return (
        <div className="space-y-3 pt-1">
          <div className="text-left text-xs text-zinc-700 font-medium">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div>
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              MEMORANDO {metadata.documentNumber || "42/2026"}
            </h2>
          </div>
          <div className="text-xs text-zinc-900 space-y-0.5 pt-1">
            <p>/Ao {metadata.recipientTitle || ""} {metadata.recipientName || "Diretoria de Administração"}</p>
            {metadata.recipientRole && <p className="pl-6">{metadata.recipientRole}</p>}
          </div>
          <div className="text-xs text-zinc-900 pt-1">
            <span className="font-bold text-black">Assunto: </span>
            <span className="font-normal">{metadata.memoAssunto || metadata.subject || "Encaminhamento de relatório"}</span>
          </div>
        </div>
      );
    }

    if (isMinutes) {
      return (
        <div className="space-y-4 pt-1">
          <div className="border-b border-zinc-300 pb-2">
            <h2 className="text-sm font-black text-black uppercase tracking-wide">
              ATA DA {metadata.meetingNumber?.toUpperCase() || "15ª REUNIÃO ORDINÁRIA DA COMISSÃO"}
            </h2>
          </div>
          <div className="border border-zinc-300 text-[11px] leading-tight">
            <div className="grid grid-cols-2 gap-0">
              <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Data/Horário:</strong></div>
              <div className="border-b border-zinc-300 p-2">{metadata.meetingDate || "27 de agosto de 2026, às 14h00"}</div>
              <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Local:</strong></div>
              <div className="border-b border-zinc-300 p-2">{metadata.meetingPlace || "Sala de Reuniões da DGRH / Virtual"}</div>
              <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Presidência:</strong></div>
              <div className="border-b border-zinc-300 p-2">{metadata.meetingPresident || "Profa. Dra. Coordenadora Geral"}</div>
              <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Secretário(a):</strong></div>
              <div className="border-b border-zinc-300 p-2">{metadata.meetingSecretary || "Secretário(a) da Comissão"}</div>
              {metadata.membersPresent && (
                <>
                  <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Membros Presentes:</strong></div>
                  <div className="border-b border-zinc-300 p-2">{metadata.membersPresent}</div>
                </>
              )}
              {metadata.membersAbsent && (
                <>
                  <div className="border-r border-b border-zinc-300 p-2"><strong className="text-black">Ausências Justificadas:</strong></div>
                  <div className="p-2">{metadata.membersAbsent}</div>
                </>
              )}
              {!metadata.membersPresent && !metadata.membersAbsent && (
                <>
                  <div className="border-r border-zinc-300 p-2"><strong className="text-black">Membros Presentes:</strong></div>
                  <div className="p-2">12</div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isPauta) {
      return (
        <div className="space-y-4 pt-1">
          <div className="border-b border-zinc-300 pb-2">
            <h2 className="text-sm font-black text-black uppercase tracking-wide">
              PAUTA DA {metadata.meetingNumber?.toUpperCase() || "12ª REUNIÃO ORDINÁRIA"}
            </h2>
          </div>
          <div className="border border-zinc-300 text-[11px] leading-tight">
            <div className="grid grid-cols-2 gap-0">
              <div className="border-r border-zinc-300 p-2"><strong className="text-black">Data/Horário:</strong></div>
              <div className="p-2">{metadata.meetingDate || "02 de setembro de 2026, às 09h30"}</div>
              <div className="border-r border-t border-zinc-300 p-2"><strong className="text-black">Local:</strong></div>
              <div className="border-t border-zinc-300 p-2">{metadata.meetingPlace || "Sala de Reuniões nº 2 - DGRH / Teams"}</div>
            </div>
          </div>
        </div>
      );
    }

    if (isParecer) {
      return (
        <div className="space-y-3 pt-1">
          <div>
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              PARECER {metadata.documentNumber || "01/2026"}
            </h2>
          </div>
          {(metadata.referenceProcess || metadata.interestedParty || metadata.subject) && (
            <div className="text-xs text-zinc-900 space-y-0.5 leading-snug">
              {metadata.referenceProcess && (
                <div><span className="font-bold text-black">Referência: </span><span className="font-normal">{metadata.referenceProcess}</span></div>
              )}
              {metadata.interestedParty && (
                <div><span className="font-bold text-black">Interessado: </span><span className="font-normal">{metadata.interestedParty}</span></div>
              )}
              {metadata.subject && (
                <div><span className="font-bold text-black">Assunto: </span><span className="font-normal">{metadata.subject}</span></div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (isInformacao) {
      return (
        <div className="space-y-3 pt-1">
          <div className="text-right text-xs text-zinc-700 font-medium">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div>
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              INFORMAÇÃO {metadata.documentNumber || "18/2026"}
            </h2>
          </div>
          {(metadata.referenceProcess || metadata.interestedParty || metadata.subject) && (
            <div className="text-xs space-y-1 leading-tight pt-0.5">
              {metadata.referenceProcess && <p><strong className="text-black">Processo nº:</strong> {metadata.referenceProcess}</p>}
              {metadata.interestedParty && <p><strong className="text-black">Interessado(a):</strong> {metadata.interestedParty}</p>}
              {metadata.subject && <p><strong className="text-black">Assunto:</strong> {metadata.subject}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isDecisaoOuDespacho) {
      return (
        <div className="space-y-3 pt-1">
          <div className="border-b border-zinc-300 pb-2">
            <h2 className="text-sm font-black text-black tracking-wide uppercase">
              {docType === "decisao" ? `DECISÃO ${metadata.documentNumber || "08/2026"}` : "DESPACHO DO COORDENADOR GERAL"}
            </h2>
          </div>
          {(metadata.referenceProcess || metadata.interestedParty || metadata.subject) && (
            <div className="text-xs space-y-1 leading-tight pt-0.5">
              {metadata.referenceProcess && <p><strong className="text-black">Processo nº:</strong> {metadata.referenceProcess}</p>}
              {metadata.interestedParty && <p><strong className="text-black">Interessado(a):</strong> {metadata.interestedParty}</p>}
              {metadata.subject && <p><strong className="text-black">Assunto:</strong> {metadata.subject}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isDeclaracao) {
      return (
        <div className="text-center pt-2 pb-2">
          <h2 className="text-base font-black text-black tracking-widest uppercase">
            DECLARAÇÃO
          </h2>
        </div>
      );
    }

    // Comunicado, Relatório e outros
    return (
      <div className="pb-1 pt-1">
        <h2 className="text-sm font-black text-black tracking-wide uppercase">
          {currentTypeInfo.label.toUpperCase()} {metadata.documentNumber || "01/2026"}
        </h2>
        {metadata.subject && (
          <p className="text-xs text-zinc-800 font-bold mt-1.5">
            Assunto: {metadata.subject}
          </p>
        )}
      </div>
    );
  };

  const renderClosing = () => {
    if (isNormative) {
      return (
        <div className="space-y-4 pt-4">
          {metadata.effectiveClause && (
            <p className={`text-xs text-zinc-900 leading-relaxed text-justify ${docType === "portaria" ? "" : "indent-8"}`}>
              <FormattedInline text={metadata.effectiveClause} />
            </p>
          )}

          <div className="text-left text-xs text-zinc-700 font-medium pt-2">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>

          <div className={`pt-4 flex flex-col ${docType === "portaria" ? "items-center text-center" : "items-end text-right"}`}>
            <div className={`w-64 ${docType === "portaria" ? "pt-1.5 text-center" : "border-t border-zinc-950 pt-1.5"}`}>
              <p className="text-xs font-bold text-black">
                {metadata.authorName || "Reitoria da Unicamp"}
              </p>
              <p className="text-[10px] text-zinc-600 font-medium">
                {metadata.authorRole || "Reitor(a)"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isRegimentoOuRegulamento) {
      return (
        <div className="space-y-4 pt-4">
          {metadata.effectiveClause && (
            <p className="text-xs text-zinc-900 leading-relaxed text-justify indent-8">
              <FormattedInline text={metadata.effectiveClause} />
            </p>
          )}
          <div className="text-left text-xs text-zinc-700 font-medium pt-2">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div className="pt-4 flex flex-col items-end text-right">
            <div className="w-64 border-t border-zinc-950 pt-1.5">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isLetter) {
      return (
        <div className="space-y-3 pt-3">
          <div className="text-xs text-zinc-900 indent-8 font-normal">
            {metadata.fecho || "Atenciosamente,"}
          </div>
          <div className="pt-4 flex flex-col items-center text-center">
            <div className="w-64 text-center">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
            </div>
          </div>
          <div className="pt-6 text-xs text-zinc-900 space-y-0.5 text-left">
            {metadata.recipientTitle && <p className="text-zinc-700">{metadata.recipientTitle}</p>}
            <p className="font-bold text-black">{metadata.recipientName || "Nome do Destinatário"}</p>
            {metadata.recipientRole && <p className="text-zinc-800">{metadata.recipientRole}</p>}
            {metadata.recipientInstitution && <p className="text-zinc-800">{metadata.recipientInstitution}</p>}
            {metadata.recipientAddress && (
              <p className="text-zinc-600 text-[11px] leading-tight pt-0.5">{metadata.recipientAddress}</p>
            )}
          </div>
        </div>
      );
    }

    if (isCarta) {
      return (
        <div className="space-y-3 pt-3">
          <div className="text-xs text-zinc-900 indent-8 font-normal">
            {metadata.fecho || "Cordialmente,"}
          </div>
          <div className="pt-4 flex flex-col items-end text-right">
            <div className="w-64 border-t border-zinc-950 pt-1.5">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isMemo) {
      return (
        <div className="space-y-3 pt-3">
          <div className="text-xs text-zinc-900 indent-8 font-normal">
            {metadata.vocativo || metadata.saudacao || "Atenciosamente,"}
          </div>
          <div className="pt-4 flex flex-col items-center text-center">
            <div className="w-64 text-center">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isMinutes) {
      return (
        <div className="space-y-4 pt-3">
          <p className="text-xs text-zinc-800 leading-relaxed text-justify indent-8 italic">
            Nada mais havendo a tratar, a Presidência deu por encerrada a reunião, da qual eu, Secretário(a), lavrei a presente ata que, após lida e aprovada, vai assinada por todos os presentes.
          </p>
          <div className="pt-4 grid grid-cols-2 gap-8 text-center">
            <div className="border-t border-zinc-950 pt-1.5">
              <p className="text-xs font-bold text-black">{metadata.meetingPresident || "Presidente da Comissão"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">Presidente</p>
            </div>
            <div className="border-t border-zinc-950 pt-1.5">
              <p className="text-xs font-bold text-black">{metadata.meetingSecretary || "Secretário(a) da Comissão"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">Secretário(a)</p>
            </div>
          </div>
        </div>
      );
    }

    if (isPauta) {
      return null;
    }

    if (isParecer) {
      return (
        <div className="space-y-3 pt-3">
          <div className="text-left text-xs text-zinc-700 font-medium pt-2">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div className="pt-4 flex flex-col items-center text-center">
            <div className="w-64 text-center">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isInformacao) {
      return (
        <div className="space-y-3 pt-3">
          <div className="text-xs text-zinc-900 indent-8 font-normal">
            {metadata.saudacao || metadata.fecho || "Atenciosamente,"}
          </div>
          <div className="pt-4 flex flex-col items-center text-center">
            <div className="w-64 text-center">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Analista Técnico de Recursos Humanos"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Divisão de Legislação Funcional - DGRH"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isDeclaracao) {
      return (
        <div className="space-y-3 pt-4">
          <div className="text-left text-xs text-zinc-700 font-medium indent-8 pt-2">
            {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
          </div>
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-64 pt-1.5 text-center">
              <p className="text-xs font-bold text-black">{metadata.authorName || "Responsável pelo Atendimento Funcional"}</p>
              <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Divisão de Atendimento e Benefícios - DGRH"}</p>
            </div>
          </div>
        </div>
      );
    }

    // Decisão, Despacho, Comunicado, Relatório e outros
    return (
      <div className="space-y-3 pt-3">
        <div className="text-right text-xs text-zinc-700 font-medium pt-2">
          {metadata.locationAndDate || "Campinas, 27 de agosto de 2026."}
        </div>
        <div className="pt-4 flex flex-col items-end text-right">
          <div className="w-64 border-t border-zinc-950 pt-1.5">
            <p className="text-xs font-bold text-black">{metadata.authorName || "Coordenação Geral da DGRH"}</p>
            <p className="text-[10px] text-zinc-600 font-medium">{metadata.authorRole || "Diretoria Geral de Recursos Humanos"}</p>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // CASO ESPECIAL: CERTIFICADO (Sempre página única nobre)
  // =========================================================================
  if (isCertificado) {
    return (
      <div
        id="printable-document-sheet"
        className="w-full flex flex-col items-center select-text"
      >
        <div
          className="a4-page bg-white text-zinc-900 border border-zinc-300 shadow-xl w-full max-w-[210mm] min-h-[297mm] h-[297mm] mx-auto p-[15mm_20mm_15mm_25mm] font-sans flex flex-col justify-center relative"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <div className="border-4 border-double border-[#d98a1a] rounded-2xl p-6 sm:p-8 space-y-6 text-center bg-gradient-to-b from-white to-amber-50/20">
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
        </div>
      </div>
    );
  }

  // =========================================================================
  // DOCUMENTOS OFICIAIS PADRONIZADOS MULTIPÁGINA A4
  // =========================================================================
  const totalPages = pages.length;

  return (
    <>
      {/* Container invisível para medição de altura exata com o motor do navegador */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "165mm",
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div data-measure="header">
          <DocumentHeader metadata={metadata} />
        </div>
        <div data-measure="top-matter">
          {renderTopMatter()}
        </div>
        {blocks.map((block) => (
          <div key={block.id} data-measure="block" className="py-1">
            <RenderBlocks blocks={[block]} paragraphClassName={paragraphClassName} />
          </div>
        ))}
        <div data-measure="closing">
          {renderClosing()}
        </div>
      </div>

      {/* Renderização Real das Páginas A4 */}
      <div
        id="printable-document-sheet"
        className="w-full flex flex-col items-center space-y-8 print:space-y-0 select-text"
      >
        {pages.map((pageBlocks, pageIdx) => {
          const isFirst = pageIdx === 0;
          const isLast = pageIdx === totalPages - 1;
          const pageNum = pageIdx + 1;

          return (
            <div
              key={pageIdx}
              data-page-number={pageNum}
              className="a4-page bg-white text-zinc-900 border border-zinc-300 shadow-xl w-full max-w-[210mm] min-h-[297mm] h-[297mm] mx-auto p-[15mm_20mm_15mm_25mm] font-sans flex flex-col justify-between relative transition-shadow"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {/* Seção Superior e Conteúdo da Página */}
              <div className="flex-1 flex flex-col justify-start">
                {/* Página 1: Cabeçalho Institucional Oficial Unicamp */}
                {isFirst && (
                  <div className="mb-4">
                    <DocumentHeader metadata={metadata} />
                  </div>
                )}

                {/* Páginas de Continuação (2+): Cabeçalho de Continuação Oficial */}
                {!isFirst && (
                  <div className="flex items-center justify-between pb-2 mb-4 border-b border-zinc-300 text-[10px] text-zinc-500 font-sans shrink-0">
                    <span className="font-semibold uppercase tracking-wider text-zinc-600">
                      Universidade Estadual de Campinas • {metadata.unitName || "Unicamp"}
                    </span>
                    <span className="font-medium text-zinc-500">
                      {getDocumentTitleSummary(docType, metadata)} — Fls. {pageNum}
                    </span>
                  </div>
                )}

                {/* Página 1: Top Matter (Título, Ementa, Assunto, Vocativo, etc.) */}
                {isFirst && renderTopMatter()}

                {/* Parágrafos e Listas da Página Corrente */}
                <div className="pt-2 flex-1">
                  <RenderBlocks blocks={pageBlocks} paragraphClassName={paragraphClassName} />
                </div>

                {/* Última Página: Cláusula de Vigência, Fecho, Assinatura e Destinatário */}
                {isLast && renderClosing()}
              </div>

              {/* Rodapé Oficial da Página com Numeração */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 font-sans select-none shrink-0 print:border-zinc-300">
                <span>Universidade Estadual de Campinas</span>
                <span className="font-medium text-zinc-500">
                  Página {pageNum} de {totalPages}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
