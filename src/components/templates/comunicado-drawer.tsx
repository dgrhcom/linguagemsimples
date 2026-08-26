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
  Maximize2,
  Upload,
  Trash2,
  Info,
  CheckCircle2,
  Eye,
  EyeOff
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
  const [showGDocsModal, setShowGDocsModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Metadados dinâmicos e editáveis do Comunicado
  const [metadata, setMetadata] = useState<ComunicadoMetadata>({
    unitName: "Diretoria Geral de Recursos Humanos",
    documentNumber: "01/2026",
    emailSite: "dgrh@unicamp.br | www.dgrh.unicamp.br",
    locationAndDate: "Campinas, 26 de agosto de 2026",
    authorName: "Coordenação Geral da DGRH",
    authorRole: "Diretoria Geral de Recursos Humanos",
    customUnitLogo: undefined,
    hideUnicampLogo: false
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
        setMetadata(prev => ({ ...prev, customUnitLogo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUnitLogo = () => {
    setMetadata(prev => ({ ...prev, customUnitLogo: undefined }));
  };

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
    // 1. Copia o conteúdo em HTML formatado para a área de transferência
    await handleCopyRichText();
    // 2. Abre a página de criação de documento no Google Docs
    window.open("https://docs.google.com/document/create", "_blank");
    // 3. Exibe o modal com instrução clara de Ctrl+V / Colar
    setShowGDocsModal(true);
  };

  const handleCopyRichText = async () => {
    try {
      const paragraphs = text
        .split(/\n\s*\n|\n/)
        .map(p => p.trim())
        .filter(Boolean);

      // Usamos a URL pública oficial para que o Google Docs consiga importar a imagem ao colar
      const unicampLogoHtml = !metadata.hideUnicampLogo
        ? '<img src="https://linguagemsimples.unicamp.br/wp-content/themes/bx-unicamp-multisite/assets/img/logo-unicamp.svg" height="56" alt="Unicamp" style="height: 56px; vertical-align: middle; margin-right: 12px;" />'
        : "";

      const unitLogoHtml = metadata.customUnitLogo
        ? `<img src="${metadata.customUnitLogo}" height="56" alt="Unidade" style="height: 56px; vertical-align: middle;" />`
        : "";

      const htmlContent = `
        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; color: #000000;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #888888; padding-bottom: 12px; margin-bottom: 24px;">
            <tr>
              <td width="45%" align="left" valign="middle" style="padding-bottom: 8px;">
                ${unicampLogoHtml}
                ${unitLogoHtml}
              </td>
              <td width="55%" align="right" valign="top" style="text-align: right; font-size: 10pt; line-height: 1.3; padding-bottom: 8px;">
                <strong style="font-size: 10.5pt;">Universidade Estadual de Campinas</strong><br />
                <span style="font-size: 9.5pt;">${metadata.unitName || "Diretoria Geral de Recursos Humanos"}</span><br />
                <span style="font-size: 8.5pt; color: #555555;">${metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br"}</span>
              </td>
            </tr>
          </table>
          <p style="margin: 16px 0;">&nbsp;</p>
          <h2 align="center" style="text-align: center; text-transform: uppercase; font-size: 12pt; font-weight: bold; margin: 24px 0;">
            ${metadata.documentNumber ? `COMUNICADO Nº ${metadata.documentNumber}` : "COMUNICADO"}
          </h2>
          ${paragraphs.map(p => {
            const isBullet = p.startsWith("-") || p.startsWith("•") || p.startsWith("*") || /^\d+[\.\)]/.test(p);
            if (isBullet) {
              return `<p style="padding-left: 1.25cm; text-indent: 0; text-align: left; margin: 8px 0; font-size: 12pt; line-height: 1.5;">${p}</p>`;
            }
            return `<p style="text-indent: 1.25cm; text-align: justify; margin: 12px 0; font-size: 12pt; line-height: 1.5;">${p}</p>`;
          }).join("")}
          <p style="text-indent: 1.25cm; margin: 28px 0; font-size: 12pt; line-height: 1.5;">${metadata.locationAndDate.endsWith(".") ? metadata.locationAndDate : metadata.locationAndDate + "."}</p>
          <p style="margin: 36px 0;">&nbsp;</p>
          <div align="center" style="text-align: center; margin-top: 48px; font-size: 12pt; line-height: 1.2;">
            <p style="margin: 0; font-weight: bold;">${metadata.authorName || "Nome da Autora ou Autor"}</p>
            <p style="margin: 4px 0 0 0; color: #222222;">${metadata.authorRole || "Cargo ou Função"}</p>
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
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Erro ao copiar formatado:", e);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end overflow-hidden animate-in fade-in">
      {/* Modal / Diálogo de Instrução do Google Docs */}
      {showGDocsModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 space-y-5 text-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#d98a1a] flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-7 h-7 text-[#d98a1a]" />
              </div>
              <div>
                <h3 className="text-base font-black text-black">
                  Documento Aberto no Google Docs!
                </h3>
                <p className="text-xs text-zinc-600">
                  Formatação oficial pronta na sua área de transferência
                </p>
              </div>
            </div>

            <div className="bg-[#faf9f5] border border-amber-200 rounded-2xl p-4 space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-black bg-[#FBB040] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p className="text-zinc-800">
                  Na nova aba que se abriu no <strong>Google Docs</strong>, clique na folha em branco.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-black bg-[#FBB040] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p className="text-zinc-800">
                  Pressione <kbd className="bg-white border border-zinc-300 px-1.5 py-0.5 rounded-md font-mono font-bold shadow-2xs">Ctrl + V</kbd> (ou <kbd className="bg-white border border-zinc-300 px-1.5 py-0.5 rounded-md font-mono font-bold shadow-2xs">Cmd + V</kbd>) para colar o documento completo com cabeçalho e recuos.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-black bg-[#FBB040] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">
                  💡
                </span>
                <p className="text-zinc-700">
                  <strong>Alternativa sem copiar/colar:</strong> Baixe o arquivo <strong>.DOCX</strong> pelo botão abaixo e arraste-o para dentro do seu <strong>Google Drive</strong> para abri-lo diretamente como Google Docs!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyRichText}
                className="w-full sm:w-auto text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Novamente</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGDocsModal(false)}
                className="w-full sm:w-auto text-xs font-black text-black bg-[#FBB040] hover:bg-[#e59b2b] px-5 py-2.5 rounded-xl transition-all shadow-xs border border-[#d98a1a]"
              >
                Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gaveta Lateral (Drawer) */}
      <div className="bg-[#f4f3ed] w-full max-w-6xl h-full flex flex-col shadow-2xl border-l border-zinc-300 animate-in slide-in-from-right duration-300">
        {/* Topo do Drawer */}
        <div className="no-print px-6 py-4 bg-[#18181b] text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FBB040] text-black flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Modelo Oficial: Comunicado (Unicamp)
                </h2>
                <span className="text-[10px] font-bold text-black bg-[#FBB040] px-2 py-0.5 rounded-full">
                  Formatação Oficial
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">
                Padrão A4: Arial 12pt, entrelinha 1,5, recuo de 1,25 cm e margens oficiais
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
          <div className="no-print lg:col-span-4 bg-white border-r border-zinc-200 p-5 overflow-y-auto space-y-6">
            {/* Ações de Exportação e Google Docs */}
            <div className="space-y-3 bg-[#faf9f5] border border-zinc-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-black uppercase tracking-wider block">
                  Ações do Documento
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">
                  Arial 12pt | A4
                </span>
              </div>

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
                  <span className="text-[10px] text-[#FBB040] font-bold">
                    Copia & Abre
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
                    <span>{isExportingDocx ? "Gerando..." : "Baixar DOCX Oficial"}</span>
                  </div>
                  <span className="text-[10px] text-black/70">Com Logotipos</span>
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

              <div className="space-y-3.5 text-xs">
                {/* Opção para Ocultar Logotipo da Unicamp */}
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-900 block text-xs">
                      Logotipo da Unicamp
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Exibir brasão oficial no cabeçalho
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!metadata.hideUnicampLogo}
                      onChange={(e) => setMetadata({ ...metadata, hideUnicampLogo: !e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FBB040]"></div>
                  </label>
                </div>

                {/* Upload de Logotipo da Unidade (Opcional) */}
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-zinc-800 block">
                      Logotipo da Unidade / Órgão:
                    </label>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (Opcional)
                    </span>
                  </div>

                  {metadata.customUnitLogo ? (
                    <div className="flex items-center justify-between gap-3 bg-white p-2 border border-zinc-300 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img
                          src={metadata.customUnitLogo}
                          alt="Logotipo da Unidade"
                          className="h-10 w-auto object-contain rounded-md border border-zinc-200 p-0.5 bg-white"
                        />
                        <span className="text-[11px] font-bold text-zinc-700">
                          Logo carregado
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveUnitLogo}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 rounded-lg hover:bg-red-50 flex items-center gap-1"
                        title="Remover e deixar em branco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-zinc-300 hover:border-[#FBB040] bg-white p-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-zinc-500" />
                      <span className="font-bold text-zinc-700 text-xs">
                        Adicionar logo da Unidade
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>

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
            <div className="no-print mb-4 bg-white/90 backdrop-blur-xs border border-zinc-300 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-xs">
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
              <div className="no-print w-full max-w-4xl space-y-6 pb-12">
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
