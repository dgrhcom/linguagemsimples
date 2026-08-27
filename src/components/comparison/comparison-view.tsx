"use client";

import { useState } from "react";
import { SemanticValidation } from "@/types/analysis";
import { computeWordDiff, calculateDiffStats } from "@/lib/analysis/diff-utils";
import { Copy, Check, ShieldCheck, AlertTriangle, GitCompare, Columns, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className={`p-4 rounded-tile border flex items-start gap-3 text-xs leading-relaxed ${
          isPreserved
            ? "bg-sand/30 border-sand text-charcoal"
            : "bg-amber/10 border-amber/30 text-ink"
        }`}>
          {isPreserved ? (
            <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold text-ink block">
              {isPreserved
                ? "Preservação Semântica e Normativa Verificada"
                : `Atenção na Preservação de Fatos (${semanticValidation.preservationScore ?? 85}%)`}
            </span>
            <p className="text-stone">
              {semanticValidation.summary || (isPreserved
                ? "Datas, valores, regras e obrigações foram preservadas na versão simplificada."
                : (semanticValidation.warnings || []).join(" "))}
            </p>
          </div>
        </div>
      )}

      {/* Barra de Controles Unificada */}
      <div className="bg-paper p-3.5 sm:p-4 rounded-card border border-sand space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Seletor de Versão (Segmented Control) */}
          <div className="inline-flex p-1 bg-sand/50 rounded-btn border border-sand self-start">
            <Button
              onClick={() => setTargetVersion("working")}
              variant={targetVersion === "working" ? "primary" : "ghost"}
              size="sm"
            >
              Alterações Aceitas por Você
            </Button>
            <Button
              onClick={() => setTargetVersion("full_simplified")}
              variant={targetVersion === "full_simplified" ? "primary" : "ghost"}
              size="sm"
            >
              Versão Integral IA
            </Button>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Seletor de Modo de Exibição */}
            <div className="inline-flex p-1 bg-sand/50 rounded-btn border border-sand">
              <Button
                onClick={() => setViewMode("inline_wordpress")}
                variant={viewMode === "inline_wordpress" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<GitCompare className="w-3.5 h-3.5" />}
                title="Modo Diff Unificado"
              >
                <span className="hidden sm:inline">Diff Unificado</span>
              </Button>
              <Button
                onClick={() => setViewMode("split")}
                variant={viewMode === "split" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<Columns className="w-3.5 h-3.5" />}
                title="Modo Lado a Lado"
              >
                <span className="hidden sm:inline">Lado a Lado</span>
              </Button>
              <Button
                onClick={() => setViewMode("clean")}
                variant={viewMode === "clean" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
                title="Texto Final Limpo"
              >
                <span className="hidden sm:inline">Texto Final</span>
              </Button>
            </div>

            {/* Botão Copiar */}
            <Button
              onClick={handleCopy}
              variant="primary"
              size="md"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* Resumo de Alterações */}
        <div className="flex items-center gap-3 text-micro-label text-stone pt-2 border-t border-sand">
          <span>Diferenças:</span>
          <span className="text-success-dark bg-success-light px-2 py-0.5 rounded-btn font-bold">
            +{diffStats.insertions} inserções
          </span>
          <span className="text-error-dark bg-error-light px-2 py-0.5 rounded-btn font-bold">
            -{diffStats.deletions} remoções
          </span>
          {targetVersion === "working" && workingText === originalText && (
            <span className="text-stone italic">
              (Nenhuma alteração individual aceita ainda)
            </span>
          )}
        </div>
      </div>

      {/* 1. MODO INLINE DIFF */}
      {viewMode === "inline_wordpress" && (
        <div className="bg-paper rounded-card border border-sand p-6 sm:p-8 space-y-3">
          <div className="text-body text-ink leading-relaxed font-sans whitespace-pre-wrap">
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
          <div className="bg-paper rounded-card border border-sand p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <span className="text-micro-label text-stone">
                Texto Original
              </span>
              <span className="text-micro-label text-stone">
                {originalText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-body-sm text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
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

          <div className="bg-paper rounded-card border border-sand p-5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-sand">
              <span className="text-micro-label text-ink">
                {targetVersion === "working" ? "Alterações Aceitas" : "Versão Integral IA"}
              </span>
              <span className="text-micro-label text-stone">
                {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <div className="text-body-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
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
        <div className="bg-paper rounded-card border border-sand p-6 sm:p-8 max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sand">
            <span className="text-micro-label text-stone">
              {targetVersion === "working" ? "Texto com Alterações Aceitas" : "Versão Final Simplificada"}
            </span>
            <span className="text-micro-label text-stone">
              {activeTargetText.split(/\s+/).filter(Boolean).length} palavras
            </span>
          </div>
          <div className="text-body text-ink leading-relaxed whitespace-pre-wrap font-sans">
            {activeTargetText}
          </div>
        </div>
      )}
    </div>
  );
}
