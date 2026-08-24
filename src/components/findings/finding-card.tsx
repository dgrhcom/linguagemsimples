"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";
import { AlertTriangle, AlertCircle, Info, Check, Undo2, BookOpen, HelpCircle, Sparkles, EyeOff } from "lucide-react";

interface FindingCardProps {
  finding: Finding;
  targetAudience?: string;
  documentType?: string;
  onApplySuggestion?: (finding: Finding) => void;
  onRevertSuggestion?: (finding: Finding) => void;
  onIgnoreFinding?: (finding: Finding) => void;
  onUpdateFindingSuggestion?: (finding: Finding, newSuggestion: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function FindingCard({
  finding,
  targetAudience,
  documentType,
  onApplySuggestion,
  onRevertSuggestion,
  onIgnoreFinding,
  onUpdateFindingSuggestion,
  isSelected = false,
  onSelect
}: FindingCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [detailedData, setDetailedData] = useState<{ whyItMatters?: string; pedagogicalTip?: string } | null>(null);
  const [aiRewriting, setAiRewriting] = useState(false);

  const isApplied = finding.status === "applied";
  const isIgnored = finding.status === "ignored";

  const severityStyles = {
    critical: { border: "border-rose-300", badge: "bg-rose-100 text-rose-800", icon: AlertCircle, label: "Crítico" },
    warning: { border: "border-amber-300", badge: "bg-amber-100 text-amber-800", icon: AlertTriangle, label: "Atenção" },
    suggestion: { border: "border-sky-300", badge: "bg-sky-100 text-sky-800", icon: Info, label: "Sugestão" },
    info: { border: "border-slate-300", badge: "bg-slate-100 text-slate-800", icon: Info, label: "Informativo" }
  }[finding.severity];

  const Icon = severityStyles.icon;

  const handleLearnMore = async () => {
    setShowExplanation(!showExplanation);
    if (!detailedData && !detailedLoading) {
      setDetailedLoading(true);
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finding })
        });
        if (res.ok) {
          const data = await res.json();
          setDetailedData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDetailedLoading(false);
      }
    }
  };

  // Solicitar reescrita inteligente por IA para este trecho específico
  const handleAiRewriteSegment = async () => {
    if (aiRewriting) return;
    setAiRewriting(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finding.originalText,
          mode: "segment",
          segmentIssue: finding.explanation,
          targetAudience,
          documentType: documentType || "general"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rewrittenText && onUpdateFindingSuggestion) {
          onUpdateFindingSuggestion(finding, data.rewrittenText);
        }
      }
    } catch (e) {
      console.error("Erro ao reescrever trecho com IA:", e);
    } finally {
      setAiRewriting(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all shadow-xs p-5 ${
        isApplied
          ? "bg-emerald-50/40 border-emerald-300"
          : isIgnored
          ? "bg-slate-50 border-slate-200 opacity-60"
          : isSelected
          ? "bg-white border-[#005a87] ring-2 ring-[#005a87]/20"
          : `bg-white ${severityStyles.border}`
      }`}
    >
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${severityStyles.badge} uppercase tracking-wider flex items-center gap-1`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{severityStyles.label}</span>
          </span>

          <span className="text-xs font-semibold text-slate-500 capitalize">
            {finding.category}
          </span>

          {isApplied && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Aplicada</span>
            </span>
          )}

          {isIgnored && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
              Ignorada
            </span>
          )}
        </div>

        {finding.source && (
          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]" title={finding.source.title}>
            {finding.source.title}
          </span>
        )}
      </div>

      {/* Explicação do problema */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
        {finding.explanation}
      </p>

      {/* VISUALIZAÇÃO DE ANTES E COMO FICARÁ (PREVIEW) */}
      <div className="space-y-2 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 my-3">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-rose-700 font-bold shrink-0 w-24">Como está:</span>
          <div className="font-mono text-slate-800 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md flex-1">
            <span className="line-through text-rose-900 bg-rose-200/70 px-1 rounded mr-1">{finding.originalText}</span>
          </div>
        </div>

        {finding.suggestedText ? (
          <div className="flex items-start gap-2 text-xs">
            <span className="text-emerald-700 font-bold shrink-0 w-24">Como ficará:</span>
            <div className="font-mono text-slate-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex-1 font-semibold">
              <span className="text-emerald-900 bg-emerald-200/70 px-1 rounded">{finding.suggestedText}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs bg-blue-50/60 p-2 rounded-lg border border-blue-100 text-blue-900">
            <span>Deseja que a IA gere uma proposta de reescrita completa para esta frase?</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAiRewriteSegment();
              }}
              disabled={aiRewriting}
              className="text-[11px] font-bold bg-[#005a87] text-white px-2.5 py-1 rounded-md hover:bg-[#00476b] transition-colors flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{aiRewriting ? "Reescrevendo..." : "Reescrever com IA"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Recomendação da Metodologia */}
      <div className="text-xs text-slate-800 font-medium mb-4 bg-sky-50/60 p-2.5 rounded-xl border border-sky-200">
        <strong className="text-sky-900 block mb-0.5">Recomendação da Unicamp:</strong>
        {finding.recommendation}
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLearnMore();
            }}
            className="text-xs text-[#005a87] hover:underline font-semibold flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplanation ? "Ocultar fundamentação" : "Por que isso importa?"}</span>
          </button>

          {!isApplied && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAiRewriteSegment();
              }}
              disabled={aiRewriting}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 transition-colors"
              title="Solicitar nova alternativa de reescrita inteligente para esta frase"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{aiRewriting ? "Gerando..." : "Reescrever com IA"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isApplied && onIgnoreFinding && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIgnoreFinding(finding);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isIgnored ? "Reativar" : "Ignorar"}</span>
            </button>
          )}

          {isApplied && onRevertSuggestion && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRevertSuggestion(finding);
              }}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Reverter Alteração</span>
            </button>
          )}

          {!isApplied && finding.suggestedText && onApplySuggestion && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApplySuggestion(finding);
              }}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all hover:shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aceitar Sugestão</span>
            </button>
          )}
        </div>
      </div>

      {/* Fundamentação Pedagógica Expandida */}
      {showExplanation && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-xs bg-slate-50 p-4 rounded-xl space-y-2.5 text-slate-700">
          {detailedLoading ? (
            <div className="flex items-center gap-2 text-slate-500 py-2">
              <div className="w-3.5 h-3.5 border-2 border-[#005a87] border-t-transparent rounded-full animate-spin" />
              <span>Carregando fundamentação pedagógica...</span>
            </div>
          ) : (
            <>
              <div>
                <strong className="text-slate-900 block mb-0.5">Por que isso importa na comunicação pública?</strong>
                <p className="leading-relaxed">{detailedData?.whyItMatters || "Comunicações diretas e acessíveis garantem que a pessoa encontre, compreenda e consiga agir sem barreiras."}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Dica Prática de Redação:</strong>
                <p className="leading-relaxed">{detailedData?.pedagogicalTip || "Priorize a ordem direta (sujeito + verbo + complemento) e evite períodos com mais de 20 palavras."}</p>
              </div>
              {finding.source?.url && (
                <a
                  href={finding.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#005a87] hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Consultar guia completo no site da Unicamp</span>
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
