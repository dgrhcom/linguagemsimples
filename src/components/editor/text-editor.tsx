"use client";

import { useState, useEffect, useRef } from "react";
import { DocumentType } from "@/types/document";
import { AnalysisInput } from "@/types/analysis";
import { Trash2, Upload, FileText, File, Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentTypeSelector } from "./document-type-selector";

interface TextEditorProps {
  onAnalyze: (input: AnalysisInput) => void;
  isLoading: boolean;
  initialText?: string;
  initialDocumentType?: DocumentType;
}

export function TextEditor({
  onAnalyze,
  isLoading,
  initialText = "",
  initialDocumentType = "comunicado"
}: TextEditorProps) {
  const [text, setText] = useState(initialText);
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocumentType);
  const [targetAudience, setTargetAudience] = useState("");
  const [textGoal, setTextGoal] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (formatType: "bold" | "italic" | "bullet" | "number") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    let replacement = "";
    let newCursorPos = start;

    if (formatType === "bold") {
      replacement = selectedText ? `**${selectedText}**` : `**texto em negrito**`;
      newCursorPos = selectedText ? end + 4 : start + 2;
    } else if (formatType === "italic") {
      replacement = selectedText ? `*${selectedText}*` : `*texto em itálico*`;
      newCursorPos = selectedText ? end + 2 : start + 1;
    } else if (formatType === "bullet") {
      if (selectedText) {
        replacement = selectedText
          .split("\n")
          .map(line => `- ${line.replace(/^[-*•]\s*/, "")}`)
          .join("\n");
      } else {
        replacement = "- Item da lista";
      }
      newCursorPos = start + replacement.length;
    } else if (formatType === "number") {
      if (selectedText) {
        replacement = selectedText
          .split("\n")
          .map((line, idx) => `${idx + 1}. ${line.replace(/^\d+[.)]\s*/, "")}`)
          .join("\n");
      } else {
        replacement = "1. Item numerado";
      }
      newCursorPos = start + replacement.length;
    }

    const updated = text.substring(0, start) + replacement + text.substring(end);
    setText(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);

  useEffect(() => {
    if (initialDocumentType) {
      setDocumentType(initialDocumentType);
    }
  }, [initialDocumentType]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      // Text files (txt, md, csv, rtf)
      if (["txt", "md", "csv", "rtf"].includes(extension || "")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) setText(content);
          setIsImporting(false);
        };
        reader.onerror = () => {
          alert("Erro ao ler o arquivo. Tente novamente.");
          setIsImporting(false);
        };
        reader.readAsText(file);
      }
      // DOCX files
      else if (extension === "docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value) {
          setText(result.value);
        } else {
          alert("Não foi possível extrair texto do arquivo DOCX.");
        }
        setIsImporting(false);
      }
      // PDF files
      else if (extension === "pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }

        if (fullText.trim()) {
          setText(fullText.trim());
        } else {
          alert("Não foi possível extrair texto do arquivo PDF. O PDF pode conter apenas imagens.");
        }
        setIsImporting(false);
      }
      // HTML files
      else if (extension === "html" || extension === "htm") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const htmlContent = event.target?.result as string;
          // Extract text from HTML
          const div = document.createElement("div");
          div.innerHTML = htmlContent;
          const textContent = div.textContent || div.innerText || "";
          if (textContent.trim()) {
            setText(textContent.trim());
          } else {
            alert("Não foi possível extrair texto do arquivo HTML.");
          }
          setIsImporting(false);
        };
        reader.onerror = () => {
          alert("Erro ao ler o arquivo HTML.");
          setIsImporting(false);
        };
        reader.readAsText(file);
      }
      // Unsupported format
      else {
        alert(`Formato "${extension}" não suportado. Formatos aceitos: TXT, MD, CSV, DOCX, PDF, HTML.`);
        setIsImporting(false);
      }
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Erro ao importar arquivo. Verifique se o arquivo não está corrompido.");
      setIsImporting(false);
    }

    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAnalyze({
      text: text.trim(),
      documentType,
      targetAudience: targetAudience.trim() || undefined,
      textGoal: textGoal.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DocumentTypeSelector
        selectedType={documentType}
        onSelectType={setDocumentType}
      />

      <div className="bg-ivory-light border border-stone rounded-[24px] overflow-hidden">
        {/* Barra superior */}
        <div className="bg-oat-warm/40 border-b border-stone px-5 py-3 flex justify-between items-center gap-3">
          <span className="text-[16px] tracking-[-0.08px] font-sans text-slate-dark">
            Inserir Texto para Simplificação
          </span>

          <div className="flex items-center gap-2">
            {text.trim().length > 0 && (
              <Button
                type="button"
                onClick={() => setText("")}
                variant="destructive"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Limpar
              </Button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.rtf,.docx,.pdf,.html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              size="sm"
              disabled={isImporting}
              leftIcon={isImporting ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
            >
              {isImporting ? "Importando..." : "Importar Arquivo"}
            </Button>
          </div>
        </div>

        {/* Barra de Formatação de Estilo */}
        <div className="bg-oat-warm/20 border-b border-stone px-5 py-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyFormatting("bold")}
            title="Negrito (**texto**)"
            className="p-1.5 rounded-[6px] text-slate-dark hover:bg-oat-warm transition-colors flex items-center justify-center"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("italic")}
            title="Itálico (*texto*)"
            className="p-1.5 rounded-[6px] text-slate-dark hover:bg-oat-warm transition-colors flex items-center justify-center"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-stone mx-1" />
          <button
            type="button"
            onClick={() => applyFormatting("bullet")}
            title="Lista com marcadores (- item)"
            className="p-1.5 rounded-[6px] text-slate-dark hover:bg-oat-warm transition-colors flex items-center justify-center"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("number")}
            title="Lista numerada (1. item)"
            className="p-1.5 rounded-[6px] text-slate-dark hover:bg-oat-warm transition-colors flex items-center justify-center"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-cloud-medium ml-auto">
            Suporta formatação Markdown
          </span>
        </div>

        {/* Área do Textarea */}
        <div className="p-5 sm:p-6 bg-ivory-light">
          <label htmlFor="main-textarea" className="sr-only">
            Texto para avaliação e simplificação
          </label>
          <textarea
            id="main-textarea"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole ou digite aqui seu texto para análise..."
            rows={10}
            className="w-full text-slate-dark text-[20px] leading-[1.4] placeholder:text-cloud-medium border-0 focus:ring-0 focus:outline-hidden resize-y min-h-[220px] bg-transparent"
            style={{ fontFamily: "var(--font-anthropic-serif)" }}
            required
          />

          {/* Campos Opcionais */}
          <div className="mt-4 pt-4 border-t border-stone">
            <Button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              size="sm"
            >
              <span>{showAdvanced ? "▲ Ocultar campos" : "▼ Informar público-alvo e objetivo do texto"}</span>
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-oat-warm/30 p-4 rounded-[12px] border border-stone">
                <div>
                  <label htmlFor="audience-input" className="block text-[16px] tracking-[-0.08px] font-sans text-slate-dark mb-1">
                    Público-alvo
                  </label>
                  <input
                    id="audience-input"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: População geral, Estudantes, Servidores"
                    className="w-full text-[16px] bg-ivory-light border border-stone rounded-[8px] px-3 py-2 text-slate-dark focus:ring-1 focus:ring-cloud-dark focus:border-cloud-dark outline-hidden"
                  />
                  <p className="text-[12px] text-cloud-medium mt-1">
                    Ajuda a calibrar o nível de termos técnicos.
                  </p>
                </div>

                <div>
                  <label htmlFor="goal-input" className="block text-[16px] tracking-[-0.08px] font-sans text-slate-dark mb-1">
                    Objetivo da comunicação
                  </label>
                  <input
                    id="goal-input"
                    type="text"
                    value={textGoal}
                    onChange={(e) => setTextGoal(e.target.value)}
                    placeholder="Ex: Solicitar documentos, Convocação, Informar prazos"
                    className="w-full text-[16px] bg-ivory-light border border-stone rounded-[8px] px-3 py-2 text-slate-dark focus:ring-1 focus:ring-cloud-dark focus:border-cloud-dark outline-hidden"
                  />
                  <p className="text-[12px] text-cloud-medium mt-1">
                    Permite avaliar se o texto é acionável.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Rodapé */}
        <div className="bg-oat-warm/40 border-t border-stone px-5 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="text-[16px] tracking-[-0.08px] text-slate-dark flex items-center gap-3" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
            <span><strong>{wordCount}</strong> palavras</span>
            <span className="text-cloud-medium">•</span>
            <span><strong>{charCount}</strong> caracteres</span>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !text.trim()}
            variant="primary"
            size="lg"
            leftIcon={isLoading ? (
              <div className="w-4 h-4 border-2 border-ivory-light border-t-transparent rounded-full animate-spin" />
            ) : null}
          >
            {isLoading ? "Avaliando..." : "Analisar Texto"}
          </Button>
        </div>
      </div>
    </form>
  );
}
