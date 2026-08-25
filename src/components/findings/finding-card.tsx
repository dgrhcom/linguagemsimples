import { useState, useEffect } from "react";
import { Finding } from "@/types/analysis";
import { AlertTriangle, AlertCircle, Info, Check, Undo2, BookOpen, HelpCircle, Sparkles, EyeOff, Pencil, X, RotateCcw, CheckCheck, SpellCheck } from "lucide-react";
import { getStoredAiHeaders } from "@/lib/ai";

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

  // Estados para edição personalizada da sugestão
  const [isEditing, setIsEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState(finding.suggestedText || "");
  const [isCustomized, setIsCustomized] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setCustomDraft(finding.suggestedText || "");
    }
  }, [finding.suggestedText, isEditing]);

  const isApplied = finding.status === "applied";
  const isIgnored = finding.status === "ignored";

  const severityStyles = {
    critical: { border: "border-zinc-300", badge: "bg-[#18181b] text-[#FBB040]", icon: AlertCircle, label: "Crítico" },
    warning: { border: "border-zinc-300", badge: "bg-[#fef7eb] text-black border border-[#FBB040]", icon: AlertTriangle, label: "Atenção" },
    suggestion: { border: "border-zinc-200", badge: "bg-zinc-100 text-zinc-800", icon: Info, label: "Sugestão" },
    info: { border: "border-zinc-200", badge: "bg-zinc-100 text-zinc-700", icon: Info, label: "Informativo" }
  }[finding.severity];

  const Icon = finding.category === "spelling" ? SpellCheck : severityStyles.icon;

  const handleLearnMore = async () => {
    setShowExplanation(!showExplanation);
    if (!detailedData && !detailedLoading) {
      setDetailedLoading(true);
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getStoredAiHeaders()
          },
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
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getStoredAiHeaders()
        },
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
          setCustomDraft(data.rewrittenText);
          setIsCustomized(false);
        }
      }
    } catch (e) {
      console.error("Erro ao reescrever trecho com IA:", e);
    } finally {
      setAiRewriting(false);
    }
  };

  const handleSaveCustomDraft = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (onUpdateFindingSuggestion) {
      onUpdateFindingSuggestion(finding, trimmed);
    }
    setIsCustomized(true);
    setIsEditing(false);
  };

  const handleSaveAndApply = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (onUpdateFindingSuggestion) {
      onUpdateFindingSuggestion(finding, trimmed);
    }
    if (onApplySuggestion) {
      onApplySuggestion({ ...finding, suggestedText: trimmed });
    }
    setIsCustomized(true);
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    setCustomDraft(finding.suggestedText || "");
    setIsEditing(false);
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
            <span>{finding.category === "spelling" ? "Ortografia" : severityStyles.label}</span>
          </span>

          <span className="text-xs font-bold text-zinc-500 capitalize">
            {finding.category === "spelling" ? "Revisão Ortográfica" : finding.category}
          </span>

          {isApplied && (
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-black text-[#FBB040] flex items-center gap-1">
              <Check className="w-3 h-3 text-[#FBB040]" />
              <span>Aplicada</span>
            </span>
          )}

          {isCustomized && !isApplied && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef7eb] text-zinc-800 border border-[#FBB040]">
              Editada por você
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

      {/* VISUALIZAÇÃO DE ANTES E COMO FICARÁ COM EDITOR */}
      <div className="space-y-2.5 bg-[#faf9f5] rounded-2xl p-4 border border-zinc-200 my-3">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-zinc-600 font-bold shrink-0 w-24 pt-1">Como está:</span>
          <div className="font-mono text-zinc-700 bg-white border border-zinc-300 px-2.5 py-1.5 rounded-xl flex-1">
            <span className="line-through text-zinc-500 mr-1">{finding.originalText}</span>
          </div>
        </div>

        {/* Bloco de Como Ficará ou Modo de Edição */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black font-black flex items-center gap-1">
                <Pencil className="w-3.5 h-3.5 text-[#FBB040]" />
                <span>Editar Sugestão Personalizada:</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                {customDraft.trim().split(/\s+/).filter(Boolean).length} palavras • {customDraft.length} caracteres
              </span>
            </div>
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={3}
              className="w-full text-xs font-mono font-bold text-zinc-950 bg-[#fef7eb] border-2 border-[#FBB040] rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#FBB040] resize-y"
              placeholder="Digite sua versão personalizada..."
              autoFocus
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustomDraft}
                  disabled={!customDraft.trim() || customDraft.trim() === finding.originalText.trim()}
                  className="text-xs font-black bg-[#18181b] text-[#FBB040] hover:bg-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5 text-[#FBB040]" />
                  <span>Salvar Alteração</span>
                </button>
                {!isApplied && onApplySuggestion && (
                  <button
                    type="button"
                    onClick={handleSaveAndApply}
                    disabled={!customDraft.trim() || customDraft.trim() === finding.originalText.trim()}
                    className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs border border-[#d98a1a] disabled:opacity-40"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-black" />
                    <span>Salvar e Aplicar</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="text-xs text-zinc-600 hover:text-black font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        ) : finding.suggestedText && finding.suggestedText.trim() !== finding.originalText.trim() ? (
          <div className="flex items-start gap-2 text-xs">
            <div className="shrink-0 w-24 pt-1 flex items-center justify-between">
              <span className="text-black font-black">Como ficará:</span>
            </div>
            <div className="font-mono text-black bg-[#fef7eb] border border-[#FBB040] px-2.5 py-1.5 rounded-xl flex-1 font-bold flex items-start justify-between gap-2 group">
              <span className="flex-1">{finding.suggestedText}</span>
              {!isApplied && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomDraft(finding.suggestedText || "");
                    setIsEditing(true);
                  }}
                  className="text-[11px] font-bold text-zinc-700 hover:text-black bg-white hover:bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all shrink-0 shadow-2xs"
                  title="Editar ou personalizar o texto desta sugestão"
                >
                  <Pencil className="w-3 h-3 text-zinc-700" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs bg-[#fef7eb] p-2.5 rounded-xl border border-[#FBB040]/60 text-zinc-900">
            <span className="font-medium">Deseja que a IA elabore uma sugestão para esta frase?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomDraft(finding.originalText);
                  setIsEditing(true);
                }}
                className="text-[11px] font-bold bg-white text-zinc-800 border border-zinc-300 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <Pencil className="w-3 h-3 text-zinc-600" />
                <span>Escrever manualmente</span>
              </button>
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

          {!isApplied && !isEditing && (
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

          {!isApplied && !isEditing && finding.suggestedText && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCustomDraft(finding.suggestedText || "");
                setIsEditing(true);
              }}
              className="text-xs text-zinc-700 hover:text-black font-bold flex items-center gap-1 transition-colors"
              title="Personalizar texto antes de aplicar"
            >
              <Pencil className="w-3.5 h-3.5 text-zinc-500" />
              <span>Editar sugestão</span>
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

          {!isApplied && !isEditing && finding.suggestedText && onApplySuggestion && (
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
