import type { FindingCategory, RuleSource, Severity } from "./rules";
import type { AnalysisScore } from "./score";
import type { DocumentType } from "./document";

export type { FindingCategory, RuleSource, Severity };

export interface FindingLocation {
  startIndex: number;
  endIndex: number;
  paragraphIndex?: number;
  sentenceIndex?: number;
}

export interface Finding {
  id: string;
  ruleId?: string;
  category: FindingCategory;
  severity: Severity;
  originalText: string;
  location?: FindingLocation;
  explanation: string;
  recommendation: string;
  suggestedText?: string;
  source?: RuleSource;
  status?: "pending" | "applied" | "ignored";
}

export interface TextMetrics {
  charactersCount: number;
  charactersWithoutSpacesCount: number;
  wordsCount: number;
  sentencesCount: number;
  paragraphsCount: number;
  avgSentenceLengthWords: number;
  avgWordLengthChars: number;
  longSentencesCount: number;
  gunningFogIndex: number;
  fleschReadingEaseBR: number;
  readingTimeSeconds: number;
  // Aliases for component compatibility
  wordCount?: number;
  sentenceCount?: number;
  paragraphCount?: number;
  charCount?: number;
  avgWordsPerSentence?: number;
  estimatedReadTimeMinutes?: number;
}

export interface SemanticValidation {
  isSemanticPreserved: boolean;
  preservedEntities: string[];
  missingEntities: string[];
  preservedDates: string[];
  missingDates: string[];
  preservedDeadlines: string[];
  missingDeadlines: string[];
  summary: string;
  isValid?: boolean;
  preservationScore?: number;
  warnings?: string[];
}

export interface EssentialFact {
  fact: string;
  category: "entity" | "date" | "deadline" | "instruction" | "data";
  foundInOriginal: boolean;
  foundInSimplified: boolean;
}

export interface AnalysisInput {
  text: string;
  documentType?: DocumentType;
  targetAudience?: string;
  textGoal?: string;
  options?: {
    preserveTechnicalTerms?: boolean;
    strictInclusiveMode?: boolean;
  };
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  input: AnalysisInput;
  metrics: TextMetrics;
  score: AnalysisScore;
  findings: Finding[];
  rewrittenText?: string;
  workingText?: string;
  semanticValidation?: SemanticValidation;
  appliedRuleVersion: string;
}
