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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <span>Exportar Resultado</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Selecione o Conteúdo do Arquivo:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setExportMode("full_report")}
                className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                  exportMode === "full_report"
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Relatório Completo
              </button>
              <button
                type="button"
                onClick={() => setExportMode("simplified_only")}
                className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                  exportMode === "simplified_only"
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Apenas Texto Simplificado
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Escolha o Formato:
            </label>

            {/* DOCX */}
            <button
              onClick={handleExportDocx}
              disabled={downloading}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    Microsoft Word (.docx)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Documento editável formatado
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            {/* PDF / Imprimir */}
            <button
              onClick={handlePrintPdf}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                    Imprimir / Salvar em PDF
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Relatório visual diagramado
                  </div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            </button>

            {/* Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  MD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                    Markdown (.md)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Compatível com portais e repositórios
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </button>

            {/* TXT */}
            <button
              onClick={handleExportTxt}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  TXT
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                    Texto Puro (.txt)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sem formatação, universal
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>

            {/* HTML */}
            <button
              onClick={handleExportHtml}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  HTML
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Página Web (.html)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Arquivo pronto para navegadores
                  </div>
                </div>
              </div>
              <Code className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
