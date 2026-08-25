import { SemanticValidation } from "@/types/analysis";

export interface EssentialFact {
  type: "date" | "number" | "legal_ref" | "deadline";
  value: string;
  context: string;
}

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

  // 4. Prazos específicos
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
      isSemanticPreserved: true,
      isValid: true,
      preservationScore: 100,
      preservedEntities: [],
      missingEntities: [],
      preservedDates: [],
      missingDates: [],
      preservedDeadlines: [],
      missingDeadlines: [],
      warnings: [],
      summary: "Todas as entidades e prazos essenciais foram mantidos."
    };
  }

  const originalFacts = extractEssentialFacts(originalText);
  if (originalFacts.length === 0) {
    return {
      isSemanticPreserved: true,
      isValid: true,
      preservationScore: 100,
      preservedEntities: [],
      missingEntities: [],
      preservedDates: [],
      missingDates: [],
      preservedDeadlines: [],
      missingDeadlines: [],
      warnings: [],
      summary: "Todas as informações e referências foram validadas."
    };
  }

  const preservedDates: string[] = [];
  const missingDates: string[] = [];
  const preservedDeadlines: string[] = [];
  const missingDeadlines: string[] = [];
  const preservedEntities: string[] = [];
  const missingEntities: string[] = [];
  const warnings: string[] = [];

  const lowerRewritten = rewrittenText.toLowerCase();

  for (const fact of originalFacts) {
    const cleanValue = fact.value.toLowerCase().replace(/[^\w\d]/g, " ").replace(/\s+/g, " ").trim();
    const isPresent = lowerRewritten.includes(cleanValue) || lowerRewritten.includes(fact.value.toLowerCase());

    if (fact.type === "date") {
      if (isPresent) preservedDates.push(fact.value);
      else {
        missingDates.push(fact.value);
        warnings.push(`A data '${fact.value}' pode ter sido alterada ou omitida na versão simplificada.`);
      }
    } else if (fact.type === "deadline") {
      if (isPresent) preservedDeadlines.push(fact.value);
      else {
        missingDeadlines.push(fact.value);
        warnings.push(`O prazo '${fact.value}' pode ter sido alterado ou omitido.`);
      }
    } else {
      if (isPresent) preservedEntities.push(fact.value);
      else {
        missingEntities.push(fact.value);
        warnings.push(`A referência '${fact.value}' pode ter sido alterada ou omitida.`);
      }
    }
  }

  const totalFacts = originalFacts.length;
  const missingTotal = missingDates.length + missingDeadlines.length + missingEntities.length;
  const preservationScore = Math.round(((totalFacts - missingTotal) / totalFacts) * 100);
  const isValid = missingTotal === 0;

  return {
    isSemanticPreserved: isValid,
    isValid,
    preservationScore,
    preservedEntities,
    missingEntities,
    preservedDates,
    missingDates,
    preservedDeadlines,
    missingDeadlines,
    warnings,
    summary: isValid
      ? "Preservação Semântica Verificada: todas as datas, prazos e referências essenciais foram mantidos."
      : `Atenção na Preservação de Fatos (${preservationScore}%): verifique as referências e prazos destacados.`
  };
}
