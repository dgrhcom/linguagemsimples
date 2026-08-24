import { FindingCategory, RuleSource, Severity } from "./rules";
import { AnalysisScore } from "./score";
import { DocumentType } from "./document";

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
  status?: "pending" | "applied" | "ignored";
  contextSentence?: string;
  source: RuleSource;
}

export interface TextMetrics {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  longSentencesCount: number; // Frases > 20 palavras (regra Unicamp)
  estimatedReadTimeMinutes: number;
  fleschReadingEaseBR?: number;
}

export interface AnalysisInput {
  text: string;
  documentType: DocumentType;
  targetAudience?: string; // Ex: "Estudantes", "População geral", "Servidores"
  textGoal?: string;       // Ex: "Convocação para matrícula", "Solicitação de compra"
  options?: {
    preserveTechnicalTerms?: boolean;
    strictInclusiveMode?: boolean;
  };
}

export interface EssentialFact {
  type: "date" | "number" | "obligation" | "deadline" | "legal_ref" | "entity" | "condition";
  value: string;
  context: string;
}

export interface SemanticValidation {
  isValid: boolean;
  preservationScore: number; // 0 a 100
  preservedFacts: EssentialFact[];
  missingFacts: EssentialFact[];
  warnings: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  input: AnalysisInput;
  metrics: TextMetrics;
  score: AnalysisScore;
  findings: Finding[];
  rewrittenText?: string;
  workingText?: string; // Texto com as alterações aceitas pelo usuário
  semanticValidation?: SemanticValidation;
  appliedRuleVersion: string;
}
