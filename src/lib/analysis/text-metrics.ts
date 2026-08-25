import type { TextMetrics } from "../../types/analysis";

/**
 * Divide o texto em sentenças preservando abreviações conhecidas.
 */
export function splitSentences(text: string): { sentence: string; index: number; wordCount: number }[] {
  if (!text || !text.trim()) return [];

  // Protege abreviações comuns para não quebrar a frase no ponto abreviativo
  const protectedText = text
    .replace(/\b(Art|art|Prof|prof|Dr|dr|Dra|dra|Sr|sr|Sra|sra|Av|av|R|r|Pág|pág|p|ex|etc|DD|Ilmo|Exmo)\.\s+/g, "$1___DOT___ ")
    .replace(/\b(\d+)\.\s+(\d+)/g, "$1___DOT___$2");

  // Regex para captura de frases terminadas em . ? ! ou quebra de linha com sentido completo
  const sentenceEndRegex = /([^.?!;\n]+(?:[.?!;]|\n|$))/g;
  const matches: { sentence: string; index: number; wordCount: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = sentenceEndRegex.exec(protectedText)) !== null) {
    const raw = match[0];
    const restored = raw.replace(/___DOT___/g, ".").trim();
    if (restored.length > 0) {
      const words = restored.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9À-ÿ]/.test(w));
      if (words.length > 0) {
        matches.push({
          sentence: restored,
          index: match.index,
          wordCount: words.length
        });
      }
    }
  }

  return matches;
}

/**
 * Conta sílabas aproximadas em português para uma palavra.
 */
function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-záéíóúâêîôûãõàüç]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Vogais e ditongos aproximados
  const vowelMatches = clean.match(/[aeiouáéíóúâêîôûãõàü]+/g);
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
}

/**
 * Índice de Facilidade de Leitura Flesch adaptado para o Português (Flesch-BR).
 * Fórmula: 248.835 - (1.015 * ASL) - (84.6 * ASW)
 * ASL = Média de palavras por sentença
 * ASW = Média de sílabas por palavra
 */
function calculateFleschBR(wordCount: number, sentenceCount: number, totalSyllables: number): number {
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
      charactersCount: 0,
      charactersWithoutSpacesCount: 0,
      wordsCount: 0,
      sentencesCount: 0,
      paragraphsCount: 0,
      avgSentenceLengthWords: 0,
      avgWordLengthChars: 0,
      longSentencesCount: 0,
      gunningFogIndex: 0,
      fleschReadingEaseBR: 100,
      readingTimeSeconds: 0,
      charCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgWordsPerSentence: 0,
      estimatedReadTimeMinutes: 0
    };
  }

  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  const sentences = splitSentences(text);
  const sentenceCount = Math.max(1, sentences.length);

  const words = text.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9À-ÿ]/.test(w));
  const wordCount = words.length;
  const charsWithoutSpaces = text.replace(/\s+/g, "").length;

  let totalSyllables = 0;
  let totalCharsInWords = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
    totalCharsInWords += w.length;
  }

  const longSentences = sentences.filter(s => s.wordCount > 20);
  const longSentencesCount = longSentences.length;

  const avgWordsPerSentence = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
  const avgWordLengthChars = wordCount > 0 ? Math.round((totalCharsInWords / wordCount) * 10) / 10 : 0;
  const readingTimeSeconds = Math.max(1, Math.round((wordCount / 150) * 60));
  const estimatedReadTimeMinutes = Math.max(0.5, Math.round((wordCount / 150) * 10) / 10);
  const fleschReadingEaseBR = calculateFleschBR(wordCount, sentenceCount, totalSyllables);
  const gunningFogIndex = Math.round((avgWordsPerSentence + (longSentencesCount / Math.max(1, sentenceCount)) * 100) * 0.4);

  return {
    charactersCount: text.length,
    charactersWithoutSpacesCount: charsWithoutSpaces,
    wordsCount: wordCount,
    sentencesCount: sentenceCount,
    paragraphsCount: paragraphCount,
    avgSentenceLengthWords: avgWordsPerSentence,
    avgWordLengthChars,
    longSentencesCount,
    gunningFogIndex,
    fleschReadingEaseBR,
    readingTimeSeconds,
    charCount: text.length,
    wordCount,
    sentenceCount,
    paragraphCount,
    avgWordsPerSentence,
    estimatedReadTimeMinutes
  };
}
