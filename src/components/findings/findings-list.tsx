"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";
import { FindingCard } from "./finding-card";
import { CheckCheck, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Filtros e Ações */}
      <div className="bg-paper p-4 rounded-card border border-sand space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-sand/50 rounded-btn border border-sand self-start">
            <Button
              onClick={() => setStatusFilter("all")}
              variant={statusFilter === "all" ? "primary" : "ghost"}
              size="sm"
            >
              Todos ({findings.length})
            </Button>
            <Button
              onClick={() => setStatusFilter("pending")}
              variant={statusFilter === "pending" ? "primary" : "ghost"}
              size="sm"
            >
              Pendentes ({pendingCount})
            </Button>
            <Button
              onClick={() => setStatusFilter("applied")}
              variant={statusFilter === "applied" ? "primary" : "ghost"}
              size="sm"
            >
              Aplicadas ({appliedCount})
            </Button>
          </div>

          {pendingActionableCount > 0 && onApplyAllSuggestions && (
            <Button
              onClick={onApplyAllSuggestions}
              variant="success"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4 stroke-[2.5]" />}
              className="self-start sm:self-auto"
            >
              Aceitar Todas ({pendingActionableCount})
            </Button>
          )}
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-sand scrollbar-none">
            <SlidersHorizontal className="w-3 h-3 text-stone shrink-0 ml-0.5" />
            <Button
              onClick={() => setSelectedCategory("all")}
              variant={selectedCategory === "all" ? "primary" : "secondary"}
              size="xs"
            >
              Todas
            </Button>
            {categories.map(cat => {
              const count = findings.filter(f => f.category === cat).length;
              const label = categoryLabels[cat] || cat;
              return (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "primary" : "secondary"}
                  size="xs"
                >
                  <span>{label}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de Cards */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-paper rounded-card border border-sand p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-success-light text-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-body font-display text-ink">Tudo limpo!</h4>
            <p className="text-body-sm text-stone max-w-sm mx-auto">
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
