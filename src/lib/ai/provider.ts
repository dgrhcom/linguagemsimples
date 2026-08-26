import { AnalysisInput, Finding } from "@/types/analysis";

export interface AIAnalysisOutput {
  findings: Finding[];
  rewrittenText: string;
}

export interface AIRewriteOutput {
  rewrittenText: string;
  isOffline?: boolean;
  status?: "success" | "unchanged" | "offline_mode" | "ai_error";
  message?: string;
  error?: string;
}


export interface AIExplainOutput {
  detailedExplanation: string;
  whyItMatters: string;
  pedagogicalTip: string;
  sourceReference: string;
}

export interface RewriteOptions {
  mode?: "full" | "segment";
  segmentIssue?: string;
  unicampBase?: string;
  targetAudience?: string;
}

export interface LanguageModelProvider {
  analyzeText(input: AnalysisInput, deterministicFindings: Finding[], unicampBaseRewrite?: string): Promise<AIAnalysisOutput>;
  rewriteText(input: AnalysisInput, options?: RewriteOptions): Promise<AIRewriteOutput>;
  explainFinding(finding: Finding): Promise<AIExplainOutput>;
}

