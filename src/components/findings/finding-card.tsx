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
        return { label: "Ortografia & Gramática", icon: SpellCheck, badgeBg: "#ecfdf5", badgeText: "#065f46", badgeBorder: "#a7f3d0" };
      case "sentence":
        return { label: "Frase Longa", icon: AlignLeft, badgeBg: "rgba(217, 119, 87, 0.1)", badgeText: "#c6613f", badgeBorder: "rgba(217, 119, 87, 0.3)" };
      case "inclusion":
      case "nonsexist":
        return { label: "Linguagem Inclusiva", icon: HeartHandshake, badgeBg: "#f5f3ff", badgeText: "#5b21b6", badgeBorder: "#ddd6fe" };
      default:
        return { label: "Clareza & Simplicidade", icon: FileCheck2, badgeBg: "#eff6ff", badgeText: "#1e40af", badgeBorder: "#bfdbfe" };
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

  const getCardStyle = () => {
    if (isApplied) return { backgroundColor: "rgba(227, 218, 204, 0.3)", borderColor: "rgba(217, 119, 87, 0.3)" };
    if (isIgnored) return { backgroundColor: "rgba(227, 218, 204, 0.2)", borderColor: "#cccbc8", opacity: 0.5 };
    if (isSelected) return { backgroundColor: "#faf9f5", borderColor: "#141413", boxShadow: "0 0 0 2px rgba(217, 119, 87, 0.4)" };
    return { backgroundColor: "#faf9f5", borderColor: "#cccbc8" };
  };

  return (
    <div
      onClick={onSelect}
      className="rounded-[24px] border transition-all duration-200 p-5 cursor-pointer"
      style={getCardStyle()}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] font-semibold px-2.5 py-0.5 rounded-[8px] border flex items-center gap-1.5"
            style={{ backgroundColor: catConfig.badgeBg, color: catConfig.badgeText, borderColor: catConfig.badgeBorder }}
          >
            <CatIcon className="w-3 h-3 opacity-90" />
            <span>{catConfig.label}</span>
          </span>

          {finding.severity === "critical" && !isApplied && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[8px]"
              style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}
            >
              Prioritário
            </span>
          )}

          {isCustomized && !isApplied && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[8px]"
              style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", color: "#c6613f", border: "1px solid rgba(217, 119, 87, 0.3)" }}
            >
              Editada por você
            </span>
          )}
        </div>

        <div>
          {isApplied ? (
            <span
              className="text-[14px] font-semibold px-2.5 py-0.5 rounded-[8px] flex items-center gap-1"
              style={{ backgroundColor: "rgba(217, 119, 87, 0.2)", color: "#141413", border: "1px solid rgba(217, 119, 87, 0.4)" }}
            >
              <Check className="w-3 h-3 stroke-[3]" style={{ color: "#141413" }} />
              <span>Aplicada</span>
            </span>
          ) : isIgnored ? (
            <span
              className="text-[14px] px-2.5 py-0.5 rounded-[8px]"
              style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", color: "#b0aea5" }}
            >
              Ignorada
            </span>
          ) : null}
        </div>
      </div>

      {/* Problema */}
      <p className="text-[14px] leading-relaxed mb-3" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
        {finding.explanation}
      </p>

      {/* Bloco Comparativo */}
      <div className="space-y-2 rounded-[12px] p-3 mb-3" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
        <div className="text-[14px]">
          <span className="text-[10px] block mb-1" style={{ color: "#b0aea5" }}>Texto Original</span>
          <p
            className="font-mono text-[14px] rounded-[8px] p-2.5 line-through leading-relaxed"
            style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413", opacity: 0.8 }}
          >
            {finding.originalText}
          </p>
        </div>

        {isEditing ? (
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-[12px]" style={{ color: "#b0aea5" }}>
              <span className="font-semibold flex items-center gap-1" style={{ color: "#141413" }}>
                <Pencil className="w-3 h-3" style={{ color: "#d97757" }} />
                <span>Edição Manual:</span>
              </span>
              <span>{customDraft.trim().split(/\s+/).filter(Boolean).length} palavras</span>
            </div>
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={2}
              className="w-full text-[14px] font-mono font-semibold rounded-[8px] p-2.5 focus:outline-hidden"
              style={{ backgroundColor: "#faf9f5", border: "2px solid #d97757", color: "#141413" }}
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
          <div className="text-[14px] pt-1">
            <span className="text-[10px] block mb-1" style={{ color: "#b0aea5" }}>Sugestão de Simplificação</span>
            <div
              className="font-mono font-semibold rounded-[8px] p-2.5 leading-relaxed"
              style={{ backgroundColor: "#faf9f5", border: "1px solid rgba(217, 119, 87, 0.4)", color: "#141413" }}
            >
              {finding.suggestedText}
            </div>
          </div>
        ) : (
          <div className="pt-1 space-y-2">
            <div
              className="rounded-[8px] p-3 text-[14px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
              style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", border: "1px solid rgba(217, 119, 87, 0.3)" }}
            >
              <div>
                <p className="font-semibold" style={{ color: "#141413" }}>Frase longa ({finding.originalText.split(/\s+/).filter(Boolean).length} palavras)</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#141413" }}>{finding.recommendation}</p>
              </div>
              <Button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAiRewriteSegment(); }}
                disabled={aiRewriting}
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" style={{ color: "#d97757" }} />}
              >
                {aiRewriting ? "Reescrevendo..." : "Reescrever com IA"}
              </Button>
            </div>

            {rewriteNotice && (
              <div
                className="p-3 rounded-[12px] text-[14px] space-y-2 border animate-in fade-in slide-in-from-top-1"
                style={{
                  backgroundColor: rewriteNotice.type === "offline" ? "rgba(217, 119, 87, 0.1)" : rewriteNotice.type === "error" ? "#fef2f2" : "#eff6ff",
                  borderColor: rewriteNotice.type === "offline" ? "rgba(217, 119, 87, 0.4)" : rewriteNotice.type === "error" ? "#fecaca" : "#bfdbfe",
                  color: rewriteNotice.type === "offline" ? "#141413" : rewriteNotice.type === "error" ? "#991b1b" : "#1e40af"
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      {rewriteNotice.type === "offline" ? (
                        <Info className="w-3.5 h-3.5 shrink-0" style={{ color: "#d97757" }} />
                      ) : rewriteNotice.type === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{rewriteNotice.message}</span>
                    </div>
                    {rewriteNotice.detail && (
                      <p className="text-[12px] opacity-90 leading-relaxed">{rewriteNotice.detail}</p>
                    )}
                  </div>
                  <Button type="button" onClick={() => setRewriteNotice(null)} variant="ghost" size="xs" className="p-0.5" leftIcon={<X className="w-3.5 h-3.5" />} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-ai-settings"))} variant="secondary" size="xs" leftIcon={<Settings className="w-3 h-3" style={{ color: "#d97757" }} />}>
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
              <Button type="button" onClick={(e) => { e.stopPropagation(); setCustomDraft(finding.suggestedText || finding.originalText); setIsEditing(true); }} variant="secondary" size="sm" leftIcon={<Pencil className="w-3 h-3" style={{ color: "#b0aea5" }} />}>
                Editar
              </Button>

              {hasSuggestion && (
                <Button type="button" onClick={(e) => { e.stopPropagation(); handleAiRewriteSegment(); }} disabled={aiRewriting} variant="secondary" size="sm" leftIcon={<Sparkles className="w-3 h-3" style={{ color: "#d97757" }} />}>
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
        <div
          className="mt-3 pt-3 text-[14px] p-3.5 rounded-[12px] space-y-2 animate-in fade-in"
          style={{ borderTop: "1px solid #cccbc8", backgroundColor: "rgba(227, 218, 204, 0.2)", color: "#141413" }}
        >
          {detailedLoading ? (
            <div className="flex items-center gap-2 py-1" style={{ color: "#b0aea5" }}>
              <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: "#141413", borderTopColor: "transparent" }} />
              <span>Consultando diretrizes da Unicamp...</span>
            </div>
          ) : (
            <>
              <div>
                <strong className="block mb-0.5" style={{ color: "#141413" }}>Por que isso importa na comunicação pública?</strong>
                <p className="leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)" }}>{detailedData?.whyItMatters || "Comunicações diretas e acessíveis garantem que o cidadão encontre, compreenda e aja sem dúvidas na primeira leitura."}</p>
              </div>
              <div>
                <strong className="block mb-0.5" style={{ color: "#141413" }}>Dica Prática:</strong>
                <p className="leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)" }}>{detailedData?.pedagogicalTip || finding.recommendation}</p>
              </div>
              {finding.source?.url && (
                <a href={finding.source.url} target="_blank" rel="noopener noreferrer" className="ghost-link text-[12px] inline-flex items-center gap-1 pt-0.5" style={{ color: "#141413" }}>
                  <BookOpen className="w-3 h-3" style={{ color: "#d97757" }} />
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
