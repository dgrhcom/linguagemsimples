export type Severity = "info" | "suggestion" | "warning" | "critical";

export type RuleSourceType = "unicamp" | "linguistic" | "ai";

export interface RuleSource {
  title: string;
  url?: string;
  section?: string;
  type: RuleSourceType;
}

export interface RuleExample {
  before: string;
  after: string;
  explanation: string;
}

export type FindingCategory =
  | "organization"
  | "clarity"
  | "concision"
  | "sentence"
  | "vocabulary"
  | "inclusivity"
  | "acronym"
  | "technical-term"
  | "jargon"
  | "official-standard"
  | "instruction"
  | "formatting";

export interface Rule {
  id: string;
  title: string;
  category: FindingCategory;
  description: string;
  recommendation: string;
  severity: Severity;
  enabled: boolean;
  source: RuleSource;
  examples: RuleExample[];
  deterministic?: {
    type: "regex" | "word-count" | "dictionary-match" | "custom";
    pattern?: string;
    dictionaryRef?: string;
    threshold?: number;
  };
}
