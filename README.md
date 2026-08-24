# Assistente de Linguagem Simples e Inclusiva 🇧🇷

> **Ferramenta pública de avaliação, análise e adequação de textos à Linguagem Simples e Inclusiva**, tomando como principal fonte de conhecimento as diretrizes e manuais do [Projeto Linguagem Simples e Inclusiva da Unicamp](https://linguagemsimples.unicamp.br/).

---

## 🎯 Conceito Central: "Encontrar, Compreender e Usar"

A aplicação foi projetada sob o princípio fundamental de que **a comunicação pública deve permitir que qualquer pessoa encontre, compreenda e consiga agir sobre a informação na primeira leitura**:

1. **🔍 Encontrar**: A pessoa localiza rapidamente o que procura? (Estrutura, títulos, subtítulos, listas com marcadores, hierarquia).
2. **💡 Compreender**: A pessoa entende na primeira leitura? (Frases $\le 20$ palavras, ordem direta, eliminação de verbosidade, jargões, arcaísmos e siglas obscuras).
3. **🎯 Usar**: A pessoa sabe o que fazer a seguir? (Instruções acionáveis, prazos, formas de tratamento oficiais e linguagem inclusiva).

---

## ✨ Funcionalidades Principais

* **Motor Híbrido de Avaliação**:
  * **Análise Determinística Local**: Varredura instantânea de regras objetivas (frases $> 20$ palavras, expressões de verbosidade, fórmulas obsoletas como `DD.` e `Ilmo.`, erros na grafia de horas e unidades, pronomes de tratamento e termos excludentes).
  * **Inteligência Contextual e Reescrita**: Avaliação semântica por IA adaptada ao público-alvo e objetivo do texto.
* **Preservação Semântica Rigorosa**:
  * Validação automática para garantir que datas, valores, prazos, leis e obrigações não sejam perdidos na versão simplificada.
* **Ensino e Fundamentação Pedagógica**:
  * Botão *"Por que isso importa?"* em cada apontamento, com citação explícita das diretrizes oficiais da Unicamp.
* **Comparação Antes / Depois**:
  * Visualização lado a lado e unificada, permitindo aceitar sugestões individualmente ou em lote.
* **Exportação Multiformato**:
  * Exportação nos formatos **DOCX (Word)**, **PDF (Impressão diagramada)**, **Markdown (.md)**, **HTML (.html)** e **TXT Puro**.
* **Acessibilidade Plena (WCAG AA)**:
  * Modo de Alto Contraste (amarelo sobre preto), redimensionamento dinâmico de fontes ($A- / A / A+$), foco visível para teclado e semântica completa para leitores de tela.
* **Privacidade Absoluta**:
  * Sem armazenamento em banco de dados; textos processados sob demanda e descartados após a requisição.

---

## 🏗️ Arquitetura do Projeto

```
linguagemsimples/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Página inicial com Hero e Editor de Acesso Rápido
│   │   ├── layout.tsx                  # Layout raiz acessível com barra superior
│   │   ├── globals.css                 # Estilos Tailwind e variáveis de alto contraste
│   │   ├── analisar/page.tsx           # Painel completo de análise e revisão interativa
│   │   ├── como-funciona/page.tsx      # Guia explicativo e transparência de IA
│   │   ├── criterios/page.tsx          # Catálogo público de regras com links da Unicamp
│   │   ├── exemplos/page.tsx           # Casos reais Antes/Depois da Unicamp
│   │   ├── sobre/page.tsx              # História e fundamentação do projeto
│   │   ├── acessibilidade/page.tsx     # Declaração e recursos de acessibilidade
│   │   ├── privacidade/page.tsx        # Política de não-retenção e transparência
│   │   └── api/
│   │       ├── analyze/route.ts        # Endpoint POST /api/analyze
│   │       ├── rewrite/route.ts        # Endpoint POST /api/rewrite
│   │       └── explain/route.ts        # Endpoint POST /api/explain
│   ├── components/
│   │   ├── layout/                     # Header, Footer e Barra de Acessibilidade
│   │   ├── editor/                     # Editor de texto, upload e carga de exemplos
│   │   ├── analysis/                   # Score geral, medidores dos 3 pilares e 8 dimensões
│   │   ├── findings/                   # Cards de problemas, texto marcado e filtros
│   │   ├── comparison/                 # Visualizador de comparação Antes/Depois
│   │   ├── report/                     # Visualização do relatório diagramado
│   │   └── export/                     # Modal de download nos múltiplos formatos
│   ├── lib/
│   │   ├── ai/                         # Provedores de IA desacoplados (Gemini, OpenAI, Mock)
│   │   ├── analysis/                   # Motores determinísticos, métricas e score
│   │   └── exporters/                  # Geradores de TXT, MD, HTML e DOCX
│   ├── data/
│   │   ├── rules/                      # Regras estruturadas da Unicamp (JSON)
│   │   ├── terminology/                # Dicionários de verbosidade, chavões e inclusão
│   │   ├── document-types/             # Metadados de documentos administrativos e normativos
│   │   └── examples/                   # Casos oficiais Antes/Depois
│   └── types/                          # Interfaces TypeScript estritas
├── tests/
│   └── run-tests.mjs                   # Suíte de testes unitários automatizados
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
* Node.js 18+ (recomendado Node.js 20+)
* npm

### Passo a passo
1. Clone o repositório ou acesse o diretório do projeto:
```bash
cd linguagemsimples
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure as variáveis de ambiente em um arquivo `.env.local`:
```bash
cp .env.example .env.local
```
> *Nota: Se nenhuma chave de IA externa for informada, o assistente funcionará normalmente utilizando seu motor determinístico e mock pedagógico offline.*

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

5. Para gerar a build de produção:
```bash
npm run build
npm start
```

---

## 🧪 Testes Automatizados

Para executar os testes de validação dos dicionários, métricas de frases e regras:
```bash
node tests/run-tests.mjs
```

---

## 📚 Como Adicionar Novos Termos ou Regras

A base de conhecimento da aplicação é desacoplada do código-fonte:

1. **Novos termos arcaicos ou rebuscados**: Edite `src/data/terminology/verbosidade.json`.
2. **Novos chavões ou fechos burocráticos**: Edite `src/data/terminology/chavoes.json`.
3. **Novas regras de linguagem inclusiva**: Edite `src/data/terminology/linguagem-nao-sexista.json`.
4. **Novos termos discriminatórios/pejorativos**: Edite `src/data/terminology/termos-nao-ofensivos.json`.
5. **Novos tipos de documentos**: Edite `src/data/document-types/document-types.json`.

---

## 🤝 Créditos e Fontes

* Conteúdo metodológico: **Grupo de Trabalho de Linguagem Simples e Inclusiva da Unicamp** ([linguagemsimples.unicamp.br](https://linguagemsimples.unicamp.br/)).
* Normas complementares: Manual de Redação da Presidência da República (3ª edição, 2018) e ABNT NBR 6023.
