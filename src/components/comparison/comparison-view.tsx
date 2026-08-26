"use client";

import { useState } from "react";
import { SemanticValidation } from "@/types/analysis";
import { computeWordDiff, calculateDiffStats } from "@/lib/analysis/diff-utils";
import { Copy, Check, ShieldCheck, AlertTriangle, GitCompare, Columns, FileText } from "lucide-react";

interface ComparisonViewProps {
  originalText: string;
  workingText?: string;
  rewrittenText?: string;
  semanticValidation?: SemanticValidation;
  onApplyRewritten?: () => void;
}

export function ComparisonView({
  originalText,
  workingText,
  rewrittenText = "",
  semanticValidation,
  onApplyRewritten
}: ComparisonViewProps) {
  const [targetVersion, setTargetVersion] = useState<"working" | "full_simplified">(
    workingText && workingText !== originalText ? "working" : "full_simplified"
  );
  const [viewMode, setViewMode] = useState<"inline_wordpress" | "split" | "clean">("inline_wordpress");
  const [copied, setCopied] = useState(false);

  const activeTargetText = targetVersion === "working" ? (workingText || originalText) : (rewrittenText || originalText);

  const diffParts = computeWordDiff(originalText, activeTargetText);
  const diffStats = calculateDiffStats(diffParts);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTargetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreserved = semanticValidation ? (semanticValidation.isSemanticPreserved ?? semanticValidation.isValid ?? true) : true;

  return (
    <div className="space-y-4">
      {/* Alerta de Validação Semântica */}
      {semanticValidation && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
          isPreserved
            ? "bg-zinc-50 border-zinc-200 text-zinc-800"
            : "bg-amber-50 border-amber-200 text-amber-950"
        }`}>
          {isPreserved ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-900 block">
              {isPreserved
                ? "Preservação Semântica e Normativa Verificada"
                : `Atenção na Preservação de Fatos (${semanticValidation.preservationScore ?? 85}%)`}
            </span>
            <p className="text-zinc-600">
              {semanticValidation.summary || (isPreserved
                ? "Datas, valores, regras e obrigações foram preservadas na versão simplificada."
                : (semanticValidation.warnings || []).join(" "))}
            </p>
          </div>
        </div>
      )}

      {/* Barra de Controles Unificada */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Seletor de Versão (Segmented Control) */}
          <div className="inline-flex p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 self-start">
            <button
              onClick={() => setTargetVersion("working")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                targetVersion === "working"
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Alterações Aceitas por Você
            </button>
            <button
              onClick={() => setTargetVersion("full_simplified")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                targetVersion === "full_simplified"
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Versão Integral IA
            </button>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Seletor de Modo de Exibição */}
            <div className="inline-flex p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60">
              <button
                onClick={() => setViewMode("inline_wordpress")}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === "inline_wordpress"
                    ? "bg-white text-zinc-900 shadow-xs font-bold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="Modo Diff Unificado"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Diff Unificado</span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === "split"
                    ? "bg-white text-zinc-900 shadow-xs font-bold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="Modo Lado a Lado"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lado a Lado</span>
              </button>
              <button
                onClick={() => setViewMode("clean")}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === "clean"
                    ? "bg-white text-zinc-900 shadow-xs font-bold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="Texto Final Limpo"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Texto Final</span>
              </button>
            </div>

            {/* Botão Copiar */}
            <button
              onClick={handleCopy}
              className="text-xs font-bold bg-[#FBB040] hover:bg-[#e59b2b] text-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all border border-[#d98a1a]"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>
        </div>

        {/* Resumo de Alterações */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 font-medium">
          <span>Diferenças:</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
            +{diffStats.insertions} inserções
          </span>
          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
            -{diffStats.deletions} remoções
          </span>
          {targetVersion === "working" && workingText === originalText && (
            <span className="text-zinc-400 italic">
              (Nenhuma alteração individual aceita ainda)
            </span>
          )}
        </div>
      </div>

      {/* 1. MODO INLINE DIFF */}
      {viewMode === "inline_wordpress" && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="text-base text-zinc-900 leading-relaxed font-sans whitespace-pre-wrap">
            {diffParts.map((part, index) => {
              if (part.type === "delete") {
                return (
                  <span key={index} className="diff-deleted">
                    {part.value}
                  </span>
                );
              }
              if (part.type === "insert") {
                return (
                  <span key={index} className="diff-inserted">
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        </div>
      )}

      {/* 2. MODO LADO A LADO */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Texto Original
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {originalText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "delete") {
                  return (
                    <span key={index} className="diff-deleted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "insert") return null;
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                {targetVersion === "working" ? "Alterações Aceitas" : "Versão Integral IA"}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-zinc-900 leading-relaxed whitespace-pre-wrap font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "insert") {
                  return (
                    <span key={index} className="diff-inserted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "delete") return null;
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODO LIMPO */}
      {viewMode === "clean" && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xs max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {targetVersion === "working" ? "Texto com Alterações Aceitas" : "Versão Final Simplificada"}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
            </span>
          </div>
          <div className="text-base text-zinc-900 leading-relaxed whitespace-pre-wrap font-sans">
            {activeTargetText}
          </div>
        </div>
      )}
    </div>
  );
}

