import Link from "next/link";
import { BookOpen, Eye, ArrowRight } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Como funciona a ferramenta?
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Entenda como seu texto é analisado passo a passo e conheça o compromisso de transparência do nosso motor metodológico.
        </p>
      </div>

      {/* Passo a Passo */}
      <div className="space-y-6">
        <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
          <BookOpen className="w-5 h-5" style={{ color: "#d97757" }} />
          <span>O Ciclo de Avaliação em 6 Passos</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { num: "1", title: "Cole ou envie seu texto", desc: "Insira seu comunicado, e-mail, ofício, relatório ou texto geral na área de edição." },
            { num: "2", title: "Informe quem vai ler (Opcional)", desc: "Indicar o público-alvo e o objetivo ajuda a calibrar o nível de vocabulário e a avaliar se termos técnicos são adequados." },
            { num: "3", title: "A ferramenta analisa o conteúdo", desc: "O motor híbrido cruza regras determinísticas da Unicamp e inteligência contextual para identificar frases longas, jargões, arcaísmos e formas excludentes." },
            { num: "4", title: "Você entende os problemas", desc: "Cada apontamento explica por que o trecho precisa ser melhorado e cita a diretriz correspondente da Unicamp." },
            { num: "5", title: "Decida quais sugestões aceitar", desc: "Você tem total controle para aceitar uma sugestão, aplicar em lote ou editar manualmente." },
            { num: "6", title: "Exporte o resultado", desc: "Baixe a versão revisada ou o relatório completo em DOCX, PDF, Markdown, HTML ou TXT." }
          ].map((step) => (
            <div key={step.num} className="rounded-[24px] p-6 space-y-2" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
              <span className="w-7 h-7 rounded-[12px] font-bold text-[12px] flex items-center justify-center" style={{ backgroundColor: "#141413", color: "#d97757" }}>{step.num}</span>
              <h3 className="font-semibold text-[14px]" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>{step.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transparência e Uso da IA */}
      <div className="rounded-[24px] p-8 space-y-6" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
          <Eye className="w-5 h-5" style={{ color: "#d97757" }} />
          <span>Transparência: Como a Inteligência Artificial é Utilizada?</span>
        </h2>

        <div className="space-y-4 text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          <p>
            A inteligência artificial funciona como uma <strong>assistente de apoio à redação</strong>, e não como um substituto do julgamento humano.
          </p>

          <div className="p-5 rounded-[12px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
            <strong className="block font-semibold text-[14px]" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>1. Separação de Regras e IA:</strong>
            <p className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              Regras objetivas (contagem de palavras, frases &gt; 20 palavras, fórmulas obsoletas como &ldquo;DD./Ilmo.&rdquo;, grafia de horas e dicionários) são avaliadas por um motor determinístico rigoroso baseado na Unicamp. A IA é acionada apenas para interpretação contextual e reescrita fluida.
            </p>
          </div>

          <div className="p-5 rounded-[12px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
            <strong className="block font-semibold text-[14px]" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>2. Preservação Semântica e Não Reducionismo:</strong>
            <p className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              A simplificação nunca deve omitir obrigações, prazos, condições jurídicas, valores ou referências normativas. Nosso pipeline valida semanticamente se nenhum dado essencial foi alterado.
            </p>
          </div>

          <div className="p-5 rounded-[12px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
            <strong className="block font-semibold text-[14px]" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>3. Responsabilidade Final do Emissor:</strong>
            <p className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              Toda sugestão gerada pela ferramenta deve ser revisada por quem assina ou publica o documento antes da divulgação final.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/analisar"
          className="ghost-link text-[14px] font-semibold inline-flex items-center gap-2"
          style={{ color: "#141413" }}
        >
          <span>Experimentar Agora no Analisador</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
