"use client";

import { useState } from "react";
import { DocumentType } from "@/types/document";
import { AnalysisInput } from "@/types/analysis";
import { Sparkles, Upload, FileText, ChevronDown, CheckCircle, HelpCircle } from "lucide-react";
import documentTypesData from "@/data/document-types/document-types.json";
import casosUnicampData from "@/data/examples/casos-unicamp.json";

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

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleLoadExample = (exampleId: string) => {
    const example = casosUnicampData.find(e => e.id === exampleId);
    if (example) {
      setText(example.textoOriginal);
      setDocumentType(example.tipoDocumento as DocumentType);
      setTargetAudience(example.publicoAlvo);
      setTextGoal("Comunicação clara e acessível");
    }
  };

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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Barra superior de ações rápidas */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="doc-type-select" className="text-xs font-semibold text-slate-700">
            Tipo de Texto:
          </label>
          <select
            id="doc-type-select"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {documentTypesData.map(dt => (
              <option key={dt.type} value={dt.type}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar TXT</span>
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="sr-only" />
          </label>

          <div className="relative group">
            <button
              type="button"
              className="text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Carregar Exemplo da Unicamp</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 hidden group-hover:block group-focus-within:block">
              {casosUnicampData.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleLoadExample(ex.id)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors block"
                >
                  <div className="font-semibold">{ex.titulo}</div>
                  <div className="text-[10px] text-slate-500 truncate">{ex.textoOriginal}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Área do Textarea */}
      <div className="p-4 sm:p-6">
        <label htmlFor="main-textarea" className="sr-only">
          Texto para avaliação e simplificação
        </label>
        <textarea
          id="main-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole ou digite aqui seu texto para análise... Ex: comunicados, ofícios, e-mails, relatórios ou informações de serviços públicos."
          rows={10}
          className="w-full text-slate-800 text-base leading-relaxed placeholder:text-slate-400 border-0 focus:ring-0 focus:outline-hidden resize-y min-h-[220px]"
          required
        />

        {/* Campos Opcionais Contextuais */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <span>{showAdvanced ? "▲ Ocultar campos de público e objetivo" : "▼ Informar público-alvo e objetivo do texto (Recomendado para melhor análise)"}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label htmlFor="audience-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Quem vai ler este texto? (Público-alvo)
                </label>
                <input
                  id="audience-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: População geral, Estudantes, Servidores, Idosos"
                  className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Ajuda a calibrar o nível de termos técnicos e vocabulário.
                </p>
              </div>

              <div>
                <label htmlFor="goal-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Qual o objetivo da comunicação?
                </label>
                <input
                  id="goal-input"
                  type="text"
                  value={textGoal}
                  onChange={(e) => setTextGoal(e.target.value)}
                  placeholder="Ex: Solicitar documentos, Convocação, Informar prazos"
                  className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Permite avaliar se o texto é acionável e atinge seu propósito.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Rodapé do Editor */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span><strong>{wordCount}</strong> palavras</span>
          <span>•</span>
          <span><strong>{charCount}</strong> caracteres</span>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Avaliando texto...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analisar e Simplificar Texto</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
