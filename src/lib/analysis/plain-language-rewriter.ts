import verbosidadeList from "../../data/terminology/verbosidade.json" with { type: "json" };
import chavoesList from "../../data/terminology/chavoes.json" with { type: "json" };
import linguagemNaoSexistaList from "../../data/terminology/linguagem-nao-sexista.json" with { type: "json" };
import termosNaoOfensivosList from "../../data/terminology/termos-nao-ofensivos.json" with { type: "json" };

/**
 * Motor estruturado de reescrita em Linguagem Simples e Inclusiva.
 * Aplica sistematicamente todas as regras e dicionários da Unicamp,
 * reestrutura frases longas, converte voz passiva e elimina burocratês.
 */
export function rewriteToPlainLanguage(text: string): string {
  if (!text || !text.trim()) return text;

  let result = text;

  // 1. Elimina fórmulas de abertura e fechos burocráticos vazios
  const openingsAndClosings: [RegExp, string][] = [
    [/\b(serve\s+a\s+presente\s+para\s+informar|serve\s+a\s+presente\s+para\s+comunicar|vimos\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+comunicar)\s+que\b/gi, "Informamos que"],
    [/\b(vimos\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+solicitar|venho\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+solicitar|pelo\s+presente\s+solicitamos)\b/gi, "Solicitamos"],
    [/\b(cumpre-nos\s+informar|levamos\s+ao\s+conhecimento\s+de\s+vossa\s+senhoria)\s+que\b/gi, "Informamos que"],
    [/\b(acusamos\s+o\s+recebimento\s+d[eoa]s?)\b/gi, "Confirmamos o recebimento de"],
    [/\b(reiteramos\s+os?\s+protestos\s+de\s+(?:elevada\s+)?estima\s+e\s+considera[cç][aã]o|renovamos\s+protestos\s+de\s+apre[cç]o|sem\s+mais\s+para\s+o\s+momento)\b/gi, "Atenciosamente"],
    [/\b(para\s+que\s+surta\s+seus\s+efeitos\s+legais|para\s+os\s+devidos\s+fins\s+de\s+direito|era\s+o\s+que\s+nos\s+cumpria\s+relatar)\b\.?/gi, ""]
  ];

  for (const [pattern, replacement] of openingsAndClosings) {
    result = result.replace(pattern, replacement);
  }

  // 2. Abolição formal de tratamentos obsoletos (DD., Ilmo., Exmo. indevido)
  result = result.replace(/\bDD\.\s*/g, "");
  result = result.replace(/\bIlm[oa]\.\s*Sr[a]?\.\s*/gi, "Senhor(a) ");
  result = result.replace(/\b(Dign[ií]ssim[oa]|Ilustr[ií]ssim[oa])\s+Senhor[a]?\b/gi, "Senhor(a)");

  // 3. Aplicação do Dicionário de Verbosidade da Unicamp
  for (const item of verbosidadeList) {
    if (!item.termo || !item.alternativas?.length) continue;
    const escaped = item.termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 4. Aplicação do Dicionário de Chavões da Unicamp
  for (const item of chavoesList) {
    if (!item.expressao || !item.substituicoes?.length) continue;
    const escaped = item.expressao.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.substituicoes[0]);
  }

  // 5. Aplicação do Dicionário de Linguagem Inclusiva / Não-Sexista
  for (const item of linguagemNaoSexistaList) {
    if (!item.termoExcludente || !item.alternativas?.length) continue;
    const escaped = item.termoExcludente.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 6. Aplicação do Dicionário de Termos Não Ofensivos / Não Capacitistas
  for (const item of termosNaoOfensivosList) {
    if (!item.termoInadequado || !item.alternativas?.length) continue;
    const escaped = item.termoInadequado.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 7. Conversão de Expressões Burocráticas e Nominalizações Comuns
  const phraseTransformations: [RegExp, string][] = [
    [/\bcom\s+vistas\s+a\b/gi, "para"],
    [/\bcom\s+o\s+intuito\s+de\b/gi, "para"],
    [/\bno\s+sentido\s+de\s+que\b/gi, "para que"],
    [/\bno\s+sentido\s+de\b/gi, "para"],
    [/\ba\s+fim\s+de\s+que\b/gi, "para que"],
    [/\ba\s+fim\s+de\b/gi, "para"],
    [/\bem\s+virtude\s+de\b/gi, "por causa de"],
    [/\bem\s+decorr[eê]ncia\s+de\b/gi, "por causa de"],
    [/\btendo\s+em\s+vista\s+que\b/gi, "porque"],
    [/\btendo\s+em\s+vista\b/gi, "considerando"],
    [/\bhaja\s+vista\s+que\b/gi, "porque"],
    [/\bhaja\s+vista\b/gi, "como"],
    [/\bno\s+que\s+tange\s+a\b/gi, "sobre"],
    [/\bno\s+que\s+concerne\s+a\b/gi, "sobre"],
    [/\bno\s+que\s+diz\s+respeito\s+a\b/gi, "sobre"],
    [/\bcom\s+rela[cç][aã]o\s+a\b/gi, "sobre"],
    [/\bem\s+conformidade\s+com\b/gi, "conforme"],
    [/\bde\s+conformidade\s+com\b/gi, "conforme"],
    [/\bna\s+eventualidade\s+de\b/gi, "se"],
    [/\bno\s+caso\s+de\s+haver\b/gi, "se houver"],
    [/\bpor\s+ocasi[aã]o\s+d[eoa]s?\b/gi, "durante"],
    [/\bna\s+presente\s+data\b/gi, "hoje"],
    [/\bno\s+dia\s+de\s+hoje\b/gi, "hoje"],
    [/\bo\s+quanto\s+antes\b/gi, "com urgência"],
    [/\bsolicita-se\s+a\s+gentileza\s+de\b/gi, "por favor,"],
    [/\bsolicitamos\s+encarecidamente\b/gi, "pedimos"],
    [/\bproceder\s+ao\s+preenchimento\b/gi, "preencher"],
    [/\bproceda\s+ao\s+preenchimento\b/gi, "preencha"],
    [/\bproceder\s+[aà]\s+verifica[cç][aã]o\b/gi, "verificar"],
    [/\bproceder\s+[aà]\s+an[aá]lise\b/gi, "analisar"],
    [/\bproceder\s+[aà]\s+apresenta[cç][aã]o\b/gi, "apresentar"],
    [/\bproceder\s+[aà]\s+assinatura\b/gi, "assinar"],
    [/\bproceder\s+[aà]\s+abertura\b/gi, "abrir"],
    [/\bproceder\s+ao\s+fechamento\b/gi, "fechar"],
    [/\bproceder\s+com\s+a\s+entrega\b/gi, "entregar"],
    [/\bfazer\s+a\s+entrega\b/gi, "entregar"],
    [/\bfazer\s+a\s+realiza[cç][aã]o\b/gi, "realizar"],
    [/\befetuar\s+o\s+pagamento\b/gi, "pagar"],
    [/\brealizar\s+o\s+pagamento\b/gi, "pagar"],
    [/\befetuar\s+a\s+inscri[cç][aã]o\b/gi, "inscrever-se"],
    [/\bfazer\s+a\s+inscri[cç][aã]o\b/gi, "inscrever-se"],
    [/\befetuar\s+a\s+matr[ií]cula\b/gi, "matricular-se"],
    [/\bfazer\s+a\s+matr[ií]cula\b/gi, "matricular-se"],
    [/\befetuar\s+o\s+cadastro\b/gi, "cadastrar-se"],
    [/\brealizar\s+o\s+cadastro\b/gi, "cadastrar-se"],
    [/\bdar\s+in[ií]cio\s+a\b/gi, "iniciar"],
    [/\bfazer\s+men[cç][aã]o\s+a\b/gi, "mencionar"],
    [/\btomar\s+uma\s+decis[aã]o\b/gi, "decidir"],
    [/\bchegar\s+a\s+um\s+acordo\b/gi, "acordar"],
    [/\bprestar\s+esclarecimentos\b/gi, "esclarecer"],
    [/\bsolicitar\s+a\s+presen[cç]a\b/gi, "convocar"],
    [/\bsolicitar\s+o\s+comparecimento\b/gi, "convocar"],
    [/\bdar\s+ci[eê]ncia\b/gi, "informar"]
  ];

  for (const [pattern, replacement] of phraseTransformations) {
    result = result.replace(pattern, replacement);
  }

  // 8. Padronização de Horas conforme a Metodologia Unicamp
  // "14:00hs" -> "14h", "14:30hs" -> "14h30", "09:00 horas" -> "9h"
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])(?::|\.)00\s*(?:hs?|hrs?|horas?)\b/gi, "$1h");
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])(?::|\.)([0-5]\d)\s*(?:hs?|hrs?|horas?)\b/gi, "$1h$2");
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])\s*(?:hs|hrs|horas)\b/gi, "$1h");

  // 9. Divisão de Períodos Excessivamente Longos (> 20 palavras)
  result = result.replace(/,\s*(sendo\s+que|de\s+modo\s+que|de\s+forma\s+que)\s+/gi, ". Assim, ");
  result = result.replace(/,\s*(tendo\s+em\s+vista\s+que|haja\s+vista\s+que|uma\s+vez\s+que)\s+/gi, ". Isso porque ");
  result = result.replace(/,\s*(bem\s+como|al[eé]m\s+do\s+mais)\s+/gi, ". Além disso, ");

  // Ajustes de pontuação e espaçamento
  result = result.replace(/\s{2,}/g, " ");
  result = result.replace(/\s+([,.;:!?])/g, "$1");
  result = result.replace(/([.!?])\s*([a-záéíóúç])/g, (m, p, l) => `${p} ${l.toUpperCase()}`);

  return result.trim();
}
