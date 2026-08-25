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
    critical: { border: "border-zinc-300", badge: "bg-[#18181b] text-[#FBB040]", icon: AlertCircle, label: "Crítico" },
    warning: { border: "border-zinc-300", badge: "bg-[#fef7eb] text-black border border-[#FBB040]", icon: AlertTriangle, label: "Atenção" },
    suggestion: { border: "border-zinc-200", badge: "bg-zinc-100 text-zinc-800", icon: Info, label: "Sugestão" },
    info: { border: "border-zinc-200", badge: "bg-zinc-100 text-zinc-700", icon: Info, label: "Informativo" }
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

  const handleAiRewriteSegment = async () => {
    if (aiRewriting) return;
    setAiRewriting(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const provider = localStorage.getItem("preferred_ai_provider") || "offline";
        if (provider === "gemini") {
          const key = localStorage.getItem("custom_gemini_api_key");
          if (key) {
            headers["x-ai-provider"] = "gemini";
            headers["x-ai-api-key"] = key;
          }
        } else if (provider === "openai") {
          const key = localStorage.getItem("custom_openai_api_key");
          if (key) {
            headers["x-ai-provider"] = "openai";
            headers["x-ai-api-key"] = key;
          }
        }
      } catch (e) {}

      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers,
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
      className={`rounded-3xl border transition-all shadow-xs p-5 sm:p-6 ${
        isApplied
          ? "bg-[#fef7eb]/60 border-[#FBB040]"
          : isIgnored
          ? "bg-zinc-50 border-zinc-200 opacity-60"
          : isSelected
          ? "bg-white border-black ring-2 ring-[#FBB040]"
          : `bg-white ${severityStyles.border} hover:border-[#FBB040]`
      }`}
    >
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${severityStyles.badge} uppercase tracking-wider flex items-center gap-1`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{severityStyles.label}</span>
          </span>

          <span className="text-xs font-bold text-zinc-500 capitalize">
            {finding.category}
          </span>

          {isApplied && (
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-black text-[#FBB040] flex items-center gap-1">
              <Check className="w-3 h-3 text-[#FBB040]" />
              <span>Aplicada</span>
            </span>
          )}

          {isIgnored && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
              Ignorada
            </span>
          )}
        </div>

        {finding.source && (
          <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[180px]" title={finding.source.title}>
            {finding.source.title}
          </span>
        )}
      </div>

      {/* Explicação do problema */}
      <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed mb-3 font-medium">
        {finding.explanation}
      </p>

      {/* VISUALIZAÇÃO DE ANTES E COMO FICARÁ (PREVIEW) */}
      <div className="space-y-2 bg-[#faf9f5] rounded-2xl p-4 border border-zinc-200 my-3">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-zinc-600 font-bold shrink-0 w-24">Como está:</span>
          <div className="font-mono text-zinc-700 bg-white border border-zinc-300 px-2.5 py-1.5 rounded-xl flex-1">
            <span className="line-through text-zinc-500 mr-1">{finding.originalText}</span>
          </div>
        </div>

        {finding.suggestedText ? (
          <div className="flex items-start gap-2 text-xs">
            <span className="text-black font-black shrink-0 w-24">Como ficará:</span>
            <div className="font-mono text-black bg-[#fef7eb] border border-[#FBB040] px-2.5 py-1.5 rounded-xl flex-1 font-bold">
              <span>{finding.suggestedText}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs bg-[#fef7eb] p-2.5 rounded-xl border border-[#FBB040]/60 text-zinc-900">
            <span className="font-medium">Deseja que a IA elabore uma sugestão para esta frase?</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAiRewriteSegment();
              }}
              disabled={aiRewriting}
              className="text-[11px] font-black bg-[#18181b] text-[#FBB040] px-3 py-1 rounded-lg hover:bg-black transition-colors flex items-center gap-1 shrink-0 shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-[#FBB040]" />
              <span>{aiRewriting ? "Reescrevendo..." : "Reescrever com IA"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Recomendação da Metodologia */}
      <div className="text-xs text-zinc-900 font-medium mb-4 bg-white p-3 rounded-2xl border border-zinc-200">
        <strong className="text-black block mb-0.5 font-bold">Recomendação da Unicamp:</strong>
        {finding.recommendation}
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLearnMore();
            }}
            className="text-xs text-zinc-700 hover:text-black hover:underline font-bold flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
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
              className="text-xs text-zinc-700 hover:text-black font-bold flex items-center gap-1 transition-colors"
              title="Solicitar nova alternativa de reescrita inteligente para esta frase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d98a1a]" />
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
              className="text-xs text-zinc-500 hover:text-black hover:bg-zinc-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 font-medium"
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
              className="text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
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
              className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all border border-[#d98a1a]"
            >
              <Check className="w-3.5 h-3.5 text-black" />
              <span>Aceitar Sugestão</span>
            </button>
          )}
        </div>
      </div>

      {/* Fundamentação Pedagógica Expandida */}
      {showExplanation && (
        <div className="mt-4 pt-4 border-t border-zinc-200 text-xs bg-[#faf9f5] p-4 rounded-2xl space-y-2.5 text-zinc-700">
          {detailedLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 py-2">
              <div className="w-3.5 h-3.5 border-2 border-[#18181b] border-t-transparent rounded-full animate-spin" />
              <span>Carregando fundamentação pedagógica...</span>
            </div>
          ) : (
            <>
              <div>
                <strong className="text-black block mb-0.5 font-bold">Por que isso importa na comunicação pública?</strong>
                <p className="leading-relaxed">{detailedData?.whyItMatters || "Comunicações diretas e acessíveis garantem que a pessoa encontre, compreenda e consiga agir sem barreiras."}</p>
              </div>
              <div>
                <strong className="text-black block mb-0.5 font-bold">Dica Prática de Redação:</strong>
                <p className="leading-relaxed">{detailedData?.pedagogicalTip || "Priorize a ordem direta (sujeito + verbo + complemento) e evite períodos com mais de 20 palavras."}</p>
              </div>
              {finding.source?.url && (
                <a
                  href={finding.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-black hover:text-[#d98a1a] hover:underline inline-flex items-center gap-1 font-bold pt-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FBB040]" />
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
