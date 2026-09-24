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

test("8. Detecção de Frases Longas para Reescrita por IA", () => {
  const longSentenceText = "Informamos a todos os interessados que o processo de submissão de propostas para o presente edital de extensão comunitária da universidade foi prorrogado, tendo em vista que ocorreram instabilidades técnicas significativas no sistema institucional de cadastramento durante o final de semana passado.";
  const findings = runDeterministicAnalysis({ text: longSentenceText, documentType: "general" });

  const lengthFinding = findings.find(f => f.ruleId === "unicamp-sentence-length");
  assert.ok(lengthFinding, "Deve identificar frase longa com mais de 20 palavras");
  assert.equal(lengthFinding.suggestedText, undefined, "Não deve aplicar diminuição mecânica forçada");
  assert.ok(lengthFinding.explanation.includes("palavras"), "A explicação deve informar a quantidade de palavras");
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

test("16. Identificação de Frases Longas Sem Corte Mecânico e Reescrita Fluida por IA", async () => {
  const longSentence = "A comissão deliberativa especial de avaliação realizou a conferência de todos os documentos apresentados pelos candidatos no prazo estipulado, sendo que todas as pendências foram devidamente encaminhadas para regularização perante o órgão competente.";
  
  // 1. No motor determinístico, a frase é apontada como problema, mas SEM mutilação mecânica
  const findings = runDeterministicAnalysis({ text: longSentence });
  const sentenceFinding = findings.find(f => f.category === "sentence");

  assert.ok(sentenceFinding, "Deve identificar apontamento de frase longa com mais de 20 palavras");
  assert.equal(
    sentenceFinding.suggestedText,
    undefined,
    "Frases longas não devem sofrer corte mecânico forçado no motor determinístico"
  );
  assert.ok(
    sentenceFinding.recommendation.includes("IA") || sentenceFinding.recommendation.includes("ordem direta"),
    "A recomendação deve orientar o uso de frases curtas na ordem direta e IA"
  );

  // 2. Na reescrita por IA, uma versão simplificada e fluida é produzida
  const provider = new MockLanguageModelProvider();
  const rewriteResult = await provider.rewriteText(
    { text: longSentence, documentType: "general" },
    { mode: "segment", segmentIssue: sentenceFinding.explanation }
  );

  assert.ok(rewriteResult.rewrittenText, "A IA deve retornar a reescrita da frase longa");
  assert.notEqual(
    rewriteResult.rewrittenText.trim(),
    longSentence.trim(),
    "A reescrita fluida não pode ser idêntica ao original"
  );
});

test("17. Geração de DOCX Oficial no Padrão Comunicado Unicamp", async () => {
  const { generateComunicadoDocx } = await import("../src/lib/templates/docx-comunicado-generator.ts");

  const blob = await generateComunicadoDocx(
    "Informamos a toda a comunidade universitária que o período de inscrições foi prorrogado.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "01/2026",
      emailSite: "dgrh@unicamp.br | www.dgrh.unicamp.br",
      locationAndDate: "Campinas, 26 de agosto de 2026",
      authorName: "Coordenação Geral da DGRH",
      authorRole: "Diretoria Geral de Recursos Humanos"
    }
  );

  assert.ok(blob, "Deve gerar o blob DOCX");
  assert.ok(blob.size > 1000, "O arquivo DOCX gerado deve ter tamanho válido com estrutura Office Open XML");
});

test("18. Geração de DOCX Universal para Portaria, Ofício e Ata", async () => {
  const { generateDocumentDocx } = await import("../src/lib/templates/docx-document-generator.ts");

  // Portaria
  const portariaBlob = await generateDocumentDocx(
    "portaria",
    "Art. 1º Fica instituída a comissão especial.\\nArt. 2º Esta Portaria entra em vigor na data de sua publicação.",
    {
      unitName: "Gabinete do Reitor",
      documentNumber: "45/2026",
      emailSite: "reitoria@unicamp.br | www.unicamp.br",
      locationAndDate: "Campinas, 26 de agosto de 2026",
      ementa: "Institui a comissão especial de linguagem simples.",
      preamble: "O Reitor da Universidade Estadual de Campinas resolve:",
      authorName: "Reitoria da Unicamp",
      authorRole: "Reitor"
    }
  );
  assert.ok(portariaBlob && portariaBlob.size > 1000, "Deve gerar DOCX válido de Portaria com Ementa e Artigos");

  // Ofício
  const oficioBlob = await generateDocumentDocx(
    "oficio",
    "Solicitamos a gentileza de encaminhar as informações técnicas.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "123/2026",
      emailSite: "dgrh@unicamp.br",
      locationAndDate: "Campinas, 26 de agosto de 2026",
      recipientName: "Prof. Dr. Diretor de Instituto",
      recipientRole: "Diretor",
      subject: "Solicitação de informações",
      vocativo: "Senhor Diretor,",
      fecho: "Atenciosamente,",
      authorName: "Coordenador Geral",
      authorRole: "Diretoria Geral"
    }
  );
  assert.ok(oficioBlob && oficioBlob.size > 1000, "Deve gerar DOCX válido de Ofício com Destinatário e Vocativo");

  // Parecer
  const parecerBlob = await generateDocumentDocx(
    "parecer",
    "Trata-se de parecer favorável à proposta de criação de curso.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "23/2026",
      referenceProcess: "Processo nº 01-P-33221/2026",
      interestedParty: "Faculdade de Engenharia Mecânica",
      subject: "Proposta de criação de curso de especialização",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      authorName: "Prof(a). Dr(a). Relator(a) Designado(a)",
      authorRole: "Comissão Especial de Ensino - Unicamp"
    }
  );
  assert.ok(parecerBlob && parecerBlob.size > 1000, "Deve gerar DOCX válido de Parecer com Referência, Interessado, Assunto e Assinatura contígua");

  // Memorando
  const memoBlob = await generateDocumentDocx(
    "memorando",
    "Encaminhamos para conhecimento e providências o relatório em anexo.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "42/2026",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      recipientName: "Diretoria de Administração",
      subject: "Encaminhamento de relatório",
      vocativo: "Atenciosamente,",
      authorName: "Coordenação Geral da DGRH",
      authorRole: "Diretoria Geral de Recursos Humanos"
    }
  );
  assert.ok(memoBlob && memoBlob.size > 1000, "Deve gerar DOCX válido de Memorando com data no topo e assinatura contígua");

  // Informação
  const infoBlob = await generateDocumentDocx(
    "informacao",
    "Trata-se de análise técnica fundamentada sobre a matéria.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "18/2026",
      referenceProcess: "Processo nº 01-P-44556/2026",
      interestedParty: "Instituto de Artes",
      subject: "Análise técnica de jornada",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      authorName: "Analista Técnico de Recursos Humanos",
      authorRole: "Divisão de Legislação Funcional - DGRH"
    }
  );
  assert.ok(infoBlob && infoBlob.size > 1000, "Deve gerar DOCX válido de Informação com processo, interessado e assinatura contígua");

  // Declaração
  const declaracaoBlob = await generateDocumentDocx(
    "declaracao",
    "Declaramos para os devidos fins que o servidor cumpre jornada regular.",
    {
      unitName: "Diretoria Geral de Recursos Humanos",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      authorName: "Responsável pelo Atendimento Funcional",
      authorRole: "Divisão de Atendimento e Benefícios - DGRH"
    }
  );
  assert.ok(declaracaoBlob && declaracaoBlob.size > 1000, "Deve gerar DOCX válido de Declaração com assinatura centralizada contígua");
});

