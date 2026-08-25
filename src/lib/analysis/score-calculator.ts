import { Finding, TextMetrics } from "@/types/analysis";
import { AnalysisScore, PillarScore, ScoreDimension } from "@/types/score";

function getLevel(score: number): "excelente" | "bom" | "atencao" | "critico" {
  if (score >= 85) return "excelente";
  if (score >= 70) return "bom";
  if (score >= 50) return "atencao";
  return "critico";
}

export function calculateAnalysisScore(metrics: TextMetrics, findings: Finding[]): AnalysisScore {
  // Contabiliza problemas por severidade e categoria
  const severityPenalties = {
    critical: 15,
    warning: 7,
    suggestion: 3,
    info: 1
  };

  const categoryFindings: Record<string, Finding[]> = {};
  for (const f of findings) {
    if (!categoryFindings[f.category]) categoryFindings[f.category] = [];
    categoryFindings[f.category].push(f);
  }

  // 1. DIMENSÃO: Estrutura das Frases
  let sentenceScore = 100;
  const sentenceTotal = metrics.sentencesCount ?? metrics.sentenceCount ?? 1;
  const avgWords = metrics.avgSentenceLengthWords ?? metrics.avgWordsPerSentence ?? 15;
  const paragraphTotal = metrics.paragraphsCount ?? metrics.paragraphCount ?? 1;
  const wordsTotal = metrics.wordsCount ?? metrics.wordCount ?? 0;

  if (metrics.longSentencesCount > 0) {
    const longRatio = metrics.longSentencesCount / Math.max(1, sentenceTotal);
    sentenceScore -= Math.round(longRatio * 50);
  }
  if (avgWords > 20) {
    sentenceScore -= Math.min(25, Math.round((avgWords - 20) * 3));
  }
  sentenceScore = Math.max(20, Math.min(100, sentenceScore));

  // 2. DIMENSÃO: Vocabulário e Simplicidade
  let vocabScore = 100;
  const vocabFindings = [
    ...(categoryFindings["vocabulary"] || []),
    ...(categoryFindings["technical-term"] || []),
    ...(categoryFindings["jargon"] || [])
  ];
  for (const vf of vocabFindings) {
    vocabScore -= severityPenalties[vf.severity];
  }
  vocabScore = Math.max(20, Math.min(100, vocabScore));

  // 3. DIMENSÃO: Clareza e Compreensão
  let clarityScore = Math.round((sentenceScore * 0.4) + (vocabScore * 0.4) + ((metrics.fleschReadingEaseBR || 80) * 0.2));
  clarityScore = Math.max(20, Math.min(100, clarityScore));

  // 4. DIMENSÃO: Concisão e Objetividade
  let concisionScore = 100;
  const concisionFindings = categoryFindings["concision"] || [];
  for (const cf of concisionFindings) {
    concisionScore -= severityPenalties[cf.severity];
  }
  concisionScore = Math.max(20, Math.min(100, concisionScore));

  // 5. DIMENSÃO: Organização e Hierarquia
  let orgScore = 100;
  if (paragraphTotal === 1 && wordsTotal > 100) {
    orgScore -= 20; // Parágrafo monolítico sem divisão
  }
  const orgFindings = [
    ...(categoryFindings["organization"] || []),
    ...(categoryFindings["formatting"] || [])
  ];
  for (const of of orgFindings) {
    orgScore -= severityPenalties[of.severity];
  }
  orgScore = Math.max(20, Math.min(100, orgScore));

  // 6. DIMENSÃO: Inclusividade e Respeito
  let inclusivityScore = 100;
  const incFindings = categoryFindings["inclusivity"] || [];
  for (const inf of incFindings) {
    inclusivityScore -= severityPenalties[inf.severity];
  }
  inclusivityScore = Math.max(20, Math.min(100, inclusivityScore));

  // 7. DIMENSÃO: Padrão Oficial e Siglas
  let officialScore = 100;
  const stdFindings = [
    ...(categoryFindings["official-standard"] || []),
    ...(categoryFindings["acronym"] || [])
  ];
  for (const sf of stdFindings) {
    officialScore -= severityPenalties[sf.severity];
  }
  officialScore = Math.max(20, Math.min(100, officialScore));

  // 8. DIMENSÃO: Utilidade e Ação
  let actionScore = 100;
  const actionFindings = categoryFindings["instruction"] || [];
  for (const af of actionFindings) {
    actionScore -= severityPenalties[af.severity];
  }
  actionScore = Math.max(20, Math.min(100, actionScore));

  // Construção das dimensões detalhadas
  const dimensions: ScoreDimension[] = [
    {
      key: "clarity",
      label: "Clareza e Fluidez",
      score: clarityScore,
      level: getLevel(clarityScore),
      description: "Capacidade do texto de ser compreendido na primeira leitura sem ambiguidades.",
      findingsCount: (categoryFindings["clarity"] || []).length,
      positivePoints: clarityScore >= 70 ? ["Texto fluido e de boa compreensão."] : [],
      improvementPoints: clarityScore < 70 ? ["Ajustar a ordem direta e simplificar construções."] : []
    },
    {
      key: "sentence",
      label: "Estrutura das Frases",
      score: sentenceScore,
      level: getLevel(sentenceScore),
      description: "Avaliação do cumprimento da regra da Unicamp de frases curtas com até 20 palavras.",
      findingsCount: (categoryFindings["sentence"] || []).length,
      positivePoints: metrics.longSentencesCount === 0 ? ["Excelente uso de períodos concisos e pontuação direta."] : [],
      improvementPoints: metrics.longSentencesCount > 0 ? [`${metrics.longSentencesCount} frase(s) longa(s) detectada(s). Divida-as com ponto final.`] : []
    },
    {
      key: "vocabulary",
      label: "Vocabulário e Simplicidade",
      score: vocabScore,
      level: getLevel(vocabScore),
      description: "Uso de palavras comuns e eliminação de termos rebuscados ou arcaísmos.",
      findingsCount: vocabFindings.length,
      positivePoints: vocabFindings.length === 0 ? ["Vocabulário acessível e direto."] : [],
      improvementPoints: vocabFindings.length > 0 ? ["Substituir expressões rebuscadas por termos mais naturais."] : []
    },
    {
      key: "concision",
      label: "Concisão e Objetividade",
      score: concisionScore,
      level: getLevel(concisionScore),
      description: "Foco nas ideias principais e eliminação de palavras e fórmulas inúteis.",
      findingsCount: concisionFindings.length,
      positivePoints: concisionFindings.length === 0 ? ["Comunicação focada sem redundâncias."] : [],
      improvementPoints: concisionFindings.length > 0 ? ["Eliminar verbosidades e chavões burocráticos."] : []
    },
    {
      key: "organization",
      label: "Organização e Estrutura",
      score: orgScore,
      level: getLevel(orgScore),
      description: "Hierarquia clara, divisão de parágrafos e uso de marcadores visuais.",
      findingsCount: orgFindings.length,
      positivePoints: orgScore >= 80 ? ["Texto bem estruturado em parágrafos."] : [],
      improvementPoints: orgScore < 80 ? ["Usar listas e títulos para quebrar blocos densos de texto."] : []
    },
    {
      key: "inclusivity",
      label: "Linguagem Inclusiva e Respeitosa",
      score: inclusivityScore,
      level: getLevel(inclusivityScore),
      description: "Adoção de linguagem não-sexista e eliminação de termos preconceituosos.",
      findingsCount: incFindings.length,
      positivePoints: incFindings.length === 0 ? ["Sem termos excludentes ou pejorativos."] : [],
      improvementPoints: incFindings.length > 0 ? ["Usar duplas formas ou termos coletivos neutros."] : []
    },
    {
      key: "official-standard",
      label: "Padrão Oficial e Siglas",
      score: officialScore,
      level: getLevel(officialScore),
      description: "Conformidade com formas de tratamento, fechos oficiais e explicitação de siglas.",
      findingsCount: stdFindings.length,
      positivePoints: stdFindings.length === 0 ? ["Formas de tratamento e siglas em conformidade."] : [],
      improvementPoints: stdFindings.length > 0 ? ["Ajustar fechos e explicitar siglas na 1ª menção."] : []
    },
    {
      key: "action",
      label: "Utilidade e Ação",
      score: actionScore,
      level: getLevel(actionScore),
      description: "Clareza das orientações para que o leitor saiba o que fazer após a leitura.",
      findingsCount: actionFindings.length,
      positivePoints: actionScore >= 80 ? ["Instruções e próximos passos claros."] : [],
      improvementPoints: actionScore < 80 ? ["Tornar prazos e ações mais explícitos."] : []
    }
  ];

  // Cálculo dos 3 PILARES MESTRES ("Encontrar, Compreender, Usar")
  const encontrarScore = Math.round((orgScore * 0.7) + (clarityScore * 0.3));
  const compreenderScore = Math.round((clarityScore * 0.3) + (sentenceScore * 0.3) + (vocabScore * 0.25) + (concisionScore * 0.15));
  const usarScore = Math.round((actionScore * 0.4) + (inclusivityScore * 0.3) + (officialScore * 0.3));

  const pillars: { encontrar: PillarScore; compreender: PillarScore; usar: PillarScore } = {
    encontrar: {
      pillar: "encontrar",
      title: "Fácil de Encontrar",
      score: encontrarScore,
      summary: encontrarScore >= 75
        ? "A informação é fácil de localizar rapidamente na página."
        : "Recomenda-se melhorar a organização com títulos e tópicos."
    },
    compreender: {
      pillar: "compreender",
      title: "Fácil de Compreender",
      score: compreenderScore,
      summary: compreenderScore >= 75
        ? "A linguagem é direta e fácil de entender na primeira leitura."
        : "Há termos rebuscados ou frases longas que dificultam a leitura."
    },
    usar: {
      pillar: "usar",
      title: "Fácil de Usar",
      score: usarScore,
      summary: usarScore >= 75
        ? "O texto indica claramente os próximos passos e cumpre as normas de inclusão."
        : "Verifique se as ações, prazos e formas de tratamento estão claros."
    }
  };

  const overallScore = Math.round((encontrarScore * 0.3) + (compreenderScore * 0.45) + (usarScore * 0.25));
  const overallLevel = getLevel(overallScore);

  let summary = "Seu texto possui excelente nível de Linguagem Simples e Inclusiva.";
  if (overallLevel === "bom") {
    summary = "Bom nível de clareza, com alguns pontos de melhoria identificados.";
  } else if (overallLevel === "atencao") {
    summary = "Seu texto pode ficar mais simples e acessível com os ajustes sugeridos.";
  } else if (overallLevel === "critico") {
    summary = "O texto apresenta barreiras importantes de compreensão e necessita de revisão.";
  }

  return {
    overallScore,
    overallLevel,
    summary,
    pillars,
    dimensions
  };
}
