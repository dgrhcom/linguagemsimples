export interface DiffPart {
  type: "equal" | "delete" | "insert";
  value: string;
}

/**
 * Computa a diferença palavra a palavra entre dois textos (estilo WordPress / Git Diff).
 * Utiliza o algoritmo de Maior Subsequência Comum (LCS) sobre tokens de palavras e pontuação.
 */
export function computeWordDiff(oldText: string, newText: string): DiffPart[] {
  if (oldText === newText) {
    return [{ type: "equal", value: oldText }];
  }

  // Tokeniza preservando espaços e pontuações
  const tokenize = (str: string) => str.match(/\S+|\s+/g) || [];

  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  const n = oldTokens.length;
  const m = newTokens.length;

  // Tabela LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstrução do Diff
  let i = n;
  let j = m;
  const rawParts: DiffPart[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      rawParts.push({ type: "equal", value: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawParts.push({ type: "insert", value: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawParts.push({ type: "delete", value: oldTokens[i - 1] });
      i--;
    }
  }

  rawParts.reverse();

  // Consolidação de partes consecutivas do mesmo tipo
  const consolidated: DiffPart[] = [];
  for (const part of rawParts) {
    if (consolidated.length > 0 && consolidated[consolidated.length - 1].type === part.type) {
      consolidated[consolidated.length - 1].value += part.value;
    } else {
      consolidated.push({ ...part });
    }
  }

  return consolidated;
}

export interface DiffStats {
  insertions: number;
  deletions: number;
  changesCount: number;
}

export function calculateDiffStats(diffParts: DiffPart[]): DiffStats {
  let insertions = 0;
  let deletions = 0;

  for (const part of diffParts) {
    if (part.type === "insert") {
      const words = part.value.trim().split(/\s+/).filter(Boolean);
      insertions += words.length;
    } else if (part.type === "delete") {
      const words = part.value.trim().split(/\s+/).filter(Boolean);
      deletions += words.length;
    }
  }

  return {
    insertions,
    deletions,
    changesCount: insertions + deletions
  };
}
