"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";

interface AnnotatedTextProps {
  text: string;
  findings: Finding[];
  selectedFindingId?: string;
  onSelectFinding: (finding: Finding) => void;
}

export function AnnotatedText({ text, findings, selectedFindingId, onSelectFinding }: AnnotatedTextProps) {
  if (!text) return null;

  // Realça os trechos problemáticos no texto com spans clicáveis
  // Criamos uma lista ordenada de ocorrências
  const occurrences: { start: number; end: number; text: string; finding: Finding }[] = [];

  for (const f of findings) {
    if (!f.originalText) continue;
    let idx = 0;
    while ((idx = text.indexOf(f.originalText, idx)) !== -1) {
      occurrences.push({
        start: idx,
        end: idx + f.originalText.length,
        text: f.originalText,
        finding: f
      });
      idx += f.originalText.length;
    }
  }

  // Ordena por posição de início
  occurrences.sort((a, b) => a.start - b.start);

  // Remove sobreposições
  const filteredOccurrences: typeof occurrences = [];
  let lastEnd = 0;
  for (const occ of occurrences) {
    if (occ.start >= lastEnd) {
      filteredOccurrences.push(occ);
      lastEnd = occ.end;
    }
  }

  // Constrói os segmentos
  const segments: React.ReactNode[] = [];
  let currentPos = 0;

  filteredOccurrences.forEach((occ, i) => {
    if (occ.start > currentPos) {
      segments.push(
        <span key={`plain-${currentPos}`}>
          {text.substring(currentPos, occ.start)}
        </span>
      );
    }

    const isSelected = selectedFindingId === occ.finding.id;
    const severityColor = {
      critical: "bg-rose-100 text-rose-900 border-b-2 border-rose-500 hover:bg-rose-200",
      warning: "bg-amber-100 text-amber-900 border-b-2 border-amber-500 hover:bg-amber-200",
      suggestion: "bg-blue-100 text-blue-900 border-b-2 border-blue-500 hover:bg-blue-200",
      info: "bg-slate-100 text-slate-900 border-b-2 border-slate-400 hover:bg-slate-200"
    }[occ.finding.severity];

    segments.push(
      <mark
        key={`mark-${occ.start}-${i}`}
        onClick={() => onSelectFinding(occ.finding)}
        className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${severityColor} ${
          isSelected ? "ring-2 ring-blue-600 ring-offset-1 font-bold" : ""
        }`}
        title={`Clique para ver a orientação da Unicamp sobre '${occ.text}'`}
      >
        {occ.text}
      </mark>
    );

    currentPos = occ.end;
  });

  if (currentPos < text.length) {
    segments.push(
      <span key={`plain-${currentPos}`}>
        {text.substring(currentPos)}
      </span>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans text-base">
      {segments}
    </div>
  );
}
