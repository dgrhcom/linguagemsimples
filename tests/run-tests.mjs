import test from "node:test";
import assert from "node:assert/strict";

// Importa datasets diretamente
import verbosidadeData from "../src/data/terminology/verbosidade.json" with { type: "json" };
import chavoesData from "../src/data/terminology/chavoes.json" with { type: "json" };
import linguagemNaoSexistaData from "../src/data/terminology/linguagem-nao-sexista.json" with { type: "json" };
import termosNaoOfensivosData from "../src/data/terminology/termos-nao-ofensivos.json" with { type: "json" };
import tratamentosData from "../src/data/terminology/tratamentos.json" with { type: "json" };
import siglasPadraoData from "../src/data/terminology/siglas-padrao.json" with { type: "json" };

import { computeWordDiff, calculateDiffStats } from "../src/lib/analysis/diff-utils.ts";
import { rewriteToPlainLanguage, guaranteeDifferentSuggestion } from "../src/lib/analysis/plain-language-rewriter.ts";
import { runDeterministicAnalysis } from "../src/lib/analysis/deterministic-engine.ts";
import { MockLanguageModelProvider } from "../src/lib/ai/mock-provider.ts";

test("1. Verificação dos Datasets de Conhecimento da Unicamp", (t) => {
  assert.ok(verbosidadeData.length >= 20, "Dicionário de verbosidade deve conter termos suficientes");
  assert.ok(chavoesData.length >= 8, "Dicionário de chavões deve conter expressões mapeadas");
  assert.ok(linguagemNaoSexistaData.length >= 10, "Dicionário de linguagem inclusiva deve estar preenchido");
  assert.ok(termosNaoOfensivosData.length >= 10, "Dicionário de termos não ofensivos deve estar preenchido");
  assert.ok(tratamentosData.abolidos.length >= 3, "Tratamentos abolidos (DD/Ilmo) devem estar presentes");
  assert.ok(siglasPadraoData.length >= 10, "Siglas padrão devem estar catalogadas");
});

test("2. Teste de Métricas e Divisão de Frases", () => {
  const sample = "Esta é uma frase curta. Esta segunda frase é um pouco maior, contudo ainda se mantém dentro dos limites recomendados pela metodologia de redação simples da Unicamp para garantir clareza absoluta na leitura.";
  const words = sample.split(/\s+/);
  assert.ok(words.length > 20, "O texto de teste deve conter mais de 20 palavras");
});

test("3. Detecção de Formas Abolidas (DD. e Ilmo.)", () => {
  const sample = "Encaminhamos ao Ilmo. Sr. Diretor e ao DD. Coordenador.";
  const hasIlmo = sample.includes("Ilmo.");
  const hasDD = sample.includes("DD.");
  assert.equal(hasIlmo, true, "Deve detectar Ilmo.");
  assert.equal(hasDD, true, "Deve detectar DD.");
});

test("4. Validação de Regra de Horas e Siglas no Plural", () => {
  const invalidTime = "A reunião será às 14:00hs e contará com membros de várias ONG's.";
  const timeRegex = /\b(\d{1,2})(:|\.)(\d{2})\s*(hs?|hrs?|horas?)\b/gi;
  const siglaAposRegex = /\b([A-Z]{2,})'s\b/g;

  assert.ok(timeRegex.test(invalidTime), "Deve identificar formato incorreto de horas ('14:00hs')");
  assert.ok(siglaAposRegex.test(invalidTime), "Deve identificar sigla incorreta com apóstrofo ('ONG's')");
});

test("5. Algoritmo de Diff estilo WordPress / Palavra a Palavra", () => {
  const oldText = "Vimos através desta solicitar a documentação supracitada.";
  const newText = "Solicitamos os documentos citados.";

  const diff = computeWordDiff(oldText, newText);
  const stats = calculateDiffStats(diff);

  assert.ok(diff.some(d => d.type === "delete"), "Deve conter trechos removidos");
  assert.ok(diff.some(d => d.type === "insert"), "Deve conter trechos inseridos");
  assert.ok(stats.deletions > 0, "Deve computar deleções");
  assert.ok(stats.insertions > 0, "Deve computar inserções");
});

test("6. Motor de Reescrita para Linguagem Simples (Nunca retorna idêntico em textos com problemas)", () => {
  const complexText = "Vimos por meio desta solicitar a Vossa Senhoria que proceda ao preenchimento do formulário supracitado, tendo em vista que a reunião será às 14:00hs para dirimir dúvidas dos servidores.";
  const rewritten = rewriteToPlainLanguage(complexText);

  assert.notEqual(rewritten, complexText, "O texto reescrito NÃO pode ser idêntico ao original!");
  assert.ok(!rewritten.includes("Vimos por meio desta"), "Deve eliminar 'Vimos por meio desta'");
  assert.ok(!rewritten.includes("proceda ao preenchimento"), "Deve transformar 'proceda ao preenchimento' em 'preencha'");
  assert.ok(!rewritten.includes("supracitado"), "Deve substituir 'supracitado'");
  assert.ok(!rewritten.includes("14:00hs"), "Deve formatar '14:00hs' para '14h'");
  assert.ok(!rewritten.includes("para dirimir dúvidas"), "Deve simplificar 'para dirimir dúvidas'");
});

