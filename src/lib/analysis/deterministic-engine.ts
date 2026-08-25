import type { Finding, FindingLocation, AnalysisInput } from "../../types/analysis";
import { splitSentences } from "./text-metrics";
import { rewriteToPlainLanguage, guaranteeDifferentSuggestion } from "./plain-language-rewriter";

// Importação dos datasets de conhecimento
import verbosidadeData from "../../data/terminology/verbosidade.json" with { type: "json" };
import chavoesData from "../../data/terminology/chavoes.json" with { type: "json" };
import linguagemNaoSexistaData from "../../data/terminology/linguagem-nao-sexista.json" with { type: "json" };
import termosNaoOfensivosData from "../../data/terminology/termos-nao-ofensivos.json" with { type: "json" };
import tratamentosData from "../../data/terminology/tratamentos.json" with { type: "json" };
import siglasPadraoData from "../../data/terminology/siglas-padrao.json" with { type: "json" };
import ortografiaData from "../../data/terminology/ortografia.json" with { type: "json" };

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createPortugueseWordRegex(term: string): RegExp {
  return new RegExp(`(?<=^|[^a-záéíóúçãõâêîôûA-ZÁÉÍÓÚÇÃÕÂÊÎÔÛ])${escapeRegExp(term)}(?=[^a-záéíóúçãõâêîôûA-ZÁÉÍÓÚÇÃÕÂÊÎÔÛ]|$)`, "gi");
}


