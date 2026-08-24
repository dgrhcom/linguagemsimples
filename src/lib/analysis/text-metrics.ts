import { TextMetrics } from "@/types/analysis";

/**
 * Divide o texto em sentenças preservando abreviações conhecidas.
 */
export function splitSentences(text: string): { sentence: string; index: number; wordCount: number }[] {
  if (!text || !text.trim()) return [];

  // Protege abreviações comuns para não quebrar a frase no ponto abreviativo
  const protectedText = text
    .replace(/\b(Sr|Sra|Dr|Dra|Prof|Profa|V\.?\s*Exa|V\.?\s*Sa|art|inc|av|cód|etc)\./gi, "$1§DOT§")
    .replace(/(\d+)\.(\d+)/g, "$1§NUMDOT§$2");

  const regex = /([^.!?\n]+[.!?\n]+|[^.!?\n]+$)/g;
  const matches = [...protectedText.matchAll(regex)];

  let currentIndex = 0;
  const result: { sentence: string; index: number; wordCount: number }[] = [];

  for (const m of matches) {
    let rawSentence = m[0];
    const originalSentence = rawSentence
      .replace(/§DOT§/g, ".")
      .replace(/§NUMDOT§/g, ".");

    const trimmed = originalSentence.trim();
    if (trimmed.length > 0) {
      const words = trimmed.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9À-ÿ]/.test(w));
      result.push({
        sentence: trimmed,
        index: currentIndex,
        wordCount: words.length
      });
    }
    currentIndex += rawSentence.length;
  }

  return result;
}

/**
 * Estimativa de contagem de sílabas para o Português (Flesch-BR).
 */
function countSyllablesInWord(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, "");
  if (!cleanWord) return 1;

  // Diftongos e hiatos aproximados em português
  const matches = cleanWord.match(/[aeiouyáàâãéêíóôõúü]+/gi);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Calcula o Índice de Facilidade de Leitura Flesch adaptado ao Português (Flesch-BR).
 * Fórmula: 248.835 - (1.015 * (TotalPalavras / TotalFrases)) - (84.6 * (TotalSílabas / TotalPalavras))
 */
export function calculateFleschBR(wordCount: number, sentenceCount: number, totalSyllables: number): number {
  if (wordCount === 0 || sentenceCount === 0) return 100;
  const ASL = wordCount / sentenceCount; // Average Sentence Length
  const ASW = totalSyllables / wordCount; // Average Syllables per Word
  const score = 248.835 - (1.015 * ASL) - (84.6 * ASW);
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calcula todas as métricas estruturais do texto.
 */
export function calculateTextMetrics(text: string): TextMetrics {
  if (!text || !text.trim()) {
    return {
      charCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgWordsPerSentence: 0,
      longSentencesCount: 0,
      estimatedReadTimeMinutes: 0,
      fleschReadingEaseBR: 100
    };
  }

  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  const sentences = splitSentences(text);
  const sentenceCount = Math.max(1, sentences.length);

  const words = text.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9À-ÿ]/.test(w));
  const wordCount = words.length;

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
  }

  // Regra da Unicamp: Frases com mais de 20 palavras são consideradas excessivamente longas
  const longSentences = sentences.filter(s => s.wordCount > 20);
  const longSentencesCount = longSentences.length;

  const avgWordsPerSentence = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
  const estimatedReadTimeMinutes = Math.max(0.5, Math.round((wordCount / 150) * 10) / 10);
  const fleschReadingEaseBR = calculateFleschBR(wordCount, sentenceCount, totalSyllables);

  return {
    charCount: text.length,
    wordCount,
    sentenceCount,
    paragraphCount,
    avgWordsPerSentence,
    longSentencesCount,
    estimatedReadTimeMinutes,
    fleschReadingEaseBR
  };
}