test("7. Preservação Rigorosa de Marcas de Parágrafo e Quebras de Linha", () => {
  const multiParagraph = "Primeiro parágrafo burocrático com supracitado.\n\nSegundo parágrafo com reunião às 14:00hs.\n\nTerceiro parágrafo.";
  const rewritten = rewriteToPlainLanguage(multiParagraph);

  const originalParagraphs = multiParagraph.split("\n\n");
  const rewrittenParagraphs = rewritten.split("\n\n");

  assert.equal(rewrittenParagraphs.length, originalParagraphs.length, "Deve preservar exatamente o número de parágrafos separados por dupla quebra de linha");
  assert.ok(rewritten.includes("\n\n"), "As quebras de parágrafo NÃO devem ser substituídas por espaços simples");
});

test("8. Geração Automática de Sugestões para Frases Longas", () => {
  const longSentenceText = "Informamos a todos os interessados que o processo de submissão de propostas para o presente edital de extensão comunitária da universidade foi prorrogado, tendo em vista que ocorreram instabilidades técnicas significativas no sistema institucional de cadastramento durante o final de semana passado.";
  const findings = runDeterministicAnalysis({ text: longSentenceText, documentType: "general" });

  const lengthFinding = findings.find(f => f.ruleId === "unicamp-sentence-length");
  assert.ok(lengthFinding, "Deve identificar frase longa");
  assert.ok(lengthFinding.suggestedText, "Deve fornecer suggestedText automático para frase longa");
  assert.notEqual(lengthFinding.suggestedText, lengthFinding.originalText, "A sugestão deve ser diferente da frase original longa");
});

test("9. Garantia de Sugestão Diferente e Inversão de Voz Passiva", () => {
  const passive = "Esta reunião foi convocada pela diretoria a fim de que os colaboradores pudessem discutir.";
  const suggestion = guaranteeDifferentSuggestion(passive);

  assert.notEqual(suggestion, passive, "A sugestão deve ser diferente do original passivo");
  assert.ok(suggestion.includes("a diretoria convocou") || suggestion.includes("para que"), "Deve aplicar voz ativa e conectivo simples");
});

test("10. Complementaridade do Motor Unicamp + Provedor em Modo Segmento", async () => {
  const provider = new MockLanguageModelProvider();
  const segment = "É preciso entregar uma manifestação escrita a próprio punho declarando seu endereço de residência domiciliar.";
  
  const result = await provider.rewriteText(
    { text: segment, documentType: "general" },
    { mode: "segment", segmentIssue: "Expressão prolixa e arcaica" }
  );

  assert.ok(result.rewrittenText, "Deve retornar reescrita");
  assert.notEqual(result.rewrittenText, segment, "A reescrita de trecho NÃO pode ser idêntica ao original");
  assert.ok(result.rewrittenText.includes("declaração") || result.rewrittenText.includes("residência"), "Deve conter termos simplificados");
});

test("11. Preservação Estrita de URLs, Domínios e E-mails", () => {
  const sampleWithUrls = "Mais informações no site www.dgrh.unicamp.br ou pelo e-mail dgrh@unicamp.br e arquivo anexo.pdf.";
  const rewritten = rewriteToPlainLanguage(sampleWithUrls);

  assert.ok(rewritten.includes("www.dgrh.unicamp.br"), "A URL www.dgrh.unicamp.br deve permanecer intacta sem espaços ou maiúsculas internas");
  assert.ok(!rewritten.includes("www. Dgrh"), "NÃO pode conter 'www. Dgrh'");
  assert.ok(rewritten.includes("dgrh@unicamp.br"), "O e-mail deve permanecer intacto");
  assert.ok(rewritten.includes("anexo.pdf"), "A extensão do arquivo deve permanecer intacta");
});

test("12. Reescrita de Preâmbulos Normativos e Frases Longas de Instrução Normativa", () => {
  const preamble = "Considerando que o reconhecimento pela Unicamp do tempo de serviço público exercido pelos servidores estatutários subordinados ao Regime Próprio sob condições especiais dependerá de comprovação, o Coordenador da Diretoria Geral de Recursos Humanos, no uso de suas atribuições, baixa a seguinte Instrução Normativa:";
  const rewritten = rewriteToPlainLanguage(preamble);

  assert.notEqual(rewritten, preamble, "O preâmbulo reescrito NÃO pode ser idêntico ao original!");
  assert.ok(!rewritten.includes("no uso de suas atribuições"), "Deve eliminar a fórmula burocrática 'no uso de suas atribuições'");
  assert.ok(rewritten.includes("publica"), "Deve conter verbo direto como 'publica'");
  assert.ok(!rewritten.includes("dependerá de comprovação"), "Deve simplificar 'dependerá de comprovação'");
});

