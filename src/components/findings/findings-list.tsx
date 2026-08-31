"use client";

import { useState } from "react";
import { CheckCheck, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Finding } from "@/types/analysis";
import { FindingCard } from "./finding-card";
import { Button } from "@/components/ui/button";

interface FindingsListProps {
  findings: Finding[];
  targetAudience?: string;
  documentType?: string;
  selectedFinding?: Finding | null;
  onSelectFinding?: (finding: Finding | null) => void;
  onApplySuggestion?: (finding: Finding) => void;
  onRevertSuggestion?: (finding: Finding) => void;
  onIgnoreFinding?: (finding: Finding) => void;
  onUpdateFindingSuggestion?: (finding: Finding, newSuggestion: string) => void;
  onApplyAllSuggestions?: () => void;
}

export function FindingsList({
  findings,
  targetAudience,
  documentType,
  selectedFinding,
  onSelectFinding,
  onApplySuggestion,
  onRevertSuggestion,
  onIgnoreFinding,
  onUpdateFindingSuggestion,
  onApplyAllSuggestions
}: FindingsListProps) {
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
      <div className="p-4 rounded-[24px] space-y-3" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-[8px] self-start" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
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
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none" style={{ borderTop: "1px solid #cccbc8" }}>
            <SlidersHorizontal className="w-3 h-3 shrink-0 ml-0.5" style={{ color: "#b0aea5" }} />
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
          <div className="rounded-[24px] p-8 text-center space-y-2" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
            <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-[20px] font-semibold" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>Tudo limpo!</h4>
            <p className="text-[14px] max-w-sm mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
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
              isSelected={selectedFinding?.id === finding.id}
              onSelect={() => onSelectFinding?.(finding)}
            />
          ))
        )}
      </div>
    </div>
  );
}
