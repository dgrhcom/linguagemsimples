import { AnalysisInput, Finding } from "@/types/analysis";

export interface AIAnalysisOutput {
  findings: Finding[];
  rewrittenText: string;
}

export interface AIRewriteOutput {
  rewrittenText: string;
}

export interface AIExplainOutput {
  detailedExplanation: string;
  whyItMatters: string;
  pedagogicalTip: string;
  sourceReference: string;
}

export interface LanguageModelProvider {
  analyzeText(input: AnalysisInput, deterministicFindings: Finding[]): Promise<AIAnalysisOutput>;
  rewriteText(input: AnalysisInput): Promise<AIRewriteOutput>;
  explainFinding(finding: Finding): Promise<AIExplainOutput>;
}
