"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";
import { FindingCard } from "./finding-card";
import { CheckCheck, CheckCircle2, Sparkles, SlidersHorizontal } from "lucide-react";

interface FindingsListProps {
  findings: Finding[];
  targetAudience?: string;
  documentType?: string;
  onApplySuggestion?: (finding: Finding) => void;
  onRevertSuggestion?: (finding: Finding) => void;
  onIgnoreFinding?: (finding: Finding) => void;
  onUpdateFindingSuggestion?: (finding: Finding, newSuggestion: string) => void;
  onApplyAllSuggestions?: () => void;
  selectedFindingId?: string;
  selectedFinding?: Finding | null;
  onSelectFinding: (finding: Finding) => void;
}

export function FindingsList({
  findings,
  targetAudience,
  documentType,
  onApplySuggestion,
  onRevertSuggestion,
  onIgnoreFinding,
  onUpdateFindingSuggestion,
  onApplyAllSuggestions,
  selectedFindingId,
  selectedFinding,
  onSelectFinding
}: FindingsListProps) {
  const activeSelectedId = selectedFinding?.id || selectedFindingId;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "applied">("all");

  const categories = Array.from(new Set(findings.map(f => f.category)));

  const pendingCount = findings.filter(f => !f.status || f.status === "pending").length;
  const appliedCount = findings.filter(f => f.status === "applied").length;

  const filteredFindings = findings.filter(f => {
    const matchCategory = selectedCategory === "all" || f.category === selectedCategory;
    const currentStatus = f.status || "pending";
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && currentStatus === "pending") ||
      (statusFilter === "applied" && currentStatus === "applied");
    return matchCategory && matchStatus;
  });

  const pendingActionableCount = findings.filter(
    f => (!f.status || f.status === "pending") && Boolean(f.suggestedText && f.suggestedText.trim() !== f.originalText.trim())
  ).length;

  const categoryLabels: Record<string, string> = {
    spelling: "Ortografia",
    grammar: "Gramática",
    clarity: "Clareza",
    concision: "Concisão",
    sentence: "Frases Longas",
    vocabulary: "Vocabulário",
    inclusivity: "Inclusão",
    formatting: "Formatação",
    jargon: "Jargões",
    acronym: "Siglas"
  };

  return (
    <div className="space-y-4">
      {/* Barra Unificada de Filtros e Ações em Massa */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Control de Status */}
          <div className="inline-flex p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 self-start">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Todos ({findings.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "pending"
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("applied")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "applied"
                  ? "bg-white text-zinc-900 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Aplicadas ({appliedCount})
            </button>
          </div>

          {/* Ação em Massa: Aceitar Todas as Prontas */}
          {pendingActionableCount > 0 && onApplyAllSuggestions && (
            <button
              onClick={onApplyAllSuggestions}
              className="text-xs font-black text-black bg-[#FBB040] hover:bg-[#e59b2b] border border-[#d98a1a] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Aceitar Todas as Sugestões ({pendingActionableCount})</span>
            </button>
          )}
        </div>

        {/* Filtros por Categoria (Scroll sutil e limpo) */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-100 scrollbar-none">
            <SlidersHorizontal className="w-3 h-3 text-zinc-400 shrink-0 ml-0.5" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors shrink-0 font-medium ${
                selectedCategory === "all"
                  ? "bg-zinc-900 text-white font-bold"
                  : "bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/60"
              }`}
            >
              Todas as categorias
            </button>
            {categories.map(cat => {
              const count = findings.filter(f => f.category === cat).length;
              const label = categoryLabels[cat] || cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors shrink-0 font-medium flex items-center gap-1 ${
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white font-bold"
                      : "bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/60"
                  }`}
                >
                  <span>{label}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de Cards */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900">Tudo limpo por aqui!</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Nenhum apontamento pendente com os filtros selecionados.
            </p>
          </div>
        ) : (
          filteredFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              targetAudience={targetAudience}
              documentType={documentType}
              onApplySuggestion={onApplySuggestion}
              onRevertSuggestion={onRevertSuggestion}
              onIgnoreFinding={onIgnoreFinding}
              onUpdateFindingSuggestion={onUpdateFindingSuggestion}
              isSelected={activeSelectedId === finding.id}
              onSelect={() => onSelectFinding(finding)}
            />
          ))
        )}
      </div>
    </div>
  );
}