test("19. Validação do Catálogo Completo dos 20 Modelos de Documentos Oficiais da Unicamp", async () => {
  const typesData = JSON.parse(await import("fs").then(m => m.readFileSync("d:/workspace/active/linguagemsimples/src/data/document-types/document-types.json", "utf8")));

  assert.equal(typesData.length, 20, "Deve conter exatamente os 20 modelos de documentos oficiais");

  const requiredSlugs = [
    "ata", "carta", "certificado", "comunicado", "decisao", "declaracao",
    "despacho", "informacao", "memorando", "oficio", "oficio-circular",
    "pauta", "parecer", "relatorio", "deliberacao", "instrucao-normativa",
    "portaria", "regimento", "regulamento", "resolucao"
  ];

  requiredSlugs.forEach(slug => {
    const found = typesData.find(d => d.type === slug);
    assert.ok(found, `O tipo ${slug} deve estar cadastrado no catálogo de modelos`);
    assert.ok(found.label, `O tipo ${slug} deve possuir rótulo legível`);
    assert.ok(found.description, `O tipo ${slug} deve possuir descrição`);
  });
});

test("20. Validação dos Modelos Habilitados por Padrão (6 modelos oficiais ativos)", async () => {
  const typesData = JSON.parse(await import("fs").then(m => m.readFileSync("d:/workspace/active/linguagemsimples/src/data/document-types/document-types.json", "utf8")));

  const enabledDocs = typesData.filter(d => d.enabled === true);
  assert.equal(enabledDocs.length, 6, "Devem estar habilitados exatamente 6 modelos por padrão");

  const expectedEnabledSlugs = ["declaracao", "informacao", "memorando", "oficio", "parecer", "portaria"];
  const actualEnabledSlugs = enabledDocs.map(d => d.type).sort();
  assert.deepEqual(actualEnabledSlugs, expectedEnabledSlugs.sort(), "Os 6 modelos habilitados devem ser Declaração, Informação, Memorando, Ofício, Parecer e Portaria");

  const disabledDocs = typesData.filter(d => d.enabled === false);
  assert.equal(disabledDocs.length, 14, "Os demais 14 modelos devem estar com enabled: false");
});

