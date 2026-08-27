"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  FileText,
  Copy,
  Printer,
  Download,
  Eye,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  Info,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
  CheckCircle2,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DynamicDocumentSheet } from "./dynamic-document-sheet";
import { generateDocumentDocx } from "@/lib/templates/docx-document-generator";
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";

interface DynamicDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  docType?: DocumentType;
}

export function DynamicDocumentDrawer({
  isOpen,
  onClose,
  text,
  docType = "comunicado"
}: DynamicDocumentDrawerProps) {
  const [activeView, setActiveView] = useState<"sheet" | "comparison" | "settings">("sheet");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showGDocsModal, setShowGDocsModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeGabaritoPage, setActiveGabaritoPage] = useState(0);

  // Busca metadados e gabarito oficial do tipo de documento
  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];
  const gabaritoPages = currentTypeInfo.modelImagePages || (currentTypeInfo.modelImagePath ? [currentTypeInfo.modelImagePath] : []);

  // Metadados dinâmicos e editáveis do Documento
  const [metadata, setMetadata] = useState<UniversalDocumentMetadata>(() => {
    const base: UniversalDocumentMetadata = {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "01/2026",
      emailSite: "dgrh@unicamp.br | www.dgrh.unicamp.br",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      authorName: "Coordenação Geral da DGRH",
      authorRole: "Diretoria Geral de Recursos Humanos",
      customUnitLogo: undefined,
      hideUnicampLogo: false
    };
    return { ...base, ...(currentTypeInfo.defaultMetadata as any) };
  });


  // Atualiza metadados padrão quando troca de documento
  useEffect(() => {
    if (currentTypeInfo.defaultMetadata) {
      setMetadata((prev: UniversalDocumentMetadata) => ({
        ...prev,
        ...currentTypeInfo.defaultMetadata
      }));
    }
  }, [docType]);

  useEffect(() => {
    if (!metadata.locationAndDate) {
      const today = new Date();
      const formatted = today.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      setMetadata((prev: UniversalDocumentMetadata) => ({
        ...prev,
        locationAndDate: `Campinas, ${formatted}.`
      }));
    }
  }, []);

  if (!isOpen) return null;

  // Classificação dos grupos de formulário
  const isNormative = [
    "portaria", "resolucao", "deliberacao", "instrucao-normativa",
    "ordinance", "resolution", "instruction", "regulation", "conceito-atos-normativos"
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG ou SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, customUnitLogo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUnitLogo = () => {
    setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, customUnitLogo: undefined }));
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateDocumentDocx(docType, text, metadata);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (currentTypeInfo.label || "Documento").replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `${cleanName}_Unicamp_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar DOCX:", err);
      alert("Houve um erro ao gerar o documento DOCX. Tente novamente.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyFormatted = async () => {
    try {
      const sheetElement = document.getElementById("printable-document-sheet");
      if (!sheetElement) return;

      const htmlContent = sheetElement.innerHTML;
      const plainTextContent = sheetElement.innerText;

      if (navigator.clipboard && window.ClipboardItem) {
        const typeHtml = "text/html";
        const typePlain = "text/plain";
        const blobHtml = new Blob([htmlContent], { type: typeHtml });
        const blobPlain = new Blob([plainTextContent], { type: typePlain });
        const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typePlain]: blobPlain })];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(plainTextContent);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenInGoogleDocs = async () => {
    await handleCopyFormatted();
    setShowGDocsModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Modal Instrucional Google Docs */}
      {showGDocsModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#b36b00] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-[#d98a1a]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-black">
                Documento copiado com formatação!
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                A folha com o layout oficial de <strong>{currentTypeInfo.label}</strong> e o texto simplificado já estão na sua área de transferência.
              </p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-2 text-xs text-zinc-700">
              <p className="font-bold text-black flex items-center gap-1.5">
                <span>Passo a passo no Google Docs:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600">
                <li>Clique no botão abaixo para abrir um documento novo no Docs;</li>
                <li>Pressione <kbd className="bg-white border px-1.5 py-0.5 rounded font-mono font-bold">Ctrl + V</kbd> (ou <kbd className="bg-white border px-1.5 py-0.5 rounded font-mono font-bold">Cmd + V</kbd>);</li>
                <li>Ou use o botão <strong>"Baixar DOCX"</strong> para abrir diretamente no Docs.</li>
              </ol>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGDocsModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                Fechar
              </button>
              <a
                href="https://docs.new"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowGDocsModal(false)}
                className="flex-1 bg-[#FBB040] hover:bg-[#e59b2b] text-black font-black text-xs py-2.5 rounded-xl text-center border border-[#d98a1a] shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Ir para Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Container Principal do Drawer */}
      <div className="bg-zinc-100 w-full max-w-6xl h-full shadow-2xl flex flex-col justify-between border-l border-zinc-300">
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DO DRAWER */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBB040] text-black flex items-center justify-center font-black shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-black">
                  Modelo Oficial: {currentTypeInfo.label}
                </h2>
                <span className="text-[10px] uppercase font-bold bg-amber-100 text-[#b36b00] px-2 py-0.5 rounded-md border border-amber-300">
                  {currentTypeInfo.category}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Padrão Unicamp • Fonte Arial 12pt • Margens Oficiais
              </p>
            </div>
          </div>

          {/* Seletor de Visualização (Folha / Comparação com Gabarito / Dados do Modelo) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveView("sheet")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "sheet"
                    ? "bg-white text-black shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#d98a1a]" />
                <span>Folha Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("comparison")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "comparison"
                    ? "bg-white text-black shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#d98a1a]" />
                <span>Gabarito Unicamp ({gabaritoPages.length} pág.)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("settings")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "settings"
                    ? "bg-white text-black shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#d98a1a]" />
                <span>Campos do Modelo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors ml-2"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DRAWER (ÁREA DE VISUALIZAÇÃO E FORMULÁRIO CONTEXTUAL) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start bg-zinc-200/60">
          {/* VISUALIZAÇÃO 1: FOLHA A4 OFICIAL */}
          {activeView === "sheet" && (
            <div className="w-full flex flex-col items-center space-y-4 max-w-4xl">
              {/* Controles de Zoom e Impressão */}
              <div className="w-full flex justify-between items-center bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                  <span>Zoom:</span>
                  <button
                    type="button"
                    onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
                    className="px-2 py-1 bg-zinc-100 rounded-md hover:bg-zinc-200"
                  >
                    -
                  </button>
                  <span className="font-mono">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
                    className="px-2 py-1 bg-zinc-100 rounded-md hover:bg-zinc-200"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-zinc-500 font-medium">
                  {currentTypeInfo.competence && (
                    <span><strong>Competência:</strong> {currentTypeInfo.competence}</span>
                  )}
                </div>
              </div>

              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="transition-transform duration-150 w-full flex justify-center">
                <DynamicDocumentSheet
                  text={text}
                  metadata={metadata}
                  docType={docType}
                />
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO 2: GABARITO OFICIAL DA UNICAMP COM SUPORTE MULTI-PÁGINA */}
          {activeView === "comparison" && (
            <div className="w-full max-w-5xl space-y-4">
              {/* Barra de Seleção de Página do Gabarito */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black uppercase">Páginas do Gabarito:</span>
                  <div className="flex gap-1.5">
                    {gabaritoPages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGabaritoPage(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          activeGabaritoPage === idx
                            ? "bg-[#FBB040] text-black shadow-xs border border-[#d98a1a]"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        Página {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <a
                  href={currentTypeInfo.unicampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#b36b00] hover:underline flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ver diretrizes completas no portal Unicamp</span>
                </a>
              </div>

              {/* Comparação Lado a Lado: Gabarito Oficial vs Folha Aplicada */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Gabarito Unicamp */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-300 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-xs font-black text-zinc-900 uppercase">
                      Gabarito Oficial Unicamp (Página {activeGabaritoPage + 1})
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Fonte: linguagemsimples.unicamp.br
                    </span>
                  </div>

                  <div className="relative aspect-[1/1.414] w-full border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50 shadow-inner">
                    {gabaritoPages[activeGabaritoPage] ? (
                      <Image
                        src={gabaritoPages[activeGabaritoPage]}
                        alt={`Gabarito ${currentTypeInfo.label} pág. ${activeGabaritoPage + 1}`}
                        fill
                        className="object-contain p-2"
                        priority
                      />
                    ) : (
                      <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center h-full">
                        Gabarito oficial em conformidade com as diretrizes da Unicamp.
                      </div>
                    )}
                  </div>
                </div>

                {/* Folha Atual Formatada */}
                <div className="bg-white p-4 rounded-3xl border border-zinc-300 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-xs font-black text-zinc-900 uppercase">
                      Seu Documento Aplicado
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Linguagem Simples + Formatação Oficial
                    </span>
                  </div>

                  <div className="border border-zinc-200 rounded-2xl overflow-y-auto max-h-[600px] p-2 bg-zinc-100">
                    <DynamicDocumentSheet
                      text={text}
                      metadata={metadata}
                      docType={docType}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO 3: FORMULÁRIO DINÂMICO E CONTEXTUAL DE CAMPOS */}
          {activeView === "settings" && (
            <div className="bg-white w-full max-w-3xl rounded-3xl border border-zinc-300 p-6 shadow-sm space-y-6">
              <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-black">
                    Campos e Metadados: {currentTypeInfo.label}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Preencha os elementos específicos para montar o cabeçalho e a estrutura oficial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("sheet")}
                  className="bg-[#FBB040] text-black font-black text-xs px-4 py-2 rounded-xl border border-[#d98a1a] shadow-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Folha Formatada</span>
                </button>
              </div>

              {/* SEÇÃO 1: CABEÇALHO GERAL INSTITUCIONAL */}
              {!isCertificado && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Cabeçalho e Identificação da Unidade
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Nome da Unidade / Órgão</label>
                      <input
                        type="text"
                        value={metadata.unitName}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, unitName: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Número do Documento / Ano</label>
                      <input
                        type="text"
                        value={metadata.documentNumber}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, documentNumber: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">E-mail e Site Institucional</label>
                      <input
                        type="text"
                        value={metadata.emailSite}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, emailSite: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Local e Data</label>
                      <input
                        type="text"
                        value={metadata.locationAndDate}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, locationAndDate: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Upload do Logotipo da Unidade */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-black mb-1">Logotipo da Unidade (Opcional ao lado da Unicamp)</label>
                    <div className="flex items-center gap-3">
                      {metadata.customUnitLogo ? (
                        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                          <img src={metadata.customUnitLogo} alt="Logo" className="h-10 w-auto object-contain" />
                          <button
                            type="button"
                            onClick={handleRemoveUnitLogo}
                            className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-xs font-bold text-zinc-700 hover:text-black bg-zinc-50 border border-zinc-300 hover:bg-zinc-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Enviar imagem da sua Unidade</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SEÇÃO 2: CAMPOS CONTEXTUAIS DO MODELO ESPECÍFICO */}
              {/* A. ATOS NORMATIVOS */}
              {isNormative && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Estrutura Normativa (Técnica Legislativa Unicamp)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Ementa (Síntese do ato - alinhada à direita em itálico 10pt)
                    </label>
                    <textarea
                      rows={2}
                      value={metadata.ementa || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, ementa: e.target.value }))}
                      placeholder="Ex: Dispõe sobre os procedimentos operacionais e novas diretrizes..."
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    />
                    <span className="text-[10px] text-zinc-500">
                      Dica Unicamp: Inicie com verbo na 3ª pessoa do singular do presente do indicativo (Dispõe, Institui, Designa, Aprova).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Preâmbulo / Fundamentação Legal
                    </label>
                    <textarea
                      rows={2}
                      value={metadata.preamble || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, preamble: e.target.value }))}
                      placeholder="Ex: O Reitor da Universidade Estadual de Campinas, no uso de suas atribuições legais, resolve:"
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Cláusula de Vigência
                    </label>
                    <input
                      type="text"
                      value={metadata.effectiveClause || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, effectiveClause: e.target.value }))}
                      placeholder="Ex: Esta Portaria entra em vigor na data de sua publicação."
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* B. OFÍCIO E OFÍCIO CIRCULAR */}
              {isLetter && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Destinatário, Assunto e Vocativo
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Pronome de Tratamento</label>
                      <input
                        type="text"
                        value={metadata.recipientTitle || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientTitle: e.target.value }))}
                        placeholder="Ex: A Sua Senhoria o Senhor / A Sua Excelência a Senhora"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Nome do Destinatário</label>
                      <input
                        type="text"
                        value={metadata.recipientName || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="Ex: Prof. Dr. Diretor de Faculdade"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Cargo / Função do Destinatário</label>
                      <input
                        type="text"
                        value={metadata.recipientRole || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientRole: e.target.value }))}
                        placeholder="Ex: Diretor do Instituto de Computação"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Endereço Completo com CEP</label>
                      <input
                        type="text"
                        value={metadata.recipientAddress || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientAddress: e.target.value }))}
                        placeholder="Ex: Av. Albert Einstein, 1251 - CEP 13083-852"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-black mb-1">Assunto em Destaque</label>
                      <input
                        type="text"
                        value={metadata.subject || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Ex: Solicitação de providências técnicas..."
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Vocativo Formal</label>
                      <input
                        type="text"
                        value={metadata.vocativo || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, vocativo: e.target.value }))}
                        placeholder="Ex: Senhor Diretor, / Prezada Secretária,"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Fecho</label>
                      <input
                        type="text"
                        value={metadata.fecho || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, fecho: e.target.value }))}
                        placeholder="Ex: Atenciosamente, / Respeitosamente,"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* C. MEMORANDO */}
              {isMemo && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Tramitação Interna (PARA / DE / ASSUNTO / DATA)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">PARA (Destino)</label>
                      <input
                        type="text"
                        value={metadata.memoPara || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoPara: e.target.value }))}
                        placeholder="Ex: Diretoria de Administração"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">DE (Origem)</label>
                      <input
                        type="text"
                        value={metadata.memoDe || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoDe: e.target.value }))}
                        placeholder="Ex: Divisão de Desenvolvimento de Pessoas"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-black mb-1">ASSUNTO</label>
                      <input
                        type="text"
                        value={metadata.memoAssunto || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoAssunto: e.target.value }))}
                        placeholder="Ex: Encaminhamento de relatório de necessidades..."
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* D. ATA E PAUTA DE REUNIÃO */}
              {(isMinutes || isPauta) && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Dados da Reunião / Colegiado
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-black mb-1">Identificação da Reunião</label>
                      <input
                        type="text"
                        value={metadata.meetingNumber || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingNumber: e.target.value }))}
                        placeholder="Ex: 15ª Reunião Ordinária da Comissão..."
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Data e Horário</label>
                      <input
                        type="text"
                        value={metadata.meetingDate || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingDate: e.target.value }))}
                        placeholder="Ex: 27 de agosto de 2026, às 14h00"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Local / Plataforma</label>
                      <input
                        type="text"
                        value={metadata.meetingPlace || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingPlace: e.target.value }))}
                        placeholder="Ex: Sala de Reuniões da DGRH / Teams"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    {isMinutes && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-black mb-1">Presidência</label>
                          <input
                            type="text"
                            value={metadata.meetingPresident || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingPresident: e.target.value }))}
                            placeholder="Ex: Profa. Dra. Coordenadora Geral"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-1">Secretaria</label>
                          <input
                            type="text"
                            value={metadata.meetingSecretary || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingSecretary: e.target.value }))}
                            placeholder="Ex: Secretário(a) da Comissão"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-black mb-1">Membros Presentes</label>
                          <input
                            type="text"
                            value={metadata.membersPresent || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, membersPresent: e.target.value }))}
                            placeholder="Ex: Membro 1, Membro 2, Membro 3"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* E. PARECER, DECISÃO, DESPACHO E INFORMAÇÃO */}
              {(isParecer || isDecisaoOuDespacho || isInformacao) && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Referência Processual
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Número do Processo</label>
                      <input
                        type="text"
                        value={metadata.referenceProcess || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, referenceProcess: e.target.value }))}
                        placeholder="Ex: Processo nº 01-P-12345/2026"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Interessado(a)</label>
                      <input
                        type="text"
                        value={metadata.interestedParty || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, interestedParty: e.target.value }))}
                        placeholder="Ex: Nome da Unidade ou Servidor"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* F. DECLARAÇÃO E CERTIFICADO */}
              {(isDeclaracao || isCertificado) && (
                <div className="space-y-4 pt-3 border-t border-zinc-200">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                    Dados do Interessado e Atividade
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={metadata.targetPerson || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, targetPerson: e.target.value }))}
                        placeholder="Ex: Nome Completo da Pessoa"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Documento (RG / CPF)</label>
                      <input
                        type="text"
                        value={metadata.targetDocument || ""}
                        onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, targetDocument: e.target.value }))}
                        placeholder="Ex: RG nº 00.000.000-0 / CPF nº 000.000.000-00"
                        className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                      />
                    </div>

                    {isCertificado && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-black mb-1">Nome do Curso / Evento</label>
                          <input
                            type="text"
                            value={metadata.courseName || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, courseName: e.target.value }))}
                            placeholder="Ex: Capacitação em Redação Oficial e Linguagem Simples"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-1">Carga Horária</label>
                          <input
                            type="text"
                            value={metadata.courseHours || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, courseHours: e.target.value }))}
                            placeholder="Ex: 20 horas"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-black mb-1">Período de Realização</label>
                          <input
                            type="text"
                            value={metadata.coursePeriod || ""}
                            onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, coursePeriod: e.target.value }))}
                            placeholder="Ex: 10 a 25 de agosto de 2026"
                            className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO 3: ASSINATURA */}
              <div className="space-y-4 pt-3 border-t border-zinc-200">
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-1">
                  Signatário / Autoridade
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Nome do(a) Signatário(a)</label>
                    <input
                      type="text"
                      value={metadata.authorName}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, authorName: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={metadata.authorRole}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, authorRole: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE AÇÕES INFERIOR DO DRAWER */}
        {/* ========================================================================= */}
        <div className="bg-white border-t border-zinc-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFormatted}
              className="text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado com Sucesso!" : "Copiar Folha"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInGoogleDocs}
              className="text-xs font-bold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Abrir no Google Docs</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="bg-[#FBB040] hover:bg-[#e59b2b] disabled:opacity-50 text-black font-black text-xs px-5 py-2 rounded-xl border border-[#d98a1a] shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isExportingDocx ? "Gerando Word..." : `Baixar DOCX (${currentTypeInfo.label})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
