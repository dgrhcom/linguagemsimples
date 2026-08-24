import { EssentialFact, SemanticValidation } from "@/types/analysis";

/**
 * Extrai fatos essenciais do texto (datas, valores monetários, percentuais, leis, prazos).
 */
export function extractEssentialFacts(text: string): EssentialFact[] {
  if (!text) return [];
  const facts: EssentialFact[] = [];

  // 1. Datas e anos
  const dateRegex = /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{1,2}\s+de\s+(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+\d{4})\b/gi;
  let dateMatch: RegExpExecArray | null;
  while ((dateMatch = dateRegex.exec(text)) !== null) {
    facts.push({
      type: "date",
      value: dateMatch[0],
      context: text.substring(Math.max(0, dateMatch.index - 20), Math.min(text.length, dateMatch.index + dateMatch[0].length + 20))
    });
  }

  // 2. Valores monetários e percentuais
  const currencyRegex = /\b(R\$\s*[\d\.,]+|\d+(?:,\d+)?%)\b/gi;
  let currMatch: RegExpExecArray | null;
  while ((currMatch = currencyRegex.exec(text)) !== null) {
    facts.push({
      type: "number",
      value: currMatch[0],
      context: text.substring(Math.max(0, currMatch.index - 15), Math.min(text.length, currMatch.index + currMatch[0].length + 15))
    });
  }

  // 3. Referências normativas e leis
  const legalRegex = /\b(Lei\s+(?:n[º°]\s*)?[\d\.]+|Portaria\s+[\w\d\-\/]+|Delibera[çc][ãa]o\s+[\w\d\-\/]+|Resolu[çc][ãa]o\s+[\w\d\-\/]+|Artigo\s+\d+|Art\.\s*\d+)\b/gi;
  let legMatch: RegExpExecArray | null;
  while ((legMatch = legalRegex.exec(text)) !== null) {
    facts.push({
      type: "legal_ref",
      value: legMatch[0],
      context: text.substring(Math.max(0, legMatch.index - 15), Math.min(text.length, legMatch.index + legMatch[0].length + 15))
    });
  }

  // 4. Prazos específicos (ex: "5 dias", "30 dias úteis", "48 horas")
  const deadlineRegex = /\b(\d+\s+(?:dias|dias\s+úteis|meses|anos|horas))\b/gi;
  let dMatch: RegExpExecArray | null;
  while ((dMatch = deadlineRegex.exec(text)) !== null) {
    facts.push({
      type: "deadline",
      value: dMatch[0],
      context: text.substring(Math.max(0, dMatch.index - 15), Math.min(text.length, dMatch.index + dMatch[0].length + 15))
    });
  }

  return facts;
}

/**
 * Compara os fatos essenciais do texto original com a versão simplificada.
 */
export function validateSemanticPreservation(originalText: string, rewrittenText: string): SemanticValidation {
  if (!originalText || !rewrittenText) {
    return {
      isValid: true,
      preservationScore: 100,
      preservedFacts: [],
      missingFacts: [],
      warnings: []
    };
  }

  const originalFacts = extractEssentialFacts(originalText);
  if (originalFacts.length === 0) {
    return {
      isValid: true,
      preservationScore: 100,
      preservedFacts: [],
      missingFacts: [],
      warnings: []
    };
  }

  const preservedFacts: EssentialFact[] = [];
  const missingFacts: EssentialFact[] = [];
  const warnings: string[] = [];

  const lowerRewritten = rewrittenText.toLowerCase();

  for (const fact of originalFacts) {
    // Limpa pontuação para comparação segura
    const cleanValue = fact.value.toLowerCase().replace(/[^\w\d]/g, " ").replace(/\s+/g, " ").trim();
    if (lowerRewritten.includes(cleanValue) || lowerRewritten.includes(fact.value.toLowerCase())) {
      preservedFacts.push(fact);
    } else {
      missingFacts.push(fact);
      warnings.push(`O fato essencial '${fact.value}' (${fact.type}) pode ter sido omitido ou alterado na simplificação.`);
    }
  }

  const preservationScore = Math.round((preservedFacts.length / originalFacts.length) * 100);
  const isValid = missingFacts.length === 0;

  return {
    isValid,
    preservationScore,
    preservedFacts,
    missingFacts,
    warnings
  };
}
