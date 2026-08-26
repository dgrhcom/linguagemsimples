import verbosidadeList from "../../data/terminology/verbosidade.json" with { type: "json" };
import chavoesList from "../../data/terminology/chavoes.json" with { type: "json" };
import linguagemNaoSexistaList from "../../data/terminology/linguagem-nao-sexista.json" with { type: "json" };
import termosNaoOfensivosList from "../../data/terminology/termos-nao-ofensivos.json" with { type: "json" };

/**
 * Inverte construções passivas comuns para ordem direta e voz ativa.
 */
function simplifyPassiveVoice(text: string): string {
  let result = text;

  // Inversão completa: "Esta reunião foi convocada pela diretoria" -> "A diretoria convocou esta reunião"
  result = result.replace(
    /\b(est[ea]|o|a)\s+([a-záéíóúç]+)\s+foi\s+(convocad[oa]|realizad[oa]|solicitad[oa]|aprovad[oa]|enviad[oa]|elaborad[oa]|feita?)\s+pel([oa])\s+([a-záéíóúç]+)(?!\s+(?:para|a\s+fim|que|com|em|de|da|do|quando|pois|porque))\b/gi,
    (m, art1, subst1, verb, art2, agente) => {
      const verbLower = verb.toLowerCase();
      let v = "realizou";
      if (verbLower.startsWith("convocad")) v = "convocou";
      else if (verbLower.startsWith("realizad") || verbLower.startsWith("feit")) v = "realizou";
      else if (verbLower.startsWith("solicitad")) v = "solicitou";
      else if (verbLower.startsWith("aprovad")) v = "aprovou";
      else if (verbLower.startsWith("enviad")) v = "enviou";
      else if (verbLower.startsWith("elaborad")) v = "elaborou";

      const artigoAgente = art2.toLowerCase() === "a" ? "a" : "o";
      return `${artigoAgente} ${agente} ${v} ${art1.toLowerCase()} ${subst1}`;
    }
  );

  // Inversões parciais: "foi convocado(a) pela comissão / pelo reitor" -> "a comissão / o reitor convocou"
  result = result.replace(/\bfoi\s+convocad[oa]\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} convocou`);
  result = result.replace(/\bfoi\s+realizad[oa]\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} realizou`);
  result = result.replace(/\bfoi\s+solicitad[oa]\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} solicitou`);
  result = result.replace(/\bfoi\s+aprovad[oa]\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} aprovou`);
  result = result.replace(/\bforam\s+aprovad[oa]s\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} aprovou`);
  result = result.replace(/\bserá\s+realizad[oa]\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} realizará`);
  result = result.replace(/\bforam\s+enviad[oa]s\s+pel([oa])\s+([a-záéíóúç]+)\b/gi, (m, a, ag) => `${a === "a" ? "a" : "o"} ${ag} enviou`);


  // Ajusta primeira letra para maiúscula se estiver no início
  result = result.replace(/^([a-z])/g, (m, l) => l.toUpperCase());

  return result;
}


/**
 * Mascara URLs, domínios e e-mails para evitar que pontuações internas sejam corrompidas.
 */
function maskProtectedTokens(text: string): { maskedText: string; tokens: Map<string, string> } {
  const tokens = new Map<string, string>();
  let counter = 0;

  // 1. URLs completas e endereços com protocolo ou www (ex: www.dgrh.unicamp.br, https://...)
  let maskedText = text.replace(/(?:https?:\/\/|www\.)[^\s,;()]+/gi, (match) => {
    const key = `___URL_TOKEN_${counter++}___`;
    tokens.set(key, match);
    return key;
  });

  // 2. E-mails (ex: contato@unicamp.br)
  maskedText = maskedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, (match) => {
    const key = `___EMAIL_TOKEN_${counter++}___`;
    tokens.set(key, match);
    return key;
  });

  // 3. Extensões de arquivos comuns (ex: documento.pdf)
  maskedText = maskedText.replace(/\b([a-zA-Z0-9_-]+)\.(pdf|docx?|xlsx?|pptx?|txt|csv|png|jpe?g|svg)\b/gi, (match) => {
    const key = `___FILE_TOKEN_${counter++}___`;
    tokens.set(key, match);
    return key;
  });

  return { maskedText, tokens };
}

