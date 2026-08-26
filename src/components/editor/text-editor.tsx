"use client";

import { useState, useEffect } from "react";
import { DocumentType } from "@/types/document";
import { AnalysisInput } from "@/types/analysis";
import { Sparkles, Upload, Trash2 } from "lucide-react";
import documentTypesData from "@/data/document-types/document-types.json";



interface TextEditorProps {
  onAnalyze: (input: AnalysisInput) => void;
  isLoading: boolean;
  initialText?: string;
}

export function TextEditor({ onAnalyze, isLoading, initialText = "" }: TextEditorProps) {
  const [text, setText] = useState(initialText);
  const [documentType, setDocumentType] = useState<DocumentType>("general");
  const [targetAudience, setTargetAudience] = useState("");
  const [textGoal, setTextGoal] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);



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
      alert("Para arquivos DOCX ou PDF, você pode copiar e colar o texto diretamente nesta versão.");
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
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Barra superior de ações rápidas */}
      <div className="bg-[#faf9f5] border-b border-zinc-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="doc-type-select" className="text-xs font-black text-black">
            Tipo de Texto:
          </label>
          <select
            id="doc-type-select"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="text-xs bg-white border border-zinc-300 rounded-xl px-3 py-1.5 font-bold text-zinc-900 focus:ring-2 focus:ring-[#FBB040] focus:border-[#FBB040] outline-hidden"
          >
            {documentTypesData.map(dt => (
              <option key={dt.type} value={dt.type}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {text.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs font-semibold text-zinc-600 hover:text-red-600 bg-white border border-zinc-300 hover:bg-red-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Limpar texto do editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          <label className="cursor-pointer text-xs font-bold text-zinc-700 hover:text-black bg-white border border-zinc-300 hover:bg-zinc-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Importar TXT</span>
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="sr-only" />
          </label>
        </div>

      </div>


      {/* Área do Textarea */}
      <div className="p-4 sm:p-6 bg-white">
        <label htmlFor="main-textarea" className="sr-only">
          Texto para avaliação e simplificação
        </label>
        <textarea
          id="main-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole ou digite aqui seu texto para análise... Ex: comunicados, ofícios, e-mails, relatórios ou informações de serviços públicos."
          rows={10}
          className="w-full text-zinc-900 text-base leading-relaxed placeholder:text-zinc-400 border-0 focus:ring-0 focus:outline-hidden resize-y min-h-[220px] bg-transparent"
          required
        />

        {/* Campos Opcionais Contextuais */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold text-zinc-700 hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <span>{showAdvanced ? "▲ Ocultar campos de público e objetivo" : "▼ Informar público-alvo e objetivo do texto (Recomendado para melhor análise)"}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-[#faf9f5] p-4 rounded-2xl border border-zinc-200">
              <div>
                <label htmlFor="audience-input" className="block text-xs font-bold text-black mb-1">
                  Quem vai ler este texto? (Público-alvo)
                </label>
                <input
                  id="audience-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: População geral, Estudantes, Servidores, Idosos"
                  className="w-full text-xs bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-[#FBB040] focus:border-[#FBB040] outline-hidden"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Ajuda a calibrar o nível de termos técnicos e vocabulário.
                </p>
              </div>

              <div>
                <label htmlFor="goal-input" className="block text-xs font-bold text-black mb-1">
                  Qual o objetivo da comunicação?
                </label>
                <input
                  id="goal-input"
                  type="text"
                  value={textGoal}
                  onChange={(e) => setTextGoal(e.target.value)}
                  placeholder="Ex: Solicitar documentos, Convocação, Informar prazos"
                  className="w-full text-xs bg-white border border-zinc-300 rounded-xl px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-[#FBB040] focus:border-[#FBB040] outline-hidden"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Permite avaliar se o texto é acionável e atinge seu propósito.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Rodapé do Editor */}
      <div className="bg-[#faf9f5] border-t border-zinc-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="text-xs text-zinc-600 flex items-center gap-3 font-medium">
          <span><strong>{wordCount}</strong> palavras</span>
          <span>•</span>
          <span><strong>{charCount}</strong> caracteres</span>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="bg-[#FBB040] hover:bg-[#e59b2b] disabled:opacity-50 disabled:cursor-not-allowed text-[#111111] font-black px-6 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 border border-[#d98a1a]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Avaliando texto...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Analisar e Simplificar Texto</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