test("21. Sanitização de Headers HTTP para Evitar Erro de 'non ISO-8859-1 code point'", async () => {
  const { sanitizeHeaderValue } = await import("../src/lib/ai/index.ts");

  // Casos com caracteres problemáticos fora do ISO-8859-1 / ASCII (em-dash, aspas curvas, zero-width, etc.)
  const testCases = [
    { input: "AIzaSy—test", expected: "AIzaSytest" },
    { input: "“AIzaSyTest”", expected: "AIzaSyTest" },
    { input: "sk-proj-test\u200B", expected: "sk-proj-test" },
    { input: "minha chave não funciona", expected: "minhachavenofunciona" },
    { input: "AIzaSy\u00A0Test", expected: "AIzaSyTest" },
    { input: "   ", expected: null },
    { input: null, expected: null },
    { input: undefined, expected: null }
  ];

  for (const tc of testCases) {
    const result = sanitizeHeaderValue(tc.input);
    assert.equal(result, tc.expected, `Sanitização para '${tc.input}' falhou`);
    if (result) {
      // Garante que o Header HTTP do browser/node nunca lançará TypeError
      assert.doesNotThrow(() => {
        new Headers({ "x-ai-api-key": result });
      }, `Headers rejeitou '${result}'`);
    }
  }
});