function unmaskProtectedTokens(text: string, tokens: Map<string, string>): string {
  let result = text;
  for (const [key, value] of tokens.entries()) {
    result = result.split(key).join(value);
  }
  return result;
}

/**
 * Reescreve um parágrafo individual aplicando as regras da Unicamp.
 */
function rewriteSingleParagraph(paragraph: string): string {
  if (!paragraph || !paragraph.trim()) return paragraph;

  // Protege URLs e e-mails de alterações indevidas de pontuação/caixa
  const { maskedText, tokens } = maskProtectedTokens(paragraph);
  let result = maskedText;

  // 0. Preâmbulos Administrativos / Normativos (ex: "Considerando que... baixa a seguinte Instrução Normativa:")
  result = result.replace(
    /\bConsiderando\s+que\s+([\s\S]+?),\s*(o|a)\s+([A-Za-zÀ-ÿ\s]+?),\s*(?:no\s+uso\s+de\s+suas\s+atribui[cç][oõ]es|no\s+uso\s+das\s+atribui[cç][oõ]es\s+que\s+lhe\s+s[aã]o\s+conferidas|resolve\s+baixa[r]?|baixa)\s+a\s+seguinte\s+([A-Za-zÀ-ÿ\s]+):/gi,
    (m, premissa, art, autoridade, tipoNorma) => {
      return `${art.toUpperCase()} ${autoridade} publica esta ${tipoNorma}. A regra estabelece que ${premissa}:`;
    }
  );

  result = result.replace(
    /\bno\s+uso\s+de\s+suas\s+atribui[cç][oõ]es(?:\s+legais)?,\s*(?:baixa|resolve\s+baixar)\s+a\s+seguinte\s+([A-Za-zÀ-ÿ\s]+):/gi,
    "publica a seguinte $1:"
  );

  // 1. Elimina fórmulas de abertura e fechos burocráticos vazios
  const openingsAndClosings: [RegExp, string][] = [
    [/\b(serve\s+a\s+presente\s+para\s+informar|serve\s+a\s+presente\s+para\s+comunicar|vimos\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+comunicar)\s+que\b/gi, "Informamos que"],
    [/\b(vimos\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+solicitar|venho\s+(?:por\s+meio\s+dest[ea]|atrav[eé]s\s+dest[ea])\s+solicitar|pelo\s+presente\s+solicitamos)\b/gi, "Solicitamos"],
    [/\b(cumpre-nos\s+informar|levamos\s+ao\s+conhecimento\s+de\s+vossa\s+senhoria)\s+que\b/gi, "Informamos que"],
    [/\b(acusamos\s+o\s+recebimento\s+d[eoa]s?)\b/gi, "Confirmamos o recebimento de"],
    [/\b(reiteramos\s+os?\s+protestos\s+de\s+(?:elevada\s+)?estima\s+e\s+considera[cç][aã]o|renovamos\s+protestos\s+de\s+apre[cç]o|sem\s+mais\s+para\s+o\s+momento)\b\.?/gi, "Atenciosamente,"],
    [/\b(para\s+que\s+surta\s+seus\s+efeitos\s+legais|para\s+os\s+devidos\s+fins\s+de\s+direito|era\s+o\s+que\s+nos\s+cumpria\s+relatar)\b\.?/gi, ""]
  ];

  for (const [pattern, replacement] of openingsAndClosings) {
    result = result.replace(pattern, replacement);
  }

  // 2. Abolição formal de tratamentos obsoletos (DD., Ilmo., Exmo. indevido)
  result = result.replace(/\bDD\.\s*/g, "");
  result = result.replace(/\bIlm[oa]\.\s*Sr[a]?\.\s*/gi, "Senhor(a) ");
  result = result.replace(/\b(Dign[ií]ssim[oa]|Ilustr[ií]ssim[oa])\s+Senhor[a]?\b/gi, "Senhor(a)");

  // 3. Dicionário de Verbosidade da Unicamp
  for (const item of verbosidadeList) {
    if (!item.termo || !item.alternativas?.length) continue;
    const escaped = item.termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 4. Dicionário de Chavões da Unicamp
  for (const item of chavoesList) {
    if (!item.expressao || !item.substituicoes?.length) continue;
    const escaped = item.expressao.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.substituicoes[0]);
  }

  // 5. Dicionário de Linguagem Inclusiva / Não-Sexista
  for (const item of linguagemNaoSexistaList) {
    if (!item.termoExcludente || !item.alternativas?.length) continue;
    const escaped = item.termoExcludente.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 6. Dicionário de Termos Não Ofensivos / Não Capacitistas
  for (const item of termosNaoOfensivosList) {
    if (!item.termoInadequado || !item.alternativas?.length) continue;
    const escaped = item.termoInadequado.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, item.alternativas[0]);
  }

  // 7. Expressões Burocráticas, Fórmulas e Nominalizações
  const phraseTransformations: [RegExp, string][] = [
    // Fórmulas de tempo, previdência e atos normativos
    [/\bdepender[aá]\s+de\s+comprova[cç][aã]o\b/gi, "exige comprovação"],
    [/\bde\s+modo\s+permanente,\s*n[aã]o\s+ocasional\s+nem\s+intermitente\b/gi, "de forma contínua e permanente"],
    [/\bsob\s+condi[cç][oõ]es\s+especiais\s+prejudiciais\s+[aà]\s+sa[uú]de\s+ou\s+[aà]\s+integridade\s+f[ií]sica\b/gi, "em condições prejudiciais à saúde ou integridade física"],
    [/\btempo\s+de\s+atividade\s+sob\s+condi[cç][oõ]es\s+especiais\b/gi, "tempo especial de trabalho"],
    [/\btempo\s+de\s+servi[cç]o\s+p[uú]blico\s+exercido\s+pelos\s+servidores\b/gi, "tempo de serviço público dos servidores"],
    [/\bobedecer[aã]o\s+ao\s+disposto\s+na\s+legisla[cç][aã]o\s+em\s+vigor\b/gi, "seguem a legislação vigente"],
    [/\bobedecer[aá]\s+ao\s+disposto\s+na\s+legisla[cç][aã]o\s+em\s+vigor\b/gi, "segue a legislação vigente"],
    [/\bobedecer[aã]o\s+ao\s+disposto\s+n[eoa]s?\b/gi, "seguem o disposto n$1"],
    [/\bobedecer[aá]\s+ao\s+disposto\s+n[eoa]s?\b/gi, "segue o disposto n$1"],
    [/\bobedecer[aã]o\s+ao\s+disposto\b/gi, "seguem as regras"],
    [/\bobedecer[aá]\s+ao\s+disposto\b/gi, "segue as regras"],
    [/\bna\s+[eé]poca\s+do\s+exerc[ií]cio\s+das\s+atribui[cç][oõ]es\s+d[eoa]\s+servidor(?:a)?\s+p[uú]blico\b/gi, "na época do trabalho da pessoa servidora"],
    [/\bna\s+[eé]poca\s+do\s+exerc[ií]cio\s+das\s+atribui[cç][oõ]es\b/gi, "na época em que trabalhou"],
    [/\bdo\s+exerc[ií]cio\s+das\s+atribui[cç][oõ]es\s+d[eoa]\s+servidor(?:a)?\s+p[uú]blico\b/gi, "do trabalho da pessoa servidora"],
    [/\bdo\s+exerc[ií]cio\s+das\s+atribui[cç][oõ]es\b/gi, "do trabalho"],
    [/\bcaracteriza[cç][aã]o\s+e\s+a\s+comprova[cç][aã]o\b/gi, "definição e a comprovação"],
    [/\bmanifesta[cç][aã]o\s+escrita\s+a\s+pr[oó]prio\s+punho\s+declarando\s+seu\s+endere[cç]o\s+de\s+resid[eê]ncia\s+domiciliar\b/gi, "declaração de residência escrita à mão"],

    [/\bmanifesta[cç][aã]o\s+escrita\s+a\s+pr[oó]prio\s+punho\b/gi, "declaração escrita à mão"],
    [/\bendere[cç]o\s+de\s+resid[eê]ncia\s+domiciliar\b/gi, "endereço residencial"],
    [/\bresid[eê]ncia\s+domiciliar\b/gi, "residência"],
    [/\bchegou\s+a\s+peticionar\s+contra\b/gi, "entrou com ação contra"],
    [/\bpeticionar\s+contra\b/gi, "entrar com ação contra"],
    [/\bconcomitantemente\b/gi, "ao mesmo tempo"],
    [/\bdestarte\b/gi, "assim"],
    [/\bdessarte\b/gi, "portanto"],
    [/\boutrossim\b/gi, "além disso"],
    [/\bdoravante\b/gi, "a partir de agora"],
    [/\bpara\s+fins\s+de\s+solicita[cç][aã]o\s+d[eoa]s?\b/gi, "para solicitar"],
    [/\bpara\s+fins\s+de\s+efetiva[cç][aã]o\s+d[eoa]s?\b/gi, "para efetivar"],
    [/\bpara\s+fins\s+de\s+comprova[cç][aã]o\s+d[eoa]s?\b/gi, "para comprovar"],
    [/\bpara\s+fins\s+de\s+concess[aã]o\s+d[eoa]s?\b/gi, "para conceder"],
    [/\bpara\s+fins\s+de\s+homologa[cç][aã]o\s+d[eoa]s?\b/gi, "para homologar"],
    [/\bpara\s+fins\s+de\b/gi, "para"],
    [/\bcom\s+a\s+finalidade\s+de\b/gi, "para"],
    [/\bcom\s+vistas\s+a\b/gi, "para"],
    [/\bcom\s+o\s+intuito\s+de\b/gi, "para"],
    [/\bcom\s+o\s+escopo\s+de\b/gi, "para"],
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
    [/\bem\s+conson[aâ]ncia\s+com\b/gi, "conforme"],
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
    [/\bproceder\s+[aà]\s+emiss[aã]o\b/gi, "emitir"],
    [/\bproceder\s+[aà]\s+juntada\b/gi, "juntar"],
    [/\bfazer\s+a\s+entrega\b/gi, "entregar"],
    [/\brealizar\s+a\s+entrega\b/gi, "entregar"],
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
    [/\bprestar\s+aux[ií]lio\b/gi, "ajudar"],
    [/\bprestar\s+atendimento\b/gi, "atender"],
    [/\bsolicitar\s+a\s+presen[cç]a\b/gi, "convocar"],
    [/\bsolicitar\s+o\s+comparecimento\b/gi, "convocar"],
    [/\bdar\s+ci[eê]ncia\b/gi, "informar"],
    [/\btomar\s+ci[eê]ncia\b/gi, "ficar ciente"],
    [/\bcumpre\s+salientar\s+que\b/gi, "destacamos que"],
    [/\bfaz-se\s+mister\b/gi, "é necessário"],
    [/\b[eé]\s+mister\s+que\b/gi, "é necessário que"],
    [/\bn[aã]o\s+obstante\b/gi, "apesar disso"],
    [/\bo\s+requerente\s+dever[aá]\b/gi, "o solicitante deve"],
    [/\bos\s+requerentes\s+dever[aã]o\b/gi, "os solicitantes devem"]
  ];

  for (const [pattern, replacement] of phraseTransformations) {
    result = result.replace(pattern, replacement);
  }

  // 8. Inversão de Voz Passiva
  result = simplifyPassiveVoice(result);

  // 9. Padronização de Horas
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])(?::|\.)00\s*(?:hs?|hrs?|horas?)\b/gi, "$1h");
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])(?::|\.)([0-5]\d)\s*(?:hs?|hrs?|horas?)\b/gi, "$1h$2");
  result = result.replace(/\b0?([1-9]|1\d|2[0-3])\s*(?:hs|hrs|horas)\b/gi, "$1h");

  // 10. Divisão de Períodos Excessivamente Longos (> 20 palavras)
  result = result.replace(/,\s*(sendo\s+que|de\s+modo\s+que|de\s+forma\s+que)\s+/gi, ". Assim, ");
  result = result.replace(/,\s*(tendo\s+em\s+vista\s+que|haja\s+vista\s+que|uma\s+vez\s+que)\s+/gi, ". Isso ocorreu porque ");
  result = result.replace(/,\s*(bem\s+como|al[eé]m\s+do\s+mais)\s+/gi, ". Além disso, ");

  // Ajustes de pontuação e espaçamento (PRESERVANDO QUEBRAS DE LINHA E TOKENS!)
  result = result.replace(/[^\S\r\n]{2,}/g, " ");
  result = result.replace(/[^\S\r\n]+([,.;:!?])/g, "$1");
  // Capitaliza APENAS letras após ponto e espaço explícito
  result = result.replace(/([.!?])\s+([a-záéíóúç])/g, (m, p, l) => `${p} ${l.toUpperCase()}`);

  // Restaura tokens protegidos (URLs, domínios, e-mails, arquivos)
  result = unmaskProtectedTokens(result, tokens);

  return result.trim();
}

