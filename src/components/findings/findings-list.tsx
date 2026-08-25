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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filtro por Status */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({findings.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                statusFilter === "pending" ? "bg-white text-amber-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pendentes ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("applied")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                statusFilter === "applied" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aplicadas ({appliedCount})</span>
            </button>
          </div>

          {/* Botão de Aplicar Todas */}
          {pendingActionableCount > 0 && onApplyAllSuggestions && (
            <button
              onClick={onApplyAllSuggestions}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Aceitar Todas as Sugestões ({pendingActionableCount})</span>
            </button>
          )}
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 border-t border-slate-100 pt-2.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors shrink-0 font-medium ${
              selectedCategory === "all"
                ? "bg-[#005a87] text-white font-bold"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors shrink-0 font-medium ${
                selectedCategory === cat
                  ? "bg-[#005a87] text-white font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat} ({findings.filter(f => f.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
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
