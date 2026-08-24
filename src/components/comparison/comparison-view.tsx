"use client";

import { useState } from "react";
import { SemanticValidation } from "@/types/analysis";
import { computeWordDiff, calculateDiffStats, DiffPart } from "@/lib/analysis/diff-utils";
import { Copy, Check, ShieldCheck, AlertTriangle, GitCompare, Columns, FileText, Sparkles, CheckCircle2, History } from "lucide-react";

interface ComparisonViewProps {
  originalText: string;
  workingText?: string;
  rewrittenText: string;
  semanticValidation?: SemanticValidation;
}

export function ComparisonView({
  originalText,
  workingText,
  rewrittenText,
  semanticValidation
}: ComparisonViewProps) {
  // Alvo da comparação: ou o texto com as revisões aceitas pelo usuário, ou a versão 100% simplificada
  const [targetVersion, setTargetVersion] = useState<"working" | "full_simplified">(
    workingText && workingText !== originalText ? "working" : "full_simplified"
  );
  const [viewMode, setViewMode] = useState<"inline_wordpress" | "split" | "clean">("inline_wordpress");
  const [copied, setCopied] = useState(false);

  const activeTargetText = targetVersion === "working" ? (workingText || originalText) : rewrittenText;

  // Computa o diff palavra a palavra
  const diffParts = computeWordDiff(originalText, activeTargetText);
  const diffStats = calculateDiffStats(diffParts);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTargetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Validação Semântica */}
      {semanticValidation && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
          semanticValidation.isValid
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
            : "bg-amber-50/80 border-amber-300 text-amber-950"
        }`}>
          {semanticValidation.isValid ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {semanticValidation.isValid
                ? "Preservação Semântica e Normativa Verificada (100%)"
                : `Atenção na Preservação de Fatos (${semanticValidation.preservationScore}%)`}
            </div>
            <p>
              {semanticValidation.isValid
                ? "Todas as datas, valores, leis, obrigações e informações essenciais foram mantidas na versão simplificada."
                : semanticValidation.warnings.join(" ")}
            </p>
          </div>
        </div>
      )}

      {/* Barra de Controle de Versões e Visualização Estilo WordPress */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Seletor da Versão Comparada */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#164e87]" />
              <span>Comparar Original com:</span>
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTargetVersion("working")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  targetVersion === "working"
                    ? "bg-[#164e87] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Alterações Aceitas por Você
              </button>
              <button
                onClick={() => setTargetVersion("full_simplified")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  targetVersion === "full_simplified"
                    ? "bg-[#164e87] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Versão 100% Simplificada (Unicamp + IA)
              </button>
            </div>
          </div>

          {/* Botão Copiar */}
          <button
            onClick={handleCopy}
            className="text-xs font-bold bg-[#164e87] hover:bg-[#0f3761] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copiado!" : "Copiar Versão Revisada"}</span>
          </button>
        </div>

        {/* Estatísticas de Diff e Seletor de Modo de Exibição */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Badges de Alterações */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600">Diferenças:</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              +{diffStats.insertions} inserções
            </span>
            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md border border-rose-200">
              -{diffStats.deletions} remoções
            </span>
            {targetVersion === "working" && workingText === originalText && (
              <span className="text-slate-500 italic">
                (Nenhuma sugestão aceita ainda. Você pode aceitar na aba &quot;Problemas&quot; ou visualizar a &quot;Versão 100% Simplificada&quot;).
              </span>
            )}
          </div>

          {/* Seletor de Modo de Exibição (WordPress Inline vs Split vs Clean) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("inline_wordpress")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === "inline_wordpress" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Exibição unificada com remoções e inserções destacadas no mesmo texto"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600" />
              <span>Modo WordPress (Inline Diff)</span>
            </button>

            <button
              onClick={() => setViewMode("split")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === "split" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Exibição em duas colunas"
            >
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>Lado a Lado (Split)</span>
            </button>

            <button
              onClick={() => setViewMode("clean")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === "clean" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Apenas o texto final limpo"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Versão Final Limpa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. MODO WORDPRESS (INLINE DIFF) */}
      {viewMode === "inline_wordpress" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#164e87]" />
              <span>Comparação de Revisão (Estilo WordPress)</span>
            </span>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-rose-200 border border-rose-300 rounded-xs" /> Texto removido
              <span className="inline-block w-3 h-3 bg-emerald-200 border border-emerald-300 rounded-xs ml-2" /> Texto adicionado
            </div>
          </div>

          <div className="text-base text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Texto Original
              </span>
              <span className="text-xs text-slate-500">
                {originalText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "delete") {
                  return (
                    <span key={index} className="diff-deleted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "insert") {
                  return null; // Oculta adições na coluna original
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>

          {/* Coluna Direita: Revisado */}
          <div className="bg-emerald-50/30 rounded-3xl border border-emerald-300 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {targetVersion === "working" ? "Texto com Alterações Aceitas" : "Versão 100% Simplificada"}
                </span>
              </span>
              <span className="text-xs text-emerald-800 font-medium">
                {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-sans">
              {diffParts.map((part, index) => {
                if (part.type === "insert") {
                  return (
                    <span key={index} className="diff-inserted">
                      {part.value}
                    </span>
                  );
                }
                if (part.type === "delete") {
                  return null; // Oculta deleções na coluna final
                }
                return <span key={index}>{part.value}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODO LIMPO (CLEAN VIEW) */}
      {viewMode === "clean" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {targetVersion === "working" ? "Texto com Suas Revisões Aplicadas" : "Versão Final Simplificada"}
              </span>
            </span>
            <span className="text-xs text-slate-500">
              {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
            </span>
          </div>
          <div className="text-base text-slate-900 leading-relaxed whitespace-pre-wrap font-sans">
            {activeTargetText}
          </div>
        </div>
      )}
    </div>
  );
}
