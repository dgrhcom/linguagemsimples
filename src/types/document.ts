export type DocumentCategory = "normativo" | "correspondencia" | "administrativo";

export type DocumentType =
  // Atos Normativos e Decisórios
  | "portaria"
  | "resolucao"
  | "deliberacao"
  | "instrucao-normativa"
  | "regimento"
  | "regulamento"
  | "decisao"
  | "despacho"
  // Correspondência Oficial

  | "oficio"
  | "oficio-circular"
  | "carta"
  | "memorando"
  | "comunicado"
  | "informacao"
  // Administrativo / Colegiados / Declarações
  | "ata"
  | "pauta"
  | "parecer"
  | "relatorio"
  | "declaracao"
  | "certificado"
  // Aliases legados para compatibilidade retroativa
  | "general"
  | "email"
  | "notice"
  | "official-letter"
  | "memo"
  | "opinion"
  | "declaration"
  | "minutes"
  | "ordinance"
  | "resolution"
  | "instruction"
  | "regulation";

export interface DocumentTypeMetadata {
  type: DocumentType;
  label: string;
  category: DocumentCategory;
  description: string;
  unicampUrl: string;
  modelImagePath?: string;
  modelImagePages?: string[];
  expectedSections?: string[];
  competence?: string;
  defaultMetadata?: Partial<UniversalDocumentMetadata>;
}

export interface UniversalDocumentMetadata {
  // Cabeçalho Institucional Geral
  unitName: string;
  documentNumber: string;
  emailSite: string;
  locationAndDate: string;
  authorName: string;
  authorRole: string;
  customUnitLogo?: string;
  hideUnicampLogo?: boolean;

  // Atos Normativos & Decisórios (Portaria, Resolução, Deliberação, Instrução Normativa)
  ementa?: string;
  preamble?: string;
  effectiveClause?: string;
  revocationClause?: string;

  // Correspondência Oficial (Ofício, Ofício Circular, Carta)
  recipientTitle?: string;
  recipientName?: string;
  recipientRole?: string;
  recipientAddress?: string;
  subject?: string;
  vocativo?: string;
  fecho?: string;

  // Memorando (Tramitação interna)
  memoPara?: string;
  memoDe?: string;
  memoAssunto?: string;
  memoData?: string;

  // Atos Colegiados & Reuniões (Ata, Pauta)
  meetingNumber?: string;
  meetingDate?: string;
  meetingPlace?: string;
  meetingPresident?: string;
  meetingSecretary?: string;
  membersPresent?: string;
  membersAbsent?: string;
  expedienteText?: string;
  ordemDoDiaText?: string;

  // Processos & Pareceres & Informação (Parecer, Informação, Decisão, Despacho)
  referenceProcess?: string;
  interestedParty?: string;
  relatorioSection?: string;
  fundamentacaoSection?: string;
  conclusaoSection?: string;

  // Declaração & Certificado
  targetPerson?: string;
  targetDocument?: string;
  courseName?: string;
  courseHours?: string;
  coursePeriod?: string;
  targetPurpose?: string;

  // Regimento & Regulamento
  regimentoTitle?: string;
}
