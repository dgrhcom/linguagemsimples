"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { exportToTxt } from "@/lib/exporters/txt-exporter";
import { exportToMarkdown } from "@/lib/exporters/markdown-exporter";
import { exportToHtml } from "@/lib/exporters/html-exporter";
import { exportToDocxBlob } from "@/lib/exporters/docx-exporter";
import { Download, FileText, Printer, X, Check, Code, File } from "lucide-react";

interface ExportModalProps {
  result: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ result, isOpen, onClose }: ExportModalProps) {
  const [exportMode, setExportMode] = useState<"simplified_only" | "full_report">("full_report");
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTxt = () => {
    const txt = exportToTxt(result, exportMode);
    downloadFile(txt, `linguagem-simples-${exportMode}.txt`, "text/plain;charset=utf-8");
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(result, exportMode);
    downloadFile(md, `linguagem-simples-${exportMode}.md`, "text/markdown;charset=utf-8");
  };

  const handleExportHtml = () => {
    const html = exportToHtml(result, exportMode);
    downloadFile(html, `linguagem-simples-${exportMode}.html`, "text/html;charset=utf-8");
  };

  const handleExportDocx = async () => {
    setDownloading(true);
    try {
      const blob = await exportToDocxBlob(result, exportMode);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linguagem-simples-${exportMode}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("DOCX export error:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo do Modal */}
        <div className="px-6 py-4 bg-[#18181b] text-white flex items-center justify-between border-b border-zinc-800">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#FBB040]" />
            <span>Exportar Resultado</span>
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5 bg-[#faf9f5]">
          <div>
            <label className="text-xs font-black text-black block mb-2">
              Selecione o Conteúdo do Arquivo:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white border border-zinc-200 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setExportMode("full_report")}
                className={`text-xs font-bold py-2 px-3 rounded-xl transition-colors ${
                  exportMode === "full_report"
                    ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Relatório Completo
              </button>
              <button
                type="button"
                onClick={() => setExportMode("simplified_only")}
                className={`text-xs font-bold py-2 px-3 rounded-xl transition-colors ${
                  exportMode === "simplified_only"
                    ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Apenas Texto Simplificado
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-black text-black block mb-1">
              Escolha o Formato:
            </label>

            {/* DOCX */}
            <button
              onClick={handleExportDocx}
              disabled={downloading}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#FBB040] hover:bg-[#fef7eb] transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-black text-xs">
                  DOCX
                </div>
                <div>
                  <div className="text-xs font-black text-black group-hover:text-black">
                    Microsoft Word (.docx)
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Documento editável formatado
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-black" />
            </button>

            {/* PDF / Imprimir */}
            <button
              onClick={handlePrintPdf}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#FBB040] hover:bg-[#fef7eb] transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-black text-black group-hover:text-black">
                    Imprimir / Salvar em PDF
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Relatório visual diagramado
                  </div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-zinc-400 group-hover:text-black" />
            </button>

            {/* Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#FBB040] hover:bg-[#fef7eb] transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-black text-xs">
                  MD
                </div>
                <div>
                  <div className="text-xs font-black text-black group-hover:text-black">
                    Markdown (.md)
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Compatível com portais e repositórios
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-black" />
            </button>

            {/* TXT */}
            <button
              onClick={handleExportTxt}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#FBB040] hover:bg-[#fef7eb] transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-black text-xs">
                  TXT
                </div>
                <div>
                  <div className="text-xs font-black text-black group-hover:text-black">
                    Texto Puro (.txt)
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Sem formatação, universal
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-black" />
            </button>

            {/* HTML */}
            <button
              onClick={handleExportHtml}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 bg-white hover:border-[#FBB040] hover:bg-[#fef7eb] transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-black text-xs">
                  HTML
                </div>
                <div>
                  <div className="text-xs font-black text-black group-hover:text-black">
                    Página Web (.html)
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Arquivo pronto para navegadores
                  </div>
                </div>
              </div>
              <Code className="w-4 h-4 text-zinc-400 group-hover:text-black" />
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-white px-6 py-4 border-t border-zinc-200 text-right">
          <button
            onClick={onClose}
            className="text-xs font-bold text-zinc-600 hover:text-black px-4 py-2 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
