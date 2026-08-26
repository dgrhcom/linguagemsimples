"use client";

import { useState, useEffect } from "react";
import { Finding } from "@/types/analysis";
import { Pencil, Eye, Sparkles, RotateCcw, FileText } from "lucide-react";

interface AnnotatedTextProps {
  text: string;
  originalInputText?: string;
  findings: Finding[];
  selectedFindingId?: string;
  selectedFinding?: Finding | null;
  onSelectFinding: (finding: Finding | null) => void;
  onUpdateText?: (newText: string) => void;
  onReanalyze?: (newText: string) => void;
  isReanalyzing?: boolean;
}

export function AnnotatedText({
  text,
  originalInputText,
  findings,
  selectedFindingId,
  selectedFinding,
  onSelectFinding,
  onUpdateText,
  onReanalyze,
  isReanalyzing = false
}: AnnotatedTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(text || "");

  useEffect(() => {
    if (!isEditing) {
      setDraftText(text || "");
    }
  }, [text, isEditing]);

  const activeSelectedId = selectedFinding?.id || selectedFindingId;
  if (!text && !draftText) return null;

  const currentWordCount = (isEditing ? draftText : text).trim().split(/\s+/).filter(Boolean).length;
  const currentCharCount = (isEditing ? draftText : text).length;
  const isModifiedFromOriginal = Boolean(originalInputText && originalInputText.trim() !== text.trim());

  const handleSaveTextOnly = () => {
    if (!draftText.trim()) return;
    if (onUpdateText) {
      onUpdateText(draftText.trim());
    }
    setIsEditing(false);
  };

  const handleSaveAndReanalyze = () => {
    if (!draftText.trim()) return;
    if (onUpdateText) {
      onUpdateText(draftText.trim());
    }
    if (onReanalyze) {
      onReanalyze(draftText.trim());
    }
    setIsEditing(false);
  };

  // 1. Renderização dos trechos anotados quando em Modo Leitura
  const renderAnnotatedContent = () => {
    const occurrences: { start: number; end: number; text: string; finding: Finding }[] = [];

    for (const f of findings) {
      if (!f.originalText) continue;
      let idx = 0;
      while ((idx = text.indexOf(f.originalText, idx)) !== -1) {
        occurrences.push({
          start: idx,
          end: idx + f.originalText.length,
          text: f.originalText,
          finding: f
        });
        idx += f.originalText.length;
      }
    }

    occurrences.sort((a, b) => a.start - b.start);

    const filteredOccurrences: typeof occurrences = [];
    let lastEnd = 0;
    for (const occ of occurrences) {
      if (occ.start >= lastEnd) {
        filteredOccurrences.push(occ);
        lastEnd = occ.end;
      }
    }

    const segments: React.ReactNode[] = [];
    let currentPos = 0;

    filteredOccurrences.forEach((occ, i) => {
      if (occ.start > currentPos) {
        segments.push(
          <span key={`plain-${currentPos}`}>
            {text.substring(currentPos, occ.start)}
          </span>
        );
      }

      const isSelected = activeSelectedId === occ.finding.id;
      const severityColor = {
        critical: "bg-[#fdecd0] text-black border-b-2 border-[#d98a1a] hover:bg-[#fbd38d]",
        warning: "bg-[#fef7eb] text-zinc-900 border-b-2 border-[#FBB040] hover:bg-[#fdecd0]",
        suggestion: "bg-zinc-100 text-zinc-900 border-b-2 border-zinc-400 hover:bg-zinc-200",
        info: "bg-zinc-100 text-zinc-900 border-b-2 border-zinc-300 hover:bg-zinc-200"
      }[occ.finding.severity];

      segments.push(
        <mark
          key={`mark-${occ.start}-${i}`}
          onClick={() => onSelectFinding(occ.finding)}
          className={`cursor-pointer px-1.5 py-0.5 rounded-md transition-all font-semibold ${severityColor} ${
            isSelected ? "!bg-[#FBB040] !text-black ring-2 ring-black font-black shadow-xs" : ""
          }`}
          title={`Clique para ver a orientação sobre '${occ.text}'`}
        >
          {occ.text}
        </mark>
      );

      currentPos = occ.end;
    });

    if (currentPos < text.length) {
      segments.push(
        <span key={`plain-${currentPos}`}>
          {text.substring(currentPos)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      {/* Barra Superior do Documento com Alternância Visualização / Edição */}
      <div className="bg-[#faf9f5] border-b border-zinc-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-zinc-600" />
          <span className="text-xs font-black text-zinc-900">
            {isEditing ? "Editar Texto do Documento" : "Texto em Análise"}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-md">
            {currentWordCount} palavras
          </span>
          {isModifiedFromOriginal && !isEditing && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Alterações aplicadas
            </span>
          )}
        </div>

        {/* Botão de Alternância de Modo */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={() => {
                setDraftText(text);
                setIsEditing(false);
              }}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ver Apontamentos</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftText(text);
                setIsEditing(true);
              }}
              className="text-xs font-bold text-zinc-800 hover:text-black bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Pencil className="w-3.5 h-3.5 text-[#FBB040]" />
              <span>Editar Texto</span>
            </button>
          )}
        </div>
      </div>

      {/* Corpo do Documento */}
      <div className="p-5 sm:p-6 bg-white min-h-[300px]">
        {isEditing ? (
          <div className="space-y-3">
            <label htmlFor="document-edit-textarea" className="sr-only">
              Edição do texto em análise
            </label>
            <textarea
              id="document-edit-textarea"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={12}
              className="w-full text-zinc-900 text-base leading-relaxed p-4 bg-[#faf9f5]/50 border-2 border-[#FBB040] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#FBB040] focus:bg-white resize-y font-sans transition-all"
              placeholder="Edite seu texto livremente aqui para corrigir erros ou reestruturar períodos..."
              autoFocus
            />
            <p className="text-[11px] text-zinc-500">
              💡 Dica: Você pode reescrever parágrafos inteiros, corrigir pontuações ou dividir frases longas e depois clicar em <strong>&quot;Salvar e Reanalisar&quot;</strong>.
            </p>
          </div>
        ) : (
          <div className="leading-relaxed text-zinc-900 whitespace-pre-wrap font-sans text-base">
            {renderAnnotatedContent()}
          </div>
        )}
      </div>

      {/* Rodapé do Documento com Ações Contextuais */}
      <div className="bg-[#faf9f5] border-t border-zinc-200 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="text-xs text-zinc-500 font-medium">
          <span>{currentCharCount} caracteres</span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraftText(text);
                  setIsEditing(false);
                }}
                className="text-xs text-zinc-600 hover:text-black font-semibold px-3 py-1.5 rounded-xl hover:bg-zinc-200/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTextOnly}
                disabled={!draftText.trim()}
                className="text-xs font-bold text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
              >
                Salvar Texto
              </button>
              {onReanalyze && (
                <button
                  type="button"
                  onClick={handleSaveAndReanalyze}
                  disabled={isReanalyzing || !draftText.trim()}
                  className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-black px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all border border-[#d98a1a] disabled:opacity-50"
                >
                  {isReanalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Reanalisando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Salvar e Reanalisar</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {onReanalyze && isModifiedFromOriginal && (
                <button
                  type="button"
                  onClick={() => onReanalyze(text)}
                  disabled={isReanalyzing}
                  className="text-xs font-black bg-zinc-900 hover:bg-black text-[#FBB040] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                  title="Executar nova avaliação sobre as alterações que você fez ou aceitou"
                >
                  {isReanalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#FBB040] border-t-transparent rounded-full animate-spin" />
                      <span>Reanalisando...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-[#FBB040]" />
                      <span>Reanalisar Texto Atualizado</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

