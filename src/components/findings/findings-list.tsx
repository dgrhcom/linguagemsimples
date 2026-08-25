"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";
import { FindingCard } from "./finding-card";
import { Filter, CheckCheck, Clock, CheckCircle2, EyeOff } from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "applied" | "ignored">("all");

  const categories = Array.from(new Set(findings.map(f => f.category)));

  const pendingCount = findings.filter(f => !f.status || f.status === "pending").length;
  const appliedCount = findings.filter(f => f.status === "applied").length;
  const ignoredCount = findings.filter(f => f.status === "ignored").length;

  const filteredFindings = findings.filter(f => {
    const matchCategory = selectedCategory === "all" || f.category === selectedCategory;
    const currentStatus = f.status || "pending";
    const matchStatus = statusFilter === "all" || currentStatus === statusFilter;
    return matchCategory && matchStatus;
  });

  const pendingActionableCount = findings.filter(f => (!f.status || f.status === "pending") && !!f.suggestedText).length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Status */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filtro por Status */}
          <div className="flex items-center gap-1 bg-[#faf9f5] border border-zinc-200 p-1 rounded-2xl">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors ${
                statusFilter === "all" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
            >
              Todos ({findings.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors ${
                statusFilter === "pending" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#FBB040]" />
              <span>Pendentes ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("applied")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors ${
                statusFilter === "applied" ? "bg-[#18181b] text-[#FBB040] shadow-xs font-black" : "text-zinc-600 hover:text-black"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FBB040]" />
              <span>Aplicadas ({appliedCount})</span>
            </button>
          </div>

          {/* Botão de Aplicar Todas */}
          {pendingActionableCount > 0 && onApplyAllSuggestions && (
            <button
              onClick={onApplyAllSuggestions}
              className="text-xs font-black text-[#111111] bg-[#FBB040] hover:bg-[#e59b2b] border border-[#d98a1a] px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-black" />
              <span>Aceitar Todas as Sugestões ({pendingActionableCount})</span>
            </button>
          )}
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 border-t border-zinc-100 pt-3">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-xs px-3 py-1.5 rounded-xl transition-colors shrink-0 font-bold ${
              selectedCategory === "all"
                ? "bg-[#18181b] text-[#FBB040]"
                : "bg-[#faf9f5] border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            Todas ({findings.length})
          </button>
          {categories.map(cat => {
            const count = findings.filter(f => f.category === cat).length;
            const categoryLabels: Record<string, string> = {
              spelling: "Ortografia & Gramática",
              grammar: "Gramática",
              clarity: "Clareza",
              concision: "Concisão",
              sentence: "Frases Longas",
              vocabulary: "Vocabulário",
              inclusivity: "Inclusão",
              formatting: "Padronização",
              jargon: "Jargões",
              acronym: "Siglas",
              organization: "Organização",
              instruction: "Instruções"
            };
            const label = categoryLabels[cat] || cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl transition-colors shrink-0 font-bold flex items-center gap-1 ${
                  selectedCategory === cat
                    ? "bg-[#18181b] text-[#FBB040]"
                    : cat === "spelling"
                    ? "bg-[#fef7eb] border border-[#FBB040] text-black hover:bg-[#fdecd0]"
                    : "bg-[#faf9f5] border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span>{label}</span>
                <span className="text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Lista de Cards */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center text-zinc-500 font-medium">
            Nenhum apontamento encontrado com os filtros selecionados.
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
