"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { ComunicadoSheet } from "./comunicado-sheet";
import {
  ComunicadoMetadata,
  generateComunicadoDocx
} from "@/lib/templates/docx-comunicado-generator";

interface ComunicadoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

export function ComunicadoDrawer({
  isOpen,
  onClose,
  text
}: ComunicadoDrawerProps) {
  const [activeView, setActiveView] = useState<"sheet" | "comparison">("sheet");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Metadados dinâmicos e editáveis do Comunicado
  const [metadata, setMetadata] = useState<ComunicadoMetadata>({
    unitName: "Diretoria Geral de Recursos Humanos",
    documentNumber: "01/2026",
    emailSite: "dgrh@unicamp.br | www.dgrh.unicamp.br",
    locationAndDate: "Campinas, 26 de agosto de 2026",
    authorName: "Coordenação Geral da DGRH",
    authorRole: "Diretoria Geral de Recursos Humanos"
  });

  useEffect(() => {
    // Atualiza a data com a data atual por extenso se vazia
    if (!metadata.locationAndDate) {
      const today = new Date();
      const formatted = today.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      setMetadata(prev => ({
        ...prev,
        locationAndDate: `Campinas, ${formatted}`
      }));
    }
  }, []);

  if (!isOpen) return null;

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateComunicadoDocx(text, metadata);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Comunicado_${(metadata.documentNumber || "Unicamp").replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao gerar DOCX:", e);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleOpenGoogleDocs = async () => {
    // Copia o conteúdo em HTML formatado para a área de transferência
    await handleCopyRichText();
    // Abre a página para criação de novo Google Docs
    window.open("https://docs.google.com/document/create", "_blank");
  };

  const handleCopyRichText = async () => {
    try {
      const paragraphs = text
        .split(/\n\s*\n|\n/)
        .map(p => p.trim())
        .filter(Boolean);

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
          <table style="width: 100%; border-bottom: 1px solid #777; padding-bottom: 10px; margin-bottom: 25px;">
            <tr>
              <td style="width: 40%; vertical-align: top;">
                <strong style="font-size: 16px;">UNICAMP</strong><br />
                <span style="font-size: 11px; color: #555;">${metadata.unitName}</span>
              </td>
              <td style="width: 60%; text-align: right; vertical-align: top; font-size: 11px;">
                <strong>Universidade Estadual de Campinas</strong><br />
                <span>${metadata.unitName}</span><br />
                <span style="color: #666;">${metadata.emailSite}</span>
              </td>
            </tr>
          </table>
          <h2 style="text-align: center; text-transform: uppercase; font-size: 15px; margin: 25px 0;">
            ${metadata.documentNumber ? `COMUNICADO Nº ${metadata.documentNumber}` : "COMUNICADO"}
          </h2>
          ${paragraphs.map(p => `<p style="text-indent: 1.25cm; text-align: justify; margin: 12px 0;">${p}</p>`).join("")}
          <p style="text-indent: 1.25cm; margin: 30px 0;">${metadata.locationAndDate}.</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="margin: 0; font-weight: bold;">${metadata.authorName}</p>
            <p style="margin: 0; color: #444; font-size: 13px;">${metadata.authorRole}</p>
          </div>
        </div>
      `;

      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobText = new Blob([text], { type: "text/plain" });
      const clipboardItem = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Erro ao copiar formatado:", e);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end overflow-hidden animate-in fade-in">
      <div className="bg-[#f4f3ed] w-full max-w-6xl h-full flex flex-col shadow-2xl border-l border-zinc-300 animate-in slide-in-from-right duration-300">
        {/* Topo do Drawer */}
        <div className="px-6 py-4 bg-[#18181b] text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FBB040] text-black flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Preview do Modelo Oficial: Comunicado (Unicamp)
                </h2>
                <span className="text-[10px] font-bold text-black bg-[#FBB040] px-2 py-0.5 rounded-full">
                  Em Tempo Real
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">
                Padrão institucional com margens A4, cabeçalho oficial e alinhamentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternância de Visualização */}
            <div className="inline-flex p-1 bg-zinc-800 rounded-xl border border-zinc-700">
              <button
                type="button"
                onClick={() => setActiveView("sheet")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeView === "sheet"
                    ? "bg-[#FBB040] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Folha Oficial A4</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("comparison")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeView === "comparison"
                    ? "bg-[#FBB040] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Gabarito Unicamp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors ml-2"
              title="Fechar visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal (2 Colunas) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Coluna Esquerda: Controles de Metadados e Ações */}
          <div className="lg:col-span-4 bg-white border-r border-zinc-200 p-5 overflow-y-auto space-y-6">
            {/* Ações de Exportação e Google Docs */}
            <div className="space-y-3 bg-[#faf9f5] border border-zinc-200 p-4 rounded-2xl">
              <span className="text-xs font-black text-black uppercase tracking-wider block">
                Exportação & Google Docs
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleOpenGoogleDocs}
                  className="w-full bg-[#18181b] hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#FBB040]" />
                    <span>Abrir no Google Docs</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                    Copia e abre
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  disabled={isExportingDocx}
                  className="w-full bg-[#FBB040] hover:bg-[#e59b2b] text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-between border border-[#d98a1a]"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>{isExportingDocx ? "Gerando..." : "Baixar DOCX Formatado"}</span>
                  </div>
                  <span className="text-[10px] text-black/70">.docx</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyRichText}
                    className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Copiar Formatado</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Configuração dos Metadados do Comunicado */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FBB040]" />
                <h3 className="text-xs font-black text-black uppercase tracking-wider">
                  Personalizar Dados do Modelo
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Nome da Unidade / Órgão:
                  </label>
                  <input
                    type="text"
                    value={metadata.unitName}
                    onChange={(e) => setMetadata({ ...metadata, unitName: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: Diretoria Geral de Recursos Humanos"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Número do Comunicado:
                  </label>
                  <input
                    type="text"
                    value={metadata.documentNumber}
                    onChange={(e) => setMetadata({ ...metadata, documentNumber: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: 01/2026 ou DGRH nº 05/2026"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    E-mail & Site Institucional:
                  </label>
                  <input
                    type="text"
                    value={metadata.emailSite}
                    onChange={(e) => setMetadata({ ...metadata, emailSite: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: dgrh@unicamp.br | www.dgrh.unicamp.br"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Local e Data:
                  </label>
                  <input
                    type="text"
                    value={metadata.locationAndDate}
                    onChange={(e) => setMetadata({ ...metadata, locationAndDate: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: Campinas, 26 de agosto de 2026"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Nome da Autora ou Autor (Signatário):
                  </label>
                  <input
                    type="text"
                    value={metadata.authorName}
                    onChange={(e) => setMetadata({ ...metadata, authorName: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: Coordenação Geral da DGRH"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Cargo ou Função:
                  </label>
                  <input
                    type="text"
                    value={metadata.authorRole}
                    onChange={(e) => setMetadata({ ...metadata, authorRole: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 font-medium focus:ring-2 focus:ring-[#FBB040] outline-hidden"
                    placeholder="Ex: Diretoria Geral de Recursos Humanos"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Visualizador da Folha A4 em Tempo Real */}
          <div className="lg:col-span-8 bg-[#e8e6dc]/70 p-6 overflow-y-auto flex flex-col items-center">
            {/* Barra de Controle de Zoom */}
            <div className="mb-4 bg-white/90 backdrop-blur-xs border border-zinc-300 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-xs">
              <span className="text-[11px] font-bold text-zinc-700">Zoom:</span>
              <button
                type="button"
                onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                className="p-1 text-zinc-600 hover:text-black rounded-md hover:bg-zinc-100"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-zinc-900 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
                className="p-1 text-zinc-600 hover:text-black rounded-md hover:bg-zinc-100"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="text-[10px] font-bold text-zinc-500 hover:text-black ml-2 px-2 py-0.5 bg-zinc-100 rounded-md"
              >
                100%
              </button>
            </div>

            {/* Modo 1: Folha A4 com o Conteúdo do Usuário */}
            {activeView === "sheet" && (
              <div className="w-full flex justify-center pb-12">
                <ComunicadoSheet text={text} metadata={metadata} scale={zoom} />
              </div>
            )}

            {/* Modo 2: Comparação lado a lado com a imagem oficial */}
            {activeView === "comparison" && (
              <div className="w-full max-w-4xl space-y-6 pb-12">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FBB040] shrink-0" />
                  <span>
                    Comparação de layout: À esquerda, a especificação oficial do portal da Unicamp. À direita, seu comunicado montado com o texto simplificado.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="bg-white p-4 rounded-2xl border border-zinc-300 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-zinc-800 block text-center">
                      1. Gabarito Oficial (Unicamp)
                    </span>
                    <div className="relative aspect-[1/1.414] w-full border border-zinc-200 rounded-lg overflow-hidden">
                      <Image
                        src="/images/modelo-comunicado.jpg"
                        alt="Gabarito do Comunicado Unicamp"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-zinc-300 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-zinc-800 block text-center">
                      2. Seu Documento Formatado
                    </span>
                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      <ComunicadoSheet text={text} metadata={metadata} scale={0.7} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