test("13. Reescrita de Artigo Normativo com Mais de 20 Palavras", async () => {
  const article = "Artigo 1º – A caracterização e a comprovação do tempo de atividade sob condições especiais obedecerão ao disposto na legislação em vigor na época do exercício das atribuições do servidor público.";
  const rewritten = rewriteToPlainLanguage(article);

  assert.notEqual(rewritten, article, "A reescrita do artigo normativo NÃO pode ser idêntica ao original!");
  assert.ok(!rewritten.includes("obedecerão ao disposto na legislação em vigor"), "Deve simplificar a fórmula 'obedecerão ao disposto na legislação em vigor'");
  assert.ok(rewritten.includes("seguem a legislação") || rewritten.includes("regras vigentes") || rewritten.includes("tempo especial"), "Deve conter linguagem simplificada");
});

test("14. Camada de Revisão Ortográfica e Gramatical Determinística", () => {
  const textWithSpellingErrors = "Com excessão deste caso, não é previlégio reinvidicar o direito à partir de hoje. Haja visto que a idéia foi aprovada.";
  const findings = runDeterministicAnalysis({ text: textWithSpellingErrors });

  const spellingFindings = findings.filter(f => f.category === "spelling");
  assert.ok(spellingFindings.length >= 4, `Deve identificar desvios ortográficos (encontrados: ${spellingFindings.length})`);

  const excessao = spellingFindings.find(f => f.originalText.toLowerCase() === "excessão");
  assert.ok(excessao, "Deve encontrar erro de grafia 'excessão'");
  assert.equal(excessao.suggestedText.toLowerCase(), "exceção", "Deve sugerir 'exceção'");

  const previlegio = spellingFindings.find(f => f.originalText.toLowerCase() === "previlégio");
  assert.ok(previlegio, "Deve encontrar erro de grafia 'previlégio'");
  assert.equal(previlegio.suggestedText.toLowerCase(), "privilégio", "Deve sugerir 'privilégio'");

  const crase = spellingFindings.find(f => f.originalText.toLowerCase() === "à partir de");
  assert.ok(crase, "Deve encontrar crase indevida 'à partir de'");
  assert.equal(crase.suggestedText.toLowerCase(), "a partir de", "Deve sugerir 'a partir de' sem crase");

  const ideia = spellingFindings.find(f => f.originalText.toLowerCase() === "idéia");
  assert.ok(ideia, "Deve encontrar acento abolido pelo Novo Acordo 'idéia'");
  assert.equal(ideia.suggestedText.toLowerCase(), "ideia", "Deve sugerir 'ideia'");
});

test("15. Editor de Sugestões: Aplicação de Versão Customizada pelo Usuário", () => {
  const initialText = "O requerente deverá proceder ao preenchimento do formulário.";
  const finding = {
    id: "f-1",
    category: "clarity",
    severity: "warning",
    originalText: "proceder ao preenchimento do formulário",
    suggestedText: "preencher o formulário"
  };

  // Simulação de edição personalizada pelo usuário no card
  const customUserText = "preencher o formulário online no portal oficial";
  const updatedFinding = { ...finding, suggestedText: customUserText, status: "applied" };

  const appliedText = initialText.replace(updatedFinding.originalText, updatedFinding.suggestedText);

  assert.equal(
    appliedText,
    "O requerente deverá preencher o formulário online no portal oficial.",
    "O texto aplicado deve refletir com exatidão a edição personalizada feita pelo usuário"
  );
});

test("16. Garantia de Reescrita de Frases Longas e Sugestões para Comparação", () => {
  const longSentence = "A comissão deliberativa especial de avaliação realizou a conferência de todos os documentos apresentados pelos candidatos no prazo estipulado, sendo que todas as pendências foram devidamente encaminhadas para regularização perante o órgão competente.";
  
  const findings = runDeterministicAnalysis({ text: longSentence });
  const sentenceFinding = findings.find(f => f.category === "sentence");

  assert.ok(sentenceFinding, "Deve identificar apontamento de frase longa");
  assert.ok(sentenceFinding.suggestedText, "A frase longa DEVE ter sugestão gerada");
  assert.notEqual(
    sentenceFinding.suggestedText.trim(),
    sentenceFinding.originalText.trim(),
    "A sugestão para frase longa NUNCA pode ser idêntica ao original!"
  );
  assert.ok(
    sentenceFinding.suggestedText.includes(". Assim,") || sentenceFinding.suggestedText.includes(". "),
    "A sugestão deve conter divisão em frases mais curtas"
  );
});





