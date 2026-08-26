import { useState, useEffect } from "react";
import { Finding } from "@/types/analysis";
import {
  Check,
  Undo2,
  Sparkles,
  EyeOff,
  Pencil,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  SpellCheck,
  AlignLeft,
  HeartHandshake,
  AlertCircle,
  FileCheck2
} from "lucide-react";
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

  // Estados de edição inline
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
  const hasSuggestion = Boolean(finding.suggestedText && finding.suggestedText.trim() !== finding.originalText.trim());

  // Configuração visual da categoria
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "spelling":
      case "grammar":
        return { label: "Ortografia & Gramática", icon: SpellCheck, badge: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "sentence":
        return { label: "Frase Longa", icon: AlignLeft, badge: "bg-amber-50 text-amber-900 border-amber-200" };
      case "inclusion":
      case "nonsexist":
        return { label: "Linguagem Inclusiva", icon: HeartHandshake, badge: "bg-purple-50 text-purple-900 border-purple-200" };
      default:
        return { label: "Clareza & Simplicidade", icon: FileCheck2, badge: "bg-blue-50 text-blue-900 border-blue-200" };
    }
  };

  const catConfig = getCategoryConfig(finding.category);
  const CatIcon = catConfig.icon;

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

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 p-5 ${
        isApplied
          ? "bg-[#faf9f5]/70 border-[#FBB040]/50"
          : isIgnored
          ? "bg-zinc-50 border-zinc-200/60 opacity-50"
          : isSelected
          ? "bg-white border-zinc-900 ring-2 ring-[#FBB040] shadow-sm"
          : "bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs"
      }`}
    >
      {/* 1. Header do Card (Categoria + Status) */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${catConfig.badge}`}>
            <CatIcon className="w-3 h-3 opacity-90" />
            <span>{catConfig.label}</span>
          </span>

          {finding.severity === "critical" && !isApplied && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
              Prioritário
            </span>
          )}

          {isCustomized && !isApplied && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Editada por você
            </span>
          )}
        </div>

        <div>
          {isApplied ? (
            <span className="text-xs font-bold text-zinc-900 bg-[#FBB040]/30 border border-[#FBB040] px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 text-black stroke-[3]" />
              <span>Aplicada</span>
            </span>
          ) : isIgnored ? (
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md">
              Ignorada
            </span>
          ) : null}
        </div>
      </div>

      {/* 2. Mensagem do problema */}
      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-3">
        {finding.explanation}
      </p>

      {/* 3. Bloco Comparativo: Original vs Sugestão */}
      <div className="space-y-2 rounded-xl bg-zinc-50/80 p-3 border border-zinc-200/70 mb-3">
        {/* Trecho Original */}
        <div className="text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block mb-1">
            Texto Original:
          </span>
          <p className="font-mono text-zinc-600 bg-white border border-zinc-200/80 rounded-lg p-2.5 line-through opacity-80 leading-relaxed">
            {finding.originalText}
          </p>
        </div>

        {/* Sugestão / Modo Edição / Aguardando IA */}
        {isEditing ? (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-600">
              <span className="font-bold text-zinc-900 flex items-center gap-1">
                <Pencil className="w-3 h-3 text-[#FBB040]" />
                <span>Edição Manual da Sugestão:</span>
              </span>
              <span>{customDraft.trim().split(/\s+/).filter(Boolean).length} palavras</span>
            </div>
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono font-bold text-zinc-900 bg-white border-2 border-[#FBB040] rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-[#FBB040]"
              placeholder="Digite sua versão personalizada..."
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-zinc-500 hover:text-black font-medium px-2.5 py-1 rounded-md hover:bg-zinc-200/60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomDraft}
                disabled={!customDraft.trim()}
                className="text-xs font-bold bg-zinc-900 text-white hover:bg-black px-3 py-1 rounded-md transition-colors disabled:opacity-40"
              >
                Salvar Rascunho
              </button>
              {onApplySuggestion && (
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  disabled={!customDraft.trim()}
                  className="text-xs font-bold bg-[#FBB040] hover:bg-[#e59b2b] text-black px-3 py-1 rounded-md transition-colors disabled:opacity-40"
                >
                  Salvar e Aplicar
                </button>
              )}
            </div>
          </div>
        ) : hasSuggestion ? (
          <div className="text-xs pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
              Sugestão de Simplificação:
            </span>
            <div className="font-mono text-zinc-900 font-bold bg-[#fffdfa] border border-[#FBB040] rounded-lg p-2.5 leading-relaxed">
              {finding.suggestedText}
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <p className="font-bold text-amber-950">Frase longa ({finding.originalText.split(/\s+/).filter(Boolean).length} palavras)</p>
                <p className="text-amber-800 text-[11px] mt-0.5">{finding.recommendation}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAiRewriteSegment();
                }}
                disabled={aiRewriting}
                className="shrink-0 text-xs font-black bg-zinc-900 hover:bg-black text-[#FBB040] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBB040]" />
                <span>{aiRewriting ? "Reescrevendo..." : "Reescrever com IA"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Barra Inferior de Ações (Unificada e sem duplicações) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Botão de Dica / Fundamentação */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLearnMore();
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 transition-colors"
          >
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showExplanation ? "Ocultar fundamentação" : "Por que isso importa?"}</span>
          </button>

          {/* Botão de Ignorar */}
          {!isApplied && onIgnoreFinding && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIgnoreFinding(finding);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 font-medium flex items-center gap-1 transition-colors"
              title="Ignorar esta recomendação"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isIgnored ? "Reativar" : "Ignorar"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Ações quando já foi aplicada */}
          {isApplied && onRevertSuggestion && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRevertSuggestion(finding);
              }}
              className="text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Reverter</span>
            </button>
          )}

          {/* Ações quando NÃO foi aplicada */}
          {!isApplied && !isEditing && (
            <>
              {/* Botão de Editar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomDraft(finding.suggestedText || finding.originalText);
                  setIsEditing(true);
                }}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                title="Editar sugestão manualmente"
              >
                <Pencil className="w-3 h-3 text-zinc-600" />
                <span>Editar</span>
              </button>

              {/* Botão de IA alternativo (quando já tem sugestão) */}
              {hasSuggestion && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAiRewriteSegment();
                  }}
                  disabled={aiRewriting}
                  className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Gerar nova versão com IA"
                >
                  <Sparkles className="w-3 h-3 text-[#d98a1a]" />
                  <span>{aiRewriting ? "Gerando..." : "Nova IA"}</span>
                </button>
              )}

              {/* Botão Principal: Aceitar Sugestão */}
              {hasSuggestion && onApplySuggestion && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplySuggestion(finding);
                  }}
                  className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all border border-[#d98a1a]"
                >
                  <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                  <span>Aceitar</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 5. Fundamentação Pedagógica (Accordion Suave) */}
      {showExplanation && (
        <div className="mt-3 pt-3 border-t border-zinc-200/80 text-xs bg-white p-3.5 rounded-xl space-y-2 text-zinc-600 animate-in fade-in">
          {detailedLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 py-1">
              <div className="w-3 h-3 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
              <span>Consultando diretrizes da Unicamp...</span>
            </div>
          ) : (
            <>
              <div>
                <strong className="text-zinc-900 block mb-0.5 font-bold">Por que isso importa na comunicação pública?</strong>
                <p className="leading-relaxed">{detailedData?.whyItMatters || "Comunicações diretas e acessíveis garantem que o cidadão encontre, compreenda e aja sem dúvidas na primeira leitura."}</p>
              </div>
              <div>
                <strong className="text-zinc-900 block mb-0.5 font-bold">Dica Prática:</strong>
                <p className="leading-relaxed">{detailedData?.pedagogicalTip || finding.recommendation}</p>
              </div>
              {finding.source?.url && (
                <a
                  href={finding.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-900 hover:text-[#d98a1a] hover:underline inline-flex items-center gap-1 font-bold pt-0.5"
                >
                  <BookOpen className="w-3 h-3 text-[#FBB040]" />
                  <span>Consultar guia no portal Linguagem Simples Unicamp</span>
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

