export type DocumentType =
  | "general"             // Texto geral / Comunicação pública
  | "email"               // Mensagem eletrônica institucional
  | "notice"              // Comunicado
  | "official-letter"     // Ofício / Ofício Circular
  | "memo"                // Memorando
  | "report"              // Relatório
  | "opinion"             // Parecer
  | "declaration"         // Declaração
  | "minutes"             // Ata
  | "ordinance"           // Portaria
  | "resolution"          // Resolução
  | "instruction"         // Instrução Normativa
  | "regulation";         // Regimento / Regulamento

export interface DocumentTypeMetadata {
  type: DocumentType;
  label: string;
  category: "geral" | "administrativo" | "normativo" | "digital";
  description: string;
  expectedSections: string[];
  mandatoryElements: string[];
  competenceNote?: string;
  sampleTemplate?: string;
}