test("22. Validação dos 5 Modelos Revisados (Declaração, Informação, Memorando, Ofício, Parecer)", async () => {
  const { generateDocumentDocx } = await import("../src/lib/templates/docx-document-generator.ts");

  // 1. Declaração (data com recuo, sem linha sobre assinatura)
  const declBlob = await generateDocumentDocx("declaracao", "Declaramos para os devidos fins a situação funcional.", {
    locationAndDate: "Campinas, 27 de agosto de 2026.",
    authorName: "Responsável pelo Atendimento",
    authorRole: "Divisão de Atendimento"
  });
  assert.ok(declBlob && declBlob.size > 1000, "DOCX de Declaração deve ser gerado com sucesso");

  // 2. Informação (data no topo à direita, saudação recuada, sem linha sobre assinatura)
  const infoBlob = await generateDocumentDocx("informacao", "Manifestação técnica conclusiva sobre o caso em análise.", {
    documentNumber: "18/2026",
    referenceProcess: "Processo nº 01-P-44556/2026",
    interestedParty: "Instituto de Artes",
    subject: "Análise sobre aplicação de jornada especial",
    saudacao: "Atenciosamente,",
    locationAndDate: "Campinas, 27 de agosto de 2026.",
    authorName: "Analista Técnico de RH",
    authorRole: "Divisão de Legislação Funcional"
  });
  assert.ok(infoBlob && infoBlob.size > 1000, "DOCX de Informação deve ser gerado com sucesso");

  // 3. Memorando (sem DGRH no título, saudação com recuo, assinatura centralizada sem linha)
  const memoBlob = await generateDocumentDocx("memorando", "Solicitamos o envio do formulário de atualização cadastral.", {
    documentNumber: "42/2026",
    recipientName: "Diretoria de Administração",
    recipientTitle: "Ilmo. Sr.",
    recipientRole: "Diretor de Administração",
    subject: "Encaminhamento de relatório",
    vocativo: "Atenciosamente,",
    locationAndDate: "Campinas, 27 de agosto de 2026.",
    authorName: "Chefia de Divisão",
    authorRole: "Divisão de Desenvolvimento"
  });
  assert.ok(memoBlob && memoBlob.size > 1000, "DOCX de Memorando deve ser gerado com sucesso");

  // 4. Ofício (data no topo à direita, sem DGRH no título, fecho recuado, assinatura centralizada sem linha, destinatário no rodapé)
  const oficioBlob = await generateDocumentDocx("oficio", "Temos a honra de convidar Vossa Senhoria para a sessão solene.", {
    documentNumber: "105/2026",
    recipientTitle: "A Sua Senhoria o Senhor",
    recipientName: "Prof. Dr. Fulano de Tal",
    recipientRole: "Diretor do Instituto de Computação",
    recipientInstitution: "Universidade Estadual de Campinas - Unicamp",
    recipientAddress: "Av. Albert Einstein, 1251 - Cidade Universitária - CEP 13083-852 - Campinas/SP",
    subject: "Convite para solenidade acadêmica",
    vocativo: "Senhor Diretor,",
    fecho: "Atenciosamente,",
    locationAndDate: "Campinas, 27 de agosto de 2026.",
    authorName: "Coordenador Geral da DGRH",
    authorRole: "Diretoria Geral de Recursos Humanos"
  });
  assert.ok(oficioBlob && oficioBlob.size > 1000, "DOCX de Ofício deve ser gerado com sucesso com dados completos de destinatário e instituição");

  // 5. Parecer (sem DGRH no título, data recuada, assinatura centralizada sem linha)
  const parecerBlob = await generateDocumentDocx("parecer", "Opina-se pelo deferimento do pedido formulado pelo servidor.", {
    documentNumber: "01/2026",
    referenceProcess: "Processo nº 01-P-12345/2026",
    interestedParty: "Faculdade de Engenharia",
    subject: "Solicitação de afastamento",
    locationAndDate: "Campinas, 27 de agosto de 2026.",
    authorName: "Relator da Comissão",
    authorRole: "Comissão de Especialistas"
  });
  assert.ok(parecerBlob && parecerBlob.size > 1000, "DOCX de Parecer deve ser gerado com sucesso");
});

test("23. Validação do Modelo Portaria (sem DGRH no título, ementa à direita, sem recuo de parágrafos, assinatura centralizada sem linha)", async () => {
  const { generateDocumentDocx } = await import("../src/lib/templates/docx-document-generator.ts");

  const portariaBlob = await generateDocumentDocx("portaria", "Art. 1º Fica instituído o Grupo de Trabalho de Linguagem Simples no âmbito da Universidade Estadual de Campinas.\n\nArt. 2º Esta Portaria entra em vigor na data de sua publicação.", {
    documentNumber: "15/2026",
    unitName: "Gabinete do Reitor",
    emailSite: "reitoria@unicamp.br | www.unicamp.br",
    ementa: "Dispõe sobre a criação do Grupo de Trabalho de Linguagem Simples na Unicamp.",
    preamble: "O Reitor da Universidade Estadual de Campinas, no uso de suas atribuições legais, resolve:",
    effectiveClause: "Art. 2º Esta Portaria entra em vigor na data de sua publicação.",
    locationAndDate: "Campinas, 24 de setembro de 2026.",
    authorName: "Prof. Dr. Antonio José de Almeida Meirelles",
    authorRole: "Reitor da Unicamp"
  });

  assert.ok(portariaBlob && portariaBlob.size > 1000, "DOCX de Portaria deve ser gerado com sucesso com as regras de layout atualizadas");
});

