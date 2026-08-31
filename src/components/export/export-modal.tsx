"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { exportToTxt } from "@/lib/exporters/txt-exporter";
import { exportToMarkdown } from "@/lib/exporters/markdown-exporter";
import { exportToHtml } from "@/lib/exporters/html-exporter";
import { exportToDocxBlob } from "@/lib/exporters/docx-exporter";
import { Download, FileText, Printer, X, Check, Code, File } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const formats = [
    { id: "docx", label: "Microsoft Word (.docx)", desc: "Documento editável formatado", icon: "DOCX", action: handleExportDocx, loading: downloading },
    { id: "pdf", label: "Imprimir / Salvar em PDF", desc: "Relatório visual diagramado", icon: "PDF", action: handlePrintPdf, loading: false },
    { id: "md", label: "Markdown (.md)", desc: "Compatível com portais e repositórios", icon: "MD", action: handleExportMarkdown, loading: false },
    { id: "txt", label: "Texto Puro (.txt)", desc: "Formato universal e leve", icon: "TXT", action: handleExportTxt, loading: false },
    { id: "html", label: "Página Web (.html)", desc: "Visualização completa no navegador", icon: "HTML", action: handleExportHtml, loading: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(20, 20, 19, 0.6)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-[24px] max-w-md w-full overflow-hidden" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        {/* Topo do Modal */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#141413", borderBottom: "1px solid #3d3d3a" }}>
          <h3 className="text-[20px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#faf9f5" }}>
            <Download className="w-5 h-5" style={{ color: "#d97757" }} />
            <span>Exportar Resultado</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] transition-colors"
            style={{ color: "#b0aea5" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#faf9f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] block mb-2" style={{ color: "#b0aea5" }}>
              Selecione o Conteúdo do Arquivo:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-[8px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <button
                type="button"
                onClick={() => setExportMode("full_report")}
                className="w-full text-[14px] px-3 py-1.5 rounded-[8px] transition-colors"
                style={{
                  backgroundColor: exportMode === "full_report" ? "#141413" : "transparent",
                  color: exportMode === "full_report" ? "#faf9f5" : "#141413",
                  border: exportMode === "full_report" ? "1px solid #3d3d3a" : "1px solid transparent",
                  fontWeight: exportMode === "full_report" ? 600 : 400
                }}
              >
                Relatório Completo
              </button>
              <button
                type="button"
                onClick={() => setExportMode("simplified_only")}
                className="w-full text-[14px] px-3 py-1.5 rounded-[8px] transition-colors"
                style={{
                  backgroundColor: exportMode === "simplified_only" ? "#141413" : "transparent",
                  color: exportMode === "simplified_only" ? "#faf9f5" : "#141413",
                  border: exportMode === "simplified_only" ? "1px solid #3d3d3a" : "1px solid transparent",
                  fontWeight: exportMode === "simplified_only" ? 600 : 400
                }}
              >
                Apenas Texto Simplificado
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] block mb-1" style={{ color: "#b0aea5" }}>
              Escolha o Formato:
            </label>

            {formats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={fmt.action}
                disabled={fmt.loading}
                className="w-full flex items-center justify-between p-3.5 rounded-[12px] transition-colors text-left"
                style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#87867f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cccbc8"; }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[12px] flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: "#141413", color: "#d97757" }}>
                    {fmt.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>
                      {fmt.label}
                    </div>
                    <div className="text-[10px]" style={{ color: "#b0aea5" }}>
                      {fmt.desc}
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4" style={{ color: "#b0aea5" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
