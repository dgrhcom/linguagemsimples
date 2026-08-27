"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Finding } from "@/types/analysis";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnotatedTextProps {
  text: string;
  originalInputText?: string;
  findings: Finding[];
  selectedFinding?: Finding | null;
  onSelectFinding: (finding: Finding) => void;
  onUpdateText?: (newText: string) => void;
  onReanalyze?: (customText?: string) => void;
  isReanalyzing?: boolean;
}

export function AnnotatedText({
  text,
  originalInputText,
  findings,
  selectedFinding,
  onSelectFinding,
  onUpdateText,
  onReanalyze,
  isReanalyzing = false
}: AnnotatedTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditText(text);
    }
  }, [text, isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    setHasChanges(e.target.value !== text);
  };

  const handleSave = () => {
    if (onUpdateText) {
      onUpdateText(editText);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSaveAndReanalyze = () => {
    if (onUpdateText) {
      onUpdateText(editText);
    }
    if (onReanalyze) {
      onReanalyze(editText);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const renderAnnotatedText = useCallback(() => {
    if (!text) return <p className="text-stone italic">Nenhum texto para exibir.</p>;

    const pendingFindings = findings.filter(f => f.status === "pending" || !f.status);

    if (pendingFindings.length === 0) {
      return (
        <p className="text-body leading-relaxed text-ink">
          {text}
        </p>
      );
    }

    const getSeverityColor = (severity: string, isApplied: boolean) => {
      if (isApplied) return "bg-amber/20 border-amber/50 cursor-default";
      switch (severity) {
        case "high": return "bg-error-light border-error/40 hover:bg-error/20 cursor-pointer";
        case "critical": return "bg-error-light border-error/40 hover:bg-error/20 cursor-pointer";
        case "medium": return "bg-amber/15 border-amber/40 hover:bg-amber/25 cursor-pointer";
        default: return "bg-sand/50 border-sand hover:bg-sand cursor-pointer";
      }
    };

    const sortedFindings = [...pendingFindings].sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    let resultText = text;

    interface Segment {
      text: string;
      finding?: Finding;
      isOriginal?: boolean;
      start: number;
      end: number;
    }

    const segments: Segment[] = [];

    const occupiedRanges: { start: number; end: number }[] = [];

    const findStart = (searchText: string, startIndex: number = 0) => {
      const normalizedSearch = searchText.toLowerCase().replace(/[.,;:!?\s]+$/, "");
      let searchFrom = startIndex;
      while (searchFrom < resultText.length) {
        const foundAt = resultText.toLowerCase().indexOf(normalizedSearch, searchFrom);
        if (foundAt === -1) return -1;
        const isOccupied = occupiedRanges.some(range =>
          (foundAt >= range.start && foundAt < range.end) ||
          (foundAt + normalizedSearch.length > range.start && foundAt + normalizedSearch.length <= range.end) ||
          (foundAt <= range.start && foundAt + normalizedSearch.length >= range.end)
        );
        if (!isOccupied) return foundAt;
        searchFrom = foundAt + 1;
      }
      return -1;
    };

    for (const finding of sortedFindings) {
      if (!finding.originalText) continue;

      const start = findStart(finding.originalText);
      if (start === -1) continue;

      const end = start + finding.originalText.length;
      occupiedRanges.push({ start, end });
      segments.push({
        text: resultText.substring(start, end),
        finding,
        start,
        end
      });
    }

    segments.sort((a, b) => (a.start || 0) - (b.start || 0));

    const annotatedSegments: { text: string; finding?: Finding; isOriginal?: boolean }[] = [];
    let lastIndex = 0;

    for (const segment of segments) {
      if (segment.start > lastIndex) {
        annotatedSegments.push({
          text: resultText.substring(lastIndex, segment.start),
          isOriginal: true
        });
      }
      annotatedSegments.push({
        text: segment.text,
        finding: segment.finding
      });
      lastIndex = segment.end;
    }

    if (lastIndex < resultText.length) {
      annotatedSegments.push({
        text: resultText.substring(lastIndex),
        isOriginal: true
      });
    }

    return (
      <p className="text-body leading-relaxed text-ink whitespace-pre-wrap">
        {annotatedSegments.map((segment, index) => {
          if (!segment.finding) {
            return <span key={index}>{segment.text}</span>;
          }

          const finding = segment.finding;
          const isSelected = selectedFinding?.id === finding.id;
          const isApplied = finding.status === "applied";

          return (
            <span
              key={index}
              onClick={() => onSelectFinding(finding)}
              className={`inline border-b-[2px] transition-colors rounded-[2px] px-0 -mx-[2px] ${
                getSeverityColor(finding.severity, isApplied)
              } ${
                isSelected ? "ring-2 ring-amber/60 ring-offset-1" : ""
              }`}
              title={`${finding.category}: ${finding.explanation}`}
            >
              {segment.text}
            </span>
          );
        })}
      </p>
    );
  }, [text, findings, selectedFinding, onSelectFinding]);

  return (
    <div className="bg-paper rounded-card border border-sand overflow-hidden h-full flex flex-col">
      <div className="bg-sand/40 border-b border-sand px-4 py-3 flex justify-between items-center gap-3">
        <span className="text-body-sm font-display text-ink">Texto Atual</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {hasChanges && onReanalyze && (
                <Button
                  type="button"
                  onClick={handleSaveAndReanalyze}
                  disabled={isReanalyzing}
                  variant="primary"
                  size="sm"
                  leftIcon={isReanalyzing ? (
                    <div className="w-3.5 h-3.5 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                >
                  {isReanalyzing ? "Reanalisando..." : "Salvar e Reanalisar"}
                </Button>
              )}
              {hasChanges && (
                <Button
                  type="button"
                  onClick={handleSave}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Save className="w-3.5 h-3.5 text-amber" />}
                >
                  Salvar
                </Button>
              )}
              <Button
                type="button"
                onClick={handleCancel}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="secondary"
              size="sm"
            >
              Editar Texto
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-grow overflow-y-auto">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={handleTextChange}
            className="w-full h-full min-h-[200px] text-body text-ink font-mono leading-relaxed bg-transparent border-0 focus:ring-0 focus:outline-hidden resize-none"
          />
        ) : (
          <div className="min-h-[100px]">
            {renderAnnotatedText()}
          </div>
        )}
      </div>

      {!isEditing && findings.some(f => f.status === "applied") && (
        <div className="bg-sand/30 px-4 py-3 border-t border-sand text-caption text-stone flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber/40 inline-block"></span>
          Trechos com fundo âmbar foram simplificados
        </div>
      )}
    </div>
  );
}