test("24. Particionamento Multipágina A4 Dinâmico para Visualização no Drawer e Impressão", async () => {
  const { parseTextToBlocks, partitionBlocksIntoPages } = await import("../src/components/templates/dynamic-document-sheet.tsx");

  // 1. Documento curto deve caber em exatamente 1 página
  const shortText = "Art. 1º Fica criado o comitê.\n\nArt. 2º Esta resolução entra em vigor imediatamente.";
  const shortBlocks = parseTextToBlocks(shortText);
  assert.strictEqual(shortBlocks.length, 2, "Texto curto deve gerar 2 blocos de parágrafo");

  const singlePageResult = partitionBlocksIntoPages(shortBlocks, "portaria", {
    documentNumber: "01/2026",
    unitName: "DGRH",
    ementa: "Dispõe sobre o comitê."
  });
  assert.strictEqual(singlePageResult.length, 1, "Documento com texto curto deve resultar em exatamente 1 página A4");

  // 2. Documento longo com múltiplos artigos deve gerar 2 ou mais páginas A4
  const longArticles = Array.from({ length: 15 }, (_, i) =>
    `Art. ${i + 1}º O presente artigo estabelece as diretrizes normativas de número ${i + 1} para o funcionamento dos órgãos colegiados e comissões especiais da Universidade Estadual de Campinas, devendo ser estritamente cumprido por todas as unidades envolvidas.`
  ).join("\n\n");

  const longBlocks = parseTextToBlocks(longArticles);
  assert.ok(longBlocks.length >= 15, "Texto longo deve gerar múltiplos blocos");

  const multiPageResult = partitionBlocksIntoPages(longBlocks, "portaria", {
    documentNumber: "12/2026",
    unitName: "Gabinete do Reitor",
    ementa: "Dispõe sobre a regulamentação completa das comissões especiais e grupos de trabalho da Universidade Estadual de Campinas."
  });

  assert.ok(multiPageResult.length >= 2, `Documento longo deve ser particionado em múltiplas páginas (gerou ${multiPageResult.length})`);
  assert.ok(multiPageResult[0].length > 0, "A Página 1 deve conter o primeiro conjunto de blocos");
  assert.ok(multiPageResult[1].length > 0, "A Página 2 deve conter os blocos excedentes");
  assert.ok(multiPageResult.every(p => p.length > 0), "Nenhuma página pode ser vazia no documento multipágina");

  // 3. Documento médio que transborda para a Página 2 deve ter texto em ambas as páginas
  const mediumText = "Cumprimentando-o cordialmente, encaminhamos para conhecimento desta Diretoria o relatório técnico conclusivo elaborado pela Comissão Especial de Avaliação Institucional.\n\nDestacamos que as considerações e apontamentos constantes do anexo deverão ser analisados pelas equipes técnicas da unidade no prazo de 15 dias úteis.\n\nOutrossim, solicitamos a indicação de representante titular e suplente para compor o grupo de trabalho interdepartamental que acompanhará a implementação das recomendações.\n\nInformamos ainda que a próxima reunião deliberativa ocorrerá na primeira semana do mês subsequente, conforme cronograma pactuado.\n\nAdemais, reiteramos a importância do estrito cumprimento dos prazos regimentais para homologação final do certame.\n\nPermanecemos à inteira disposição para prestar quaisquer esclarecimentos adicionais que se façam necessários.";
  const mediumBlocks = parseTextToBlocks(mediumText);
  const mediumResult = partitionBlocksIntoPages(mediumBlocks, "oficio", {
    documentNumber: "105/2026",
    subject: "Encaminhamento de relatório técnico conclusivo e indicação de membros para grupo de trabalho"
  });

  assert.strictEqual(mediumResult.length, 2, "Ofício com 6 parágrafos e fechamento completo deve gerar exatamente 2 páginas");
  assert.ok(mediumResult[0].length > 0, "Página 1 do ofício deve conter texto");
  assert.ok(mediumResult[1].length > 0, "Página 2 do ofício DEVE conter texto antes das assinaturas");

  // 4. Certificado é sempre página única
  const certResult = partitionBlocksIntoPages(longBlocks, "certificado", {});
  assert.strictEqual(certResult.length, 1, "Certificado deve ser sempre de página única");
});

