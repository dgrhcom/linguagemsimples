"use client";

import { useState } from "react";
import { Finding } from "@/types/analysis";

interface AnnotatedTextProps {
  text: string;
  findings: Finding[];
  selectedFindingId?: string;
  selectedFinding?: Finding | null;
  onSelectFinding: (finding: Finding | null) => void;
}

export function AnnotatedText({ text, findings, selectedFindingId, selectedFinding, onSelectFinding }: AnnotatedTextProps) {
  const activeSelectedId = selectedFinding?.id || selectedFindingId;
  if (!text) return null;

  // Realça os trechos problemáticos no texto com spans clicáveis
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

    const isSelected = activeSelectedId === occ.finding.id;
    const severityColor = {
      critical: "bg-[#fdecd0] text-black border-b-2 border-[#d98a1a] hover:bg-[#fbd38d]",
      warning: "bg-[#fef7eb] text-zinc-900 border-b-2 border-[#FBB040] hover:bg-[#fdecd0]",
      suggestion: "bg-zinc-100 text-zinc-900 border-b-2 border-zinc-400 hover:bg-zinc-200",
      info: "bg-zinc-100 text-zinc-900 border-b-2 border-zinc-300 hover:bg-zinc-200"
    }[occ.finding.severity];

    segments.push(
      <mark
        key={`mark-${occ.start}-${i}`}
        onClick={() => onSelectFinding(occ.finding)}
        className={`cursor-pointer px-1.5 py-0.5 rounded-md transition-all font-semibold ${severityColor} ${
          isSelected ? "!bg-[#FBB040] !text-black ring-2 ring-black font-black shadow-xs" : ""
        }`}
        title={`Clique para ver a orientação sobre '${occ.text}'`}
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
    <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs leading-relaxed text-zinc-900 whitespace-pre-wrap font-sans text-base">
      {segments}
    </div>
  );
}
