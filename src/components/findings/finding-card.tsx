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
  FileCheck2,
  Settings,
  Info
} from "lucide-react";
import { getStoredAiHeaders } from "@/lib/ai";
import { Button } from "@/components/ui/button";

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
  const [rewriteNotice, setRewriteNotice] = useState<{
    type: "offline" | "error" | "unchanged";
    message: string;
    detail?: string;
  } | null>(null);

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

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "spelling":
      case "grammar":
        return { label: "Ortografia & Gramática", icon: SpellCheck, badge: "bg-success-light text-success-dark border-success/30" };
      case "sentence":
        return { label: "Frase Longa", icon: AlignLeft, badge: "bg-amber/10 text-amber-dark border-amber/30" };
      case "inclusion":
      case "nonsexist":
        return { label: "Linguagem Inclusiva", icon: HeartHandshake, badge: "bg-purple-50 text-purple-900 border-purple-200" };
      default:
        return { label: "Clareza & Simplicidade", icon: FileCheck2, badge: "bg-info-light text-info-dark border-info/30" };
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
    setRewriteNotice(null);
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
        const isDifferent = data.rewrittenText && data.rewrittenText.trim() !== finding.originalText.trim();

        if (isDifferent) {
          setRewriteNotice(null);
          if (onUpdateFindingSuggestion) {
            onUpdateFindingSuggestion(finding, data.rewrittenText);
            setCustomDraft(data.rewrittenText);
            setIsCustomized(false);
          }
        } else if (data.status === "offline_mode" || data.isOffline) {
          setRewriteNotice({
            type: "offline",
            message: "Motor Unicamp Offline ativo (sem IA generativa configurada).",
            detail: "Configure uma chave de API (Google Gemini ou OpenAI) nas configurações, ou personalize manualmente."
          });
        } else if (data.status === "ai_error" || data.error) {
          setRewriteNotice({
            type: "error",
            message: "Falha na comunicação com a API de IA.",
            detail: data.error || "Verifique se a chave de API está ativa."
          });
        } else {
          setRewriteNotice({
            type: "unchanged",
            message: "A IA manteve a frase original inalterada.",
            detail: "Você pode personalizá-la no botão 'Editar'."
          });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setRewriteNotice({
          type: "error",
          message: "Erro ao processar reescrita com IA.",
          detail: errData.message || errData.error || "Verifique suas configurações."
        });
      }
    } catch (e: any) {
      console.error("Erro ao reescrever trecho:", e);
      setRewriteNotice({
        type: "error",
        message: "Erro de conexão com o serviço de IA.",
        detail: e?.message || "Verifique sua conexão."
      });
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
    setRewriteNotice(null);
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
    setRewriteNotice(null);
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-card border transition-all duration-200 p-5 ${
        isApplied
          ? "bg-sand/30 border-amber/30"
          : isIgnored
          ? "bg-sand/20 border-sand opacity-50"
          : isSelected
          ? "bg-paper border-ink ring-2 ring-amber/40"
          : "bg-paper border-sand hover:border-deep-stone"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-caption font-sans font-semibold px-2.5 py-0.5 rounded-btn border flex items-center gap-1.5 ${catConfig.badge}`}>
            <CatIcon className="w-3 h-3 opacity-90" />
            <span>{catConfig.label}</span>
          </span>

          {finding.severity === "critical" && !isApplied && (
            <span className="text-micro-label font-sans px-2 py-0.5 rounded-btn bg-error-light text-error-dark border border-error/30">
              Prioritário
            </span>
          )}

          {isCustomized && !isApplied && (
            <span className="text-micro-label font-sans px-2 py-0.5 rounded-btn bg-amber/10 text-amber-dark border border-amber/30">
              Editada por você
            </span>
          )}
        </div>

        <div>
          {isApplied ? (
            <span className="text-body-sm font-sans font-semibold text-ink bg-amber/20 border border-amber/40 px-2.5 py-0.5 rounded-btn flex items-center gap-1">
              <Check className="w-3 h-3 text-ink stroke-[3]" />
              <span>Aplicada</span>
            </span>
          ) : isIgnored ? (
            <span className="text-body-sm font-sans text-stone bg-sand/50 px-2.5 py-0.5 rounded-btn">
              Ignorada
            </span>
          ) : null}
        </div>
      </div>

      {/* Problema */}
      <p className="text-body-sm text-charcoal leading-relaxed mb-3">
        {finding.explanation}
      </p>

      {/* Bloco Comparativo */}
      <div className="space-y-2 rounded-tile bg-sand/30 p-3 border border-sand mb-3">
        <div className="text-body-sm">
          <span className="text-micro-label font-sans text-stone block mb-1">
            Texto Original
          </span>
          <p className="font-mono text-charcoal bg-paper border border-sand rounded-input p-2.5 line-through opacity-80 leading-relaxed">
            {finding.originalText}
          </p>
        </div>

        {isEditing ? (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-caption font-sans text-stone">
              <span className="font-semibold text-ink flex items-center gap-1">
                <Pencil className="w-3 h-3 text-amber" />
                <span>Edição Manual:</span>
              </span>
              <span>{customDraft.trim().split(/\s+/).filter(Boolean).length} palavras</span>
            </div>
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={2}
              className="w-full text-body-sm font-mono font-semibold text-ink bg-paper border-2 border-amber rounded-input p-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber"
              placeholder="Digite sua versão..."
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveCustomDraft} disabled={!customDraft.trim()} variant="secondary" size="sm">
                Salvar
              </Button>
              {onApplySuggestion && (
                <Button type="button" onClick={handleSaveAndApply} disabled={!customDraft.trim()} variant="primary" size="sm">
                  Salvar e Aplicar
                </Button>
              )}
            </div>
          </div>
        ) : hasSuggestion ? (
          <div className="text-body-sm pt-1">
            <span className="text-micro-label font-sans text-stone block mb-1">
              Sugestão de Simplificação
            </span>
            <div className="font-mono text-ink font-semibold bg-paper-light border border-amber/40 rounded-input p-2.5 leading-relaxed">
              {finding.suggestedText}
            </div>
          </div>
        ) : (
          <div className="pt-1 space-y-2">
            <div className="bg-amber/10 border border-amber/30 rounded-input p-3 text-body-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <p className="font-semibold text-ink">Frase longa ({finding.originalText.split(/\s+/).filter(Boolean).length} palavras)</p>
                <p className="text-charcoal text-caption mt-0.5">{finding.recommendation}</p>
              </div>
              <Button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAiRewriteSegment(); }}
                disabled={aiRewriting}
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber" />}
              >
                {aiRewriting ? "Reescrevendo..." : "Reescrever com IA"}
              </Button>
            </div>

            {rewriteNotice && (
              <div className={`p-3 rounded-tile text-body-sm space-y-2 border animate-in fade-in slide-in-from-top-1 ${
                rewriteNotice.type === "offline"
                  ? "bg-amber/10 border-amber/40 text-ink"
                  : rewriteNotice.type === "error"
                  ? "bg-error-light border-error/30 text-error-dark"
                  : "bg-info-light border-info/30 text-info-dark"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      {rewriteNotice.type === "offline" ? (
                        <Info className="w-3.5 h-3.5 text-amber shrink-0" />
                      ) : rewriteNotice.type === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5 text-error shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-info shrink-0" />
                      )}
                      <span>{rewriteNotice.message}</span>
                    </div>
                    {rewriteNotice.detail && (
                      <p className="text-caption opacity-90 leading-relaxed">{rewriteNotice.detail}</p>
                    )}
                  </div>
                  <Button type="button" onClick={() => setRewriteNotice(null)} variant="ghost" size="xs" className="p-0.5" leftIcon={<X className="w-3.5 h-3.5" />} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-ai-settings"))} variant="secondary" size="xs" leftIcon={<Settings className="w-3 h-3 text-amber" />}>
                    Configurar IA
                  </Button>
                  <Button type="button" onClick={() => { setCustomDraft(finding.suggestedText || finding.originalText); setIsEditing(true); setRewriteNotice(null); }} variant="ghost" size="xs">
                    Editar manualmente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleLearnMore(); }}
            variant="ghost"
            size="sm"
            leftIcon={showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          >
            {showExplanation ? "Ocultar fundamentação" : "Por que isso importa?"}
          </Button>

          {!isApplied && onIgnoreFinding && (
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); onIgnoreFinding(finding); }}
              variant="ghost"
              size="sm"
              leftIcon={<EyeOff className="w-3.5 h-3.5" />}
            >
              {isIgnored ? "Reativar" : "Ignorar"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isApplied && onRevertSuggestion && (
            <Button type="button" onClick={(e) => { e.stopPropagation(); onRevertSuggestion(finding); }} variant="secondary" size="sm" leftIcon={<Undo2 className="w-3.5 h-3.5" />}>
              Reverter
            </Button>
          )}

          {!isApplied && !isEditing && (
            <>
              <Button type="button" onClick={(e) => { e.stopPropagation(); setCustomDraft(finding.suggestedText || finding.originalText); setIsEditing(true); }} variant="secondary" size="sm" leftIcon={<Pencil className="w-3 h-3 text-stone" />}>
                Editar
              </Button>

              {hasSuggestion && (
                <Button type="button" onClick={(e) => { e.stopPropagation(); handleAiRewriteSegment(); }} disabled={aiRewriting} variant="secondary" size="sm" leftIcon={<Sparkles className="w-3 h-3 text-amber" />}>
                  {aiRewriting ? "Gerando..." : "Nova IA"}
                </Button>
              )}

              {hasSuggestion && onApplySuggestion && (
                <Button type="button" onClick={(e) => { e.stopPropagation(); onApplySuggestion(finding); }} variant="success" size="sm" leftIcon={<Check className="w-3.5 h-3.5 stroke-[3]" />}>
                  Aceitar
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fundamentação */}
      {showExplanation && (
        <div className="mt-3 pt-3 border-t border-sand text-body-sm bg-sand/20 p-3.5 rounded-tile space-y-2 text-charcoal animate-in fade-in">
          {detailedLoading ? (
            <div className="flex items-center gap-2 text-stone py-1">
              <div className="w-3 h-3 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              <span>Consultando diretrizes da Unicamp...</span>
            </div>
          ) : (
            <>
              <div>
                <strong className="text-ink block mb-0.5">Por que isso importa na comunicação pública?</strong>
                <p className="leading-relaxed">{detailedData?.whyItMatters || "Comunicações diretas e acessíveis garantem que o cidadão encontre, compreenda e aja sem dúvidas na primeira leitura."}</p>
              </div>
              <div>
                <strong className="text-ink block mb-0.5">Dica Prática:</strong>
                <p className="leading-relaxed">{detailedData?.pedagogicalTip || finding.recommendation}</p>
              </div>
              {finding.source?.url && (
                <a href={finding.source.url} target="_blank" rel="noopener noreferrer" className="ghost-link text-caption text-ink inline-flex items-center gap-1 pt-0.5">
                  <BookOpen className="w-3 h-3 text-amber" />
                  <span>Consultar guia Unicamp</span>
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
