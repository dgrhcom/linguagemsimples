import { Finding, FindingLocation, AnalysisInput } from "@/types/analysis";
import { splitSentences } from "./text-metrics";

// Importação dos datasets de conhecimento
import verbosidadeData from "@/data/terminology/verbosidade.json";
import chavoesData from "@/data/terminology/chavoes.json";
import linguagemNaoSexistaData from "@/data/terminology/linguagem-nao-sexista.json";
import termosNaoOfensivosData from "@/data/terminology/termos-nao-ofensivos.json";
import tratamentosData from "@/data/terminology/tratamentos.json";
import siglasPadraoData from "@/data/terminology/siglas-padrao.json";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Motor determinístico de análise de regras da Unicamp.
 * Realiza varreduras precisas em busca de violações objetivas de estilo e padrão.
 */
export function runDeterministicAnalysis(input: AnalysisInput): Finding[] {
  const text = input.text;
  if (!text || !text.trim()) return [];

  const findings: Finding[] = [];
  let findingIdCounter = 1;

  function addFinding(finding: Omit<Finding, "id">) {
    findings.push({
      id: `det-${findingIdCounter++}`,
      ...finding
    });
  }

  // 1. REGRA: Frases com mais de 20 palavras
  const sentences = splitSentences(text);
  for (let sIndex = 0; sIndex < sentences.length; sIndex++) {
    const s = sentences[sIndex];
    if (s.wordCount > 20) {
      const startIndex = text.indexOf(s.sentence, s.index >= 0 ? s.index : 0);
      const endIndex = startIndex >= 0 ? startIndex + s.sentence.length : -1;

      addFinding({
        ruleId: "unicamp-sentence-length",
        category: "sentence",
        severity: s.wordCount > 35 ? "critical" : "warning",
        originalText: s.sentence,
        location: startIndex >= 0 ? { startIndex, endIndex, sentenceIndex: sIndex } : undefined,
        explanation: `Esta frase possui ${s.wordCount} palavras. A recomendação da Unicamp é evitar frases com mais de 20 palavras para não sobrecarregar a leitura.`,
        recommendation: "Divida este período em duas ou mais frases curtas com ordem direta (sujeito + verbo + complemento).",
        source: {
          title: "Linguagem Simples Unicamp - Escreva",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          section: "Prefira frases curtas",
          type: "unicamp"
        }
      });
    }
  }

  // 2. REGRA: Verbosidade e Expressões Arcaicas
  for (const item of verbosidadeData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termo)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-verbosity",
        category: (item.categoria as any) || "vocabulary",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.explicacao,
        recommendation: `Substitua por: ${item.alternativas.join(" ou ")}.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Verbosidade",
          url: "https://linguagemsimples.unicamp.br/verbosidade/",
          type: "unicamp"
        }
      });
    }
  }

  // 3. REGRA: Chavões e Fórmulas Desgastadas
  for (const item of chavoesData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.expressao)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-cliches",
        category: (item.categoria as any) || "official-standard",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.problema,
        recommendation: `Substitua por: ${item.substituicoes.join(" ou ")}.`,
        suggestedText: item.substituicoes[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Chavões",
          url: "https://linguagemsimples.unicamp.br/chavoes/",
          type: "unicamp"
        }
      });
    }
  }

  // 4. REGRA: Linguagem Não-Sexista / Masculino Genérico
  for (const item of linguagemNaoSexistaData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termoExcludente)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-inclusive-language",
        category: "inclusivity",
        severity: "suggestion",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.explicacao,
        recommendation: `Substitua por: ${item.alternativas.join(" ou ")}.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Linguagem Não-Sexista",
          url: "https://linguagemsimples.unicamp.br/exemplos-praticos-de-linguagem-nao-sexista/",
          type: "unicamp"
        }
      });
    }
  }

  // 5. REGRA: Termos Não Discriminatórios / Não Ofensivos
  for (const item of termosNaoOfensivosData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termoInadequado)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-non-offensive-terms",
        category: "inclusivity",
        severity: "critical",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.explicacao,
        recommendation: `Substitua obrigatoriamente por: ${item.alternativas.join(" ou ")}.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Termos Não Ofensivos",
          url: "https://linguagemsimples.unicamp.br/exemplos-de-termos-nao-ofensivos/",
          type: "unicamp"
        }
      });
    }
  }

  // 6. REGRA: Formas de Tratamento Abolidas (DD. / Ilmo. / Ilustríssimo)
  for (const item of tratamentosData.abolidos) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termo)}\\b|\\b${escapeRegExp(item.abreviatura)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-treatment-standards",
        category: "official-standard",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.motivo,
        recommendation: item.recomendacao,
        source: {
          title: "Linguagem Simples Unicamp - Formas de tratamento",
          url: "https://linguagemsimples.unicamp.br/formas-de-tratamento/",
          type: "unicamp"
        }
      });
    }
  }

  // 7. REGRA: Formatação Incorreta de Horas (ex: "14:00hs", "14hs", "8:00h", "14:00")
  const hourIncorrectRegex = /\b(\d{1,2})(:|\.)(\d{2})\s*(hs?|hrs?|horas?)\b|\b(\d{1,2})\s*(hs|hrs)\b/gi;
  let hourMatch: RegExpExecArray | null;
  while ((hourMatch = hourIncorrectRegex.exec(text)) !== null) {
    const matchText = hourMatch[0];
    const startIndex = hourMatch.index;
    const endIndex = startIndex + matchText.length;

    // Sugestão de correção: 14h ou 14h30
    let suggested = matchText;
    const nums = matchText.match(/\d+/g);
    if (nums) {
      if (nums.length === 1) {
        suggested = `${nums[0]}h`;
      } else if (nums.length >= 2) {
        suggested = nums[1] === "00" ? `${nums[0]}h` : `${nums[0]}h${nums[1]}min`;
      }
    }

    addFinding({
      ruleId: "unicamp-time-formatting",
      category: "official-standard",
      severity: "suggestion",
      originalText: matchText,
      location: { startIndex, endIndex },
      explanation: "A abreviatura correta de horas na redação oficial é 'h' minúsculo colado ao número, sem espaço e sem '00' desnecessário (ex: 8h, 14h30, 8h45min). Não utilize 'hs', 'hrs' ou dois pontos.",
      recommendation: `Grafia correta: ${suggested}.`,
      suggestedText: suggested,
      source: {
        title: "Linguagem Simples Unicamp - Unidades de medida e hora",
        url: "https://linguagemsimples.unicamp.br/unidades-de-medida-e-hora/",
        type: "unicamp"
      }
    });
  }

  // 8. REGRA: Plural Incorreto de Siglas com Apóstrofo (ex: "TRE's", "ONG's")
  const siglaApostropheRegex = /\b([A-Z]{2,})'s\b/g;
  let siglaAposMatch: RegExpExecArray | null;
  while ((siglaAposMatch = siglaApostropheRegex.exec(text)) !== null) {
    const matchText = siglaAposMatch[0];
    const sigla = siglaAposMatch[1];
    const startIndex = siglaAposMatch.index;
    const endIndex = startIndex + matchText.length;
    const correct = `${sigla}s`;

    addFinding({
      ruleId: "unicamp-acronym-plural",
      category: "acronym",
      severity: "warning",
      originalText: matchText,
      location: { startIndex, endIndex },
      explanation: "Para siglas no plural, use a letra 's' minúscula sem apóstrofo (ex: TREs, e não TRE's). O apóstrofo é uma marca de posse da língua inglesa inadequada aqui.",
      recommendation: `Grafia recomendada: ${correct}.`,
      suggestedText: correct,
      source: {
        title: "Linguagem Simples Unicamp - Siglas",
        url: "https://linguagemsimples.unicamp.br/siglas/",
        section: "Regras de grafia das siglas (item 7)",
        type: "unicamp"
      }
    });
  }

  // 9. REGRA: Siglas não expandidas na primeira citação
  for (const sItem of siglasPadraoData) {
    const siglaRegex = new RegExp(`\\b${escapeRegExp(sItem.sigla)}\\b`, "g");
    const matches = [...text.matchAll(siglaRegex)];
    if (matches.length > 0) {
      // Checa se o texto contém o nome por extenso antes ou próximo da sigla
      const extensoMentioned = text.toLowerCase().includes(sItem.extenso.toLowerCase());
      if (!extensoMentioned) {
        const firstMatch = matches[0];
        const startIndex = firstMatch.index ?? 0;
        const endIndex = startIndex + sItem.sigla.length;

        addFinding({
          ruleId: "unicamp-acronym-expansion",
          category: "acronym",
          severity: "warning",
          originalText: sItem.sigla,
          location: { startIndex, endIndex },
          explanation: `A sigla '${sItem.sigla}' (${sItem.extenso}) não foi identificada por extenso na primeira menção.`,
          recommendation: `Escreva o nome completo seguido da sigla separada por travessão na primeira menção: "${sItem.extenso} – ${sItem.sigla}".`,
          suggestedText: `${sItem.extenso} – ${sItem.sigla}`,
          source: {
            title: "Linguagem Simples Unicamp - Siglas",
            url: "https://linguagemsimples.unicamp.br/siglas/",
            type: "unicamp"
          }
        });
      }
    }
  }

  return findings;
}
