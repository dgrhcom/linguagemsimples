"use client";

import { useState, useEffect } from "react";
import { DocumentType } from "@/types/document";
import { AnalysisInput } from "@/types/analysis";
import { Trash2, Upload } from "lucide-react";
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) setText(content);
      };
      reader.readAsText(file);
    } else {
      alert("Para arquivos DOCX ou PDF, você pode copiar e colar o texto diretamente.");
    }
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

      <div className="bg-paper border border-sand rounded-card overflow-hidden">
        {/* Barra superior */}
        <div className="bg-sand/40 border-b border-sand px-5 py-3 flex justify-between items-center gap-3">
          <span className="text-body-sm font-display text-ink">
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

            <label className="cursor-pointer">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Importar TXT
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="sr-only" />
              </Button>
            </label>
          </div>
        </div>

        {/* Área do Textarea */}
        <div className="p-5 sm:p-6 bg-paper-light">
          <label htmlFor="main-textarea" className="sr-only">
            Texto para avaliação e simplificação
          </label>
          <textarea
            id="main-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole ou digite aqui seu texto para análise..."
            rows={10}
            className="w-full text-ink text-body leading-relaxed placeholder:text-stone border-0 focus:ring-0 focus:outline-hidden resize-y min-h-[220px] bg-transparent"
            required
          />

          {/* Campos Opcionais */}
          <div className="mt-4 pt-4 border-t border-sand">
            <Button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="ghost"
              size="sm"
            >
              <span>{showAdvanced ? "▲ Ocultar campos" : "▼ Informar público-alvo e objetivo do texto"}</span>
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-sand/30 p-4 rounded-tile border border-sand">
                <div>
                  <label htmlFor="audience-input" className="block text-body-sm font-display text-ink mb-1">
                    Público-alvo
                  </label>
                  <input
                    id="audience-input"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: População geral, Estudantes, Servidores"
                    className="w-full text-body-sm bg-paper-light border border-sand rounded-input px-3 py-2 text-ink focus:ring-1 focus:ring-deep-stone focus:border-deep-stone outline-hidden"
                  />
                  <p className="text-micro-label text-stone mt-1">
                    Ajuda a calibrar o nível de termos técnicos.
                  </p>
                </div>

                <div>
                  <label htmlFor="goal-input" className="block text-body-sm font-display text-ink mb-1">
                    Objetivo da comunicação
                  </label>
                  <input
                    id="goal-input"
                    type="text"
                    value={textGoal}
                    onChange={(e) => setTextGoal(e.target.value)}
                    placeholder="Ex: Solicitar documentos, Convocação, Informar prazos"
                    className="w-full text-body-sm bg-paper-light border border-sand rounded-input px-3 py-2 text-ink focus:ring-1 focus:ring-deep-stone focus:border-deep-stone outline-hidden"
                  />
                  <p className="text-micro-label text-stone mt-1">
                    Permite avaliar se o texto é acionável.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Rodapé */}
        <div className="bg-sand/40 border-t border-sand px-5 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="text-body-sm text-charcoal flex items-center gap-3">
            <span><strong>{wordCount}</strong> palavras</span>
            <span className="text-stone">•</span>
            <span><strong>{charCount}</strong> caracteres</span>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !text.trim()}
            variant="primary"
            size="lg"
            leftIcon={isLoading ? (
              <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
            ) : null}
          >
            {isLoading ? "Avaliando..." : "Analisar Texto"}
          </Button>
        </div>
      </div>
    </form>
  );
}
