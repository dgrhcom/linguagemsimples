export interface ScoreDimension {
  key: string;
  label: string; // Ex: "Clareza", "Objetividade", "Inclusividade", "Estrutura das Frases"
  score: number; // 0 a 100
  level: "excelente" | "bom" | "atencao" | "critico";
  description: string;
  findingsCount: number;
  positivePoints: string[];
  improvementPoints: string[];
}

export interface PillarScore {
  pillar: "encontrar" | "compreender" | "usar";
  title: string; // "Fácil de Encontrar", "Fácil de Compreender", "Fácil de Usar"
  score: number; // 0 a 100
  summary: string;
}

export interface AnalysisScore {
  overallScore: number;
  overallLevel: "excelente" | "bom" | "atencao" | "critico";
  summary: string;
  pillars: {
    encontrar: PillarScore;
    compreender: PillarScore;
    usar: PillarScore;
  };
  dimensions: ScoreDimension[];
}
