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

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper rounded-card border border-slate max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo do Modal */}
        <div className="px-6 py-4 bg-ink flex items-center justify-between border-b border-slate">
          <h3 className="text-body font-display text-paper flex items-center gap-2">
            <Download className="w-5 h-5 text-amber" />
            <span>Exportar Resultado</span>
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-stone hover:text-paper p-1"
            leftIcon={<X className="w-5 h-5" />}
          />
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-micro-label font-sans text-stone block mb-2">
              Selecione o Conteúdo do Arquivo:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-sand/30 border border-sand p-1 rounded-btn">
              <Button
                type="button"
                onClick={() => setExportMode("full_report")}
                variant={exportMode === "full_report" ? "primary" : "ghost"}
                size="sm"
                className="w-full"
              >
                Relatório Completo
              </Button>
              <Button
                type="button"
                onClick={() => setExportMode("simplified_only")}
                variant={exportMode === "simplified_only" ? "primary" : "ghost"}
                size="sm"
                className="w-full"
              >
                Apenas Texto Simplificado
              </Button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-micro-label font-sans text-stone block mb-1">
              Escolha o Formato:
            </label>

            {/* DOCX */}
            <Button
              onClick={handleExportDocx}
              disabled={downloading}
              variant="secondary"
              size="md"
              className="w-full justify-between p-3.5 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-tile bg-ink text-amber flex items-center justify-center font-bold text-xs">
                  DOCX
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-ink">
                    Microsoft Word (.docx)
                  </div>
                  <div className="text-micro-label text-stone">
                    Documento editável formatado
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone" />
            </Button>

            {/* PDF / Imprimir */}
            <Button
              onClick={handlePrintPdf}
              variant="secondary"
              size="md"
              className="w-full justify-between p-3.5 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-tile bg-ink text-amber flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-ink">
                    Imprimir / Salvar em PDF
                  </div>
                  <div className="text-micro-label text-stone">
                    Relatório visual diagramado
                  </div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-stone" />
            </Button>

            {/* Markdown */}
            <Button
              onClick={handleExportMarkdown}
              variant="secondary"
              size="md"
              className="w-full justify-between p-3.5 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-tile bg-ink text-amber flex items-center justify-center font-bold text-xs">
                  MD
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-ink">
                    Markdown (.md)
                  </div>
                  <div className="text-micro-label text-stone">
                    Compatível com portais e repositórios
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone" />
            </Button>

            {/* TXT */}
            <Button
              onClick={handleExportTxt}
              variant="secondary"
              size="md"
              className="w-full justify-between p-3.5 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-tile bg-ink text-amber flex items-center justify-center font-bold text-xs">
                  TXT
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-ink">
                    Texto Puro (.txt)
                  </div>
                  <div className="text-micro-label text-stone">
                    Sem formatação, universal
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-stone" />
            </Button>

            {/* HTML */}
            <Button
              onClick={handleExportHtml}
              variant="secondary"
              size="md"
              className="w-full justify-between p-3.5 h-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-tile bg-ink text-amber flex items-center justify-center font-bold text-xs">
                  HTML
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-ink">
                    Página Web (.html)
                  </div>
                  <div className="text-micro-label text-stone">
                    Arquivo pronto para navegadores
                  </div>
                </div>
              </div>
              <Code className="w-4 h-4 text-stone" />
            </Button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-sand/30 px-6 py-4 border-t border-sand text-right">
          <Button
            onClick={onClose}
            variant="ghost"
            size="md"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
