"use client";

import { useState } from "react";
import { SemanticValidation } from "@/types/analysis";
import { computeWordDiff, calculateDiffStats, DiffPart } from "@/lib/analysis/diff-utils";
import { Copy, Check, ShieldCheck, AlertTriangle, GitCompare, Columns, FileText, Sparkles, CheckCircle2, History } from "lucide-react";

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
  // Alvo da comparação: ou o texto com as revisões aceitas pelo usuário, ou a versão 100% simplificada
  const [targetVersion, setTargetVersion] = useState<"working" | "full_simplified">(
    workingText && workingText !== originalText ? "working" : "full_simplified"
  );
  const [viewMode, setViewMode] = useState<"inline_wordpress" | "split" | "clean">("inline_wordpress");
  const [copied, setCopied] = useState(false);

  const activeTargetText = targetVersion === "working" ? (workingText || originalText) : (rewrittenText || originalText);

  // Computa o diff palavra a palavra
  const diffParts = computeWordDiff(originalText, activeTargetText);
  const diffStats = calculateDiffStats(diffParts);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTargetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreserved = semanticValidation ? (semanticValidation.isSemanticPreserved ?? semanticValidation.isValid ?? true) : true;

  return (
    <div className="space-y-6">
      {/* Alerta de Validação Semântica */}
      {semanticValidation && (
        <div className={`p-5 rounded-3xl border flex items-start gap-3 text-xs leading-relaxed ${
          isPreserved
            ? "bg-[#faf9f5] border-zinc-200 text-zinc-900"
            : "bg-[#fef7eb] border-[#FBB040] text-zinc-950"
        }`}>
          {isPreserved ? (
            <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#d98a1a] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-black text-sm text-black">
              {isPreserved
                ? "Preservação Semântica e Normativa Verificada (100%)"
                : `Atenção na Preservação de Fatos (${semanticValidation.preservationScore ?? 85}%)`}
            </div>
            <p className="font-medium text-zinc-600">
              {semanticValidation.summary || (isPreserved
                ? "Todas as datas, valores, leis, obrigações e informações essenciais foram mantidas na versão simplificada."
                : (semanticValidation.warnings || []).join(" "))}
            </p>
          </div>
        </div>
      )}

      {/* Barra de Controle de Versões e Visualização Estilo WordPress */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Seletor da Versão Comparada */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-black flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#FBB040]" />
              <span>Comparar Original com:</span>
            </span>
            <div className="flex items-center bg-[#faf9f5] border border-zinc-200 p-1 rounded-2xl">
              <button
                onClick={() => setTargetVersion("working")}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors ${
                  targetVersion === "working"
                    ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Alterações Aceitas por Você
              </button>
              <button
                onClick={() => setTargetVersion("full_simplified")}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors ${
                  targetVersion === "full_simplified"
                    ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Versão 100% Simplificada (Unicamp + IA)
              </button>
            </div>
          </div>

          {/* Botão Copiar */}
          <button
            onClick={handleCopy}
            className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors border border-[#d98a1a]"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            <span>{copied ? "Copiado!" : "Copiar Versão Revisada"}</span>
          </button>
        </div>

        {/* Estatísticas de Diff e Seletor de Modo de Exibição */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
          {/* Badges de Alterações */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-zinc-700">Diferenças:</span>
            <span className="bg-[#fef7eb] text-black font-black px-2.5 py-0.5 rounded-lg border border-[#FBB040]">
              +{diffStats.insertions} inserções
            </span>
            <span className="bg-zinc-100 text-zinc-600 font-bold px-2.5 py-0.5 rounded-lg border border-zinc-300 line-through">
              -{diffStats.deletions} remoções
            </span>
            {targetVersion === "working" && workingText === originalText && (
              <span className="text-zinc-500 italic">
                (Nenhuma sugestão aceita ainda. Você pode aceitar na aba &quot;Problemas&quot; ou visualizar a &quot;Versão 100% Simplificada&quot;).
              </span>
            )}
          </div>

          {/* Seletor de Modo de Exibição (WordPress Inline vs Split vs Clean) */}
          <div className="flex items-center bg-[#faf9f5] border border-zinc-200 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("inline_wordpress")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                viewMode === "inline_wordpress" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
              title="Exibição unificada com remoções e inserções destacadas no mesmo texto"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Modo WordPress (Inline Diff)</span>
            </button>

            <button
              onClick={() => setViewMode("split")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                viewMode === "split" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
              title="Exibição em duas colunas"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado (Split)</span>
            </button>

            <button
              onClick={() => setViewMode("clean")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                viewMode === "clean" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
              title="Apenas o texto final limpo"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Versão Final Limpa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. MODO WORDPRESS (INLINE DIFF) */}
      {viewMode === "inline_wordpress" && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#FBB040]" />
              <span>Comparação de Revisão (Estilo WordPress)</span>
            </span>
            <div className="text-xs text-zinc-600 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-zinc-200 border border-zinc-300 rounded-xs" /> Texto removido
              <span className="inline-block w-3 h-3 bg-[#fef7eb] border border-[#FBB040] rounded-xs ml-2" /> Texto adicionado
            </div>
          </div>

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

      {/* 2. MODO LADO A LADO (SPLIT VIEW) */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Original */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Texto Original
              </span>
              <span className="text-xs text-zinc-500 font-bold">
                {originalText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "delete") {
                  return (
                    <span key={index} className="diff-deleted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "insert") {
                  return null;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>

          {/* Coluna Direita: Revisado */}
          <div className="bg-[#faf9f5] rounded-3xl border border-zinc-300 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FBB040]" />
                <span>
                  {targetVersion === "working" ? "Texto com Alterações Aceitas" : "Versão 100% Simplificada"}
                </span>
              </span>
              <span className="text-xs text-black font-bold">
                {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-zinc-900 leading-relaxed whitespace-pre-wrap font-sans font-medium">
              {diffParts.map((part, index) => {
                if (part.type === "insert") {
                  return (
                    <span key={index} className="diff-inserted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "delete") {
                  return null;
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODO LIMPO (CLEAN VIEW) */}
      {viewMode === "clean" && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-sm font-black text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FBB040]" />
              <span>
                {targetVersion === "working" ? "Texto com Suas Revisões Aplicadas" : "Versão Final Simplificada"}
              </span>
            </span>
            <span className="text-xs text-zinc-500 font-bold">
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