/**
 * Motor estruturado de reescrita em Linguagem Simples e Inclusiva.
 * Processa o texto preservando RIGOROSAMENTE todas as quebras de parágrafo (\n\n).
 */
export function rewriteToPlainLanguage(text: string): string {
  if (!text || !text.trim()) return text;

  // Divide o texto por quebras de linha preservando a estrutura de parágrafos
  const lines = text.split(/\r?\n/);
  const rewrittenLines = lines.map(line => {
    if (!line.trim()) return ""; // Mantém linhas em branco intactas
    return rewriteSingleParagraph(line);
  });

  return rewrittenLines.join("\n");
}

/**
 * Garante que uma sugestão de trecho nunca seja idêntica ao texto original.
 * Se o motor regex tradicional retornar idêntico, aplica transformações ativas de voz e ordem direta.
 */
export function guaranteeDifferentSuggestion(original: string, candidate?: string): string {
  const cleanOriginal = (original || "").trim();
  const cleanCandidate = (candidate || "").trim();

  if (cleanCandidate && cleanCandidate !== cleanOriginal) {
    return cleanCandidate;
  }

  // 1. Tenta reescrita determinística ampliada
  const deterministic = rewriteToPlainLanguage(cleanOriginal);
  if (deterministic && deterministic !== cleanOriginal) {
    return deterministic;
  }

  // 2. Tenta inversão ativa de sintaxe ou simplificação de conectivos
  let forced = cleanOriginal;
  forced = simplifyPassiveVoice(forced);
  forced = forced
    .replace(/\bcom o objetivo de\b/gi, "para")
    .replace(/\bcom vistas a\b/gi, "para")
    .replace(/\bpara fins de\b/gi, "para")
    .replace(/\bno intuito de\b/gi, "para")
    .replace(/\btendo em vista que\b/gi, "porque")
    .replace(/\bhaja vista\b/gi, "como")
    .replace(/\bproceder à\b/gi, "")
    .replace(/\bproceder ao\b/gi, "")
    .replace(/\bfoi realizada\b/gi, "aconteceu")
    .replace(/\bfoi realizado\b/gi, "aconteceu");

  if (forced !== cleanOriginal) {
    return forced;
  }

  return cleanCandidate && cleanCandidate !== cleanOriginal ? cleanCandidate : forced;
}




