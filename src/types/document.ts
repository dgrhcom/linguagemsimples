export type DocumentType =
  // Tipos Oficiais Unicamp (Slug direto)
  | "ata"
  | "carta"
  | "certificado"
  | "comunicado"
  | "decisao"
  | "declaracao"
  | "despacho"
  | "informacao"
  | "memorando"
  | "oficio"
  | "oficio-circular"
  | "pauta"
  | "parecer"
  | "relatorio"
  | "conceito-atos-normativos"
  | "deliberacao"
  | "instrucao-normativa"
  | "portaria"
  | "regimento"
  | "regulamento"
  | "resolucao"
  // Aliases legados para compatibilidade
  | "general"
  | "email"
  | "notice"
  | "official-letter"
  | "memo"
  | "report"
  | "opinion"
  | "declaration"
  | "minutes"
  | "ordinance"
  | "resolution"
  | "instruction"
  | "regulation";

export interface UniversalDocumentMetadata {
  unitName: string;
  documentNumber?: string;
  emailSite: string;
  locationAndDate: string;
  authorName: string;
  authorRole: string;
  customUnitLogo?: string;
  hideUnicampLogo?: boolean;
  
  // Campos contextuais adicionais
  ementa?: string;            // Portaria, Resolução, Deliberação, Instrução Normativa
  preamble?: string;          // "O Reitor no uso de suas atribuições..."
  recipientName?: string;     // Ofício, Carta (Nome do destinatário)
  recipientRole?: string;     // Ofício, Carta (Cargo do destinatário)
  recipientAddress?: string;  // Ofício, Carta (Endereço / Unidade)
  subject?: string;           // Assunto (Ofício, Memorando, Despacho, Parecer)
  vocativo?: string;          // "Senhor Diretor," "Prezado(a),"
  fecho?: string;             // "Atenciosamente," "Respeitosamente,"
  meetingNumber?: string;     // Ata, Pauta (ex: "15ª Reunião Ordinária")
  meetingDate?: string;       // Ata, Pauta
  meetingPlace?: string;      // Ata, Pauta
  targetPerson?: string;      // Declaração, Certificado (Nome da pessoa declarada)
  targetDocument?: string;    // Declaração (CPF / Matrícula / RG)
}

export interface DocumentTypeMetadata {
  type: DocumentType;
  label: string;
  category: "normativo" | "correspondencia" | "administrativo" | "geral";
  description: string;
  expectedSections: string[];
  mandatoryElements: string[];
  competenceNote?: string;
  modelImagePath?: string;
  unicampUrl?: string;
  fields?: string[]; // Quais campos específicos devem ser mostrados no Drawer
}