function generateShortSentenceSuggestion(sentence: string): string {
  let rewritten = rewriteToPlainLanguage(sentence);
  if (rewritten !== sentence && splitSentences(rewritten).length > 1) {
    return rewritten;
  }

  const conjunctions: [RegExp, string][] = [
    [/,\s*(pois|porque|uma vez que|haja vista que|tendo em vista que|visto que)\s+/gi, ". Isso ocorreu porque "],
    [/,\s*(mas|porém|contudo|todavia|entretanto)\s+/gi, ". No entanto, "],
    [/,\s*(sendo que|de modo que|de forma que)\s+/gi, ". Assim, "],
    [/,\s*(portanto|por conseguinte|logo)\s+/gi, ". Portanto, "],
    [/,\s*(bem como|além do mais|e também)\s+/gi, ". Além disso, "],
    [/,\s*(a fim de que|para que)\s+/gi, ". Para isso, "],
    [/,\s*cabendo\s+a[o|a]?\s+/gi, ". Essa tarefa cabe a "],
    [/;\s*/g, ". "]
  ];

  for (const [conj, replacement] of conjunctions) {
    if (conj.test(rewritten)) {
      rewritten = rewritten.replace(conj, replacement);
      break;
    }
  }

  rewritten = rewritten.replace(/([.!?])\s*([a-záéíóúç])/g, (m, p, l) => `${p} ${l.toUpperCase()}`);
  return rewriteToPlainLanguage(rewritten);
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
      const suggested = generateShortSentenceSuggestion(s.sentence);

      addFinding({
        ruleId: "unicamp-sentence-length",
        category: "sentence",
        severity: s.wordCount > 35 ? "critical" : "warning",
        originalText: s.sentence,
        location: startIndex >= 0 ? { startIndex, endIndex, sentenceIndex: sIndex } : undefined,
        explanation: `Esta frase possui ${s.wordCount} palavras. A recomendação da Unicamp é evitar frases com mais de 20 palavras para não sobrecarregar a leitura.`,
        recommendation: "Divida este período em duas ou mais frases curtas com ordem direta (sujeito + verbo + complemento).",
        suggestedText: suggested,
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
        recommendation: `Substitua '${matchText}' por um termo mais simples e direto como '${item.alternativas[0]}'.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Verbosidade",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          type: "unicamp"
        }
      });
    }
  }

  // 3. REGRA: Chavões e Fórmulas Burocráticas
  for (const item of chavoesData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.expressao)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-cliche",
        category: (item.categoria as any) || "concision",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.problema,
        recommendation: `Evite fórmulas prontas. Prefira: '${item.substituicoes.join("', '")}'.`,
        suggestedText: item.substituicoes[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Chavões",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          type: "unicamp"
        }
      });
    }
  }

  // 4. REGRA: Linguagem Não-Sexista e Inclusiva
  for (const item of linguagemNaoSexistaData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termoExcludente)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-non-sexist",
        category: "inclusivity",
        severity: "suggestion",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.explicacao,
        recommendation: `Utilize formas inclusivas como '${item.alternativas.join("', '")}'.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Linguagem Não-Sexista",
          url: "https://linguagemsimples.unicamp.br/linguagem-nao-sexista/",
          type: "unicamp"
        }
      });
    }
  }

  // 5. REGRA: Termos Não Ofensivos e Não Capacitistas
  for (const item of termosNaoOfensivosData) {
    const regex = new RegExp(`\\b${escapeRegExp(item.termoInadequado)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-non-offensive",
        category: "inclusivity",
        severity: "critical",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.explicacao,
        recommendation: `Substitua por termo respeitoso e neutro: '${item.alternativas.join("', '")}'.`,
        suggestedText: item.alternativas[0],
        source: {
          title: item.fonte || "Linguagem Simples Unicamp - Termos Não Ofensivos",
          url: "https://linguagemsimples.unicamp.br/exemplos-de-termos-nao-ofensivos/",
          type: "unicamp"
        }
      });
    }
  }

  // 6. REGRA: Formas de Tratamento Abolidas (DD. e Ilmo.)
  for (const ab of tratamentosData.abolidos) {
    const termToMatch = ab.abreviatura || ab.termo;
    if (!termToMatch) continue;
    const regex = new RegExp(`\\b${escapeRegExp(termToMatch)}\\b`, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      addFinding({
        ruleId: "unicamp-abolished-treatment",
        category: "formatting",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: ab.motivo,
        recommendation: ab.recomendacao || "Elimine esta forma cerimoniosa obsoleta.",
        suggestedText: "",
        source: {
          title: "Linguagem Simples Unicamp - Pronomes de Tratamento",
          url: "https://linguagemsimples.unicamp.br/pronomes-de-tratamento/",
          type: "unicamp"
        }
      });
    }
  }

  // 7. REGRA: Grafia Incorreta de Horas (ex: 14:00hs, 14h00m, 14:30hrs)
  const timeRegex = /\b0?([1-9]|1\d|2[0-3])(?::|\.)([0-5]\d)?\s*(?:hs?|hrs?|horas?)\b/gi;
  let timeMatch: RegExpExecArray | null;
  while ((timeMatch = timeRegex.exec(text)) !== null) {
    const fullMatch = timeMatch[0];
    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];

    let correctTime = `${hour}h`;
    if (minute && minute !== "00") {
      correctTime = `${hour}h${minute}`;
    }

    if (fullMatch !== correctTime) {
      const startIndex = timeMatch.index;
      const endIndex = startIndex + fullMatch.length;

      addFinding({
        ruleId: "unicamp-time-format",
        category: "formatting",
        severity: "warning",
        originalText: fullMatch,
        location: { startIndex, endIndex },
        explanation: `Formato incorreto de indicação de horas ('${fullMatch}'). Na redação oficial da Unicamp e normas ABNT, usa-se 'h' sem espaço e sem 's'.`,
        recommendation: `Escreva '${correctTime}'. Use 'h' após a hora cheia (ex: 9h, 14h) e os minutos logo em seguida (ex: 14h30).`,
        suggestedText: correctTime,
        source: {
          title: "Linguagem Simples Unicamp - Mensagens Eletrônicas",
          url: "https://linguagemsimples.unicamp.br/mensagens-eletronicas/",
          type: "unicamp"
        }
      });
    }
  }

  // 8. REGRA: Siglas no Plural com Apóstrofo (ex: TRE's, ONG's)
  const siglaAposRegex = /\b([A-Z]{2,})'s\b/g;
  let siglaMatch: RegExpExecArray | null;
  while ((siglaMatch = siglaAposRegex.exec(text)) !== null) {
    const fullMatch = siglaMatch[0];
    const sigla = siglaMatch[1];
    const correctPlural = `${sigla}s`;
    const startIndex = siglaMatch.index;
    const endIndex = startIndex + fullMatch.length;

    addFinding({
      ruleId: "unicamp-acronym-plural",
      category: "formatting",
      severity: "warning",
      originalText: fullMatch,
      location: { startIndex, endIndex },
      explanation: `Uso incorreto de apóstrofo para plural de siglas ('${fullMatch}'). No português, o plural de siglas recebe apenas 's' minúsculo.`,
      recommendation: `Escreva '${correctPlural}' sem apóstrofo.`,
      suggestedText: correctPlural,
      source: {
        title: "Linguagem Simples Unicamp - Escreva",
        url: "https://linguagemsimples.unicamp.br/escreva/",
        type: "unicamp"
      }
    });
  }

  // 9. REGRA: Revisão Ortográfica, Gramatical, Acentuação e Crase
  for (const item of ortografiaData) {
    const regex = createPortugueseWordRegex(item.termoIncorreto);
    let match: RegExpExecArray | null;


    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      // Preserva maiúscula inicial se o texto original estiver em maiúscula
      let suggestion = item.correcao;
      if (matchText[0] === matchText[0].toUpperCase() && matchText[0] !== matchText[0].toLowerCase()) {
        suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      }

      addFinding({
        ruleId: "unicamp-spelling",
        category: "spelling",
        severity: "warning",
        originalText: matchText,
        location: { startIndex, endIndex },
        explanation: item.motivo,
        recommendation: `Substitua '${matchText}' pela forma correta '${suggestion}'.`,
        suggestedText: suggestion,
        source: {
          title: "Vocabulário Ortográfico da Língua Portuguesa (VOLP) & ABNT",
          url: "https://linguagemsimples.unicamp.br/escreva/",
          type: "unicamp"
        }
      });
    }
  }

  return findings;
}

