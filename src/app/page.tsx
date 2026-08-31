"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextEditor } from "@/components/editor/text-editor";
import { AnalysisInput } from "@/types/analysis";
import { Search, Lightbulb, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import casosUnicampData from "@/data/examples/casos-unicamp.json";

export default function HomePage() {
  const router = useRouter();

  const handleAnalyze = (input: AnalysisInput) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pending_analysis", JSON.stringify(input));
    }
    router.push("/analisar");
  };

  return (
    <div className="space-y-[80px] pb-[120px]">
      {/* ==========================================================================
          HERO — Editorial masthead on Ivory Medium canvas
          ========================================================================== */}
      <section className="pt-[120px] pb-[80px] border-b border-stone">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            {/* Micro-label */}
            <span className="editorial-label block">
              Projeto Linguagem Simples e Inclusiva da Unicamp
            </span>

            {/* Masthead Display Heading */}
            <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px] text-slate-dark">
              Avalie e simplifique seu texto
            </h1>

            <p className="text-[20px] leading-[1.4] text-slate-dark max-w-xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
              Descubra se sua comunicação está clara, inclusiva e fácil de entender — e veja como transformar seus textos aplicando os princípios de Linguagem Simples.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <TextEditor onAnalyze={handleAnalyze} isLoading={false} />
          </div>
        </div>
      </section>

      {/* ==========================================================================
          OS TRÊS PILARES — Feature split section
          ========================================================================== */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="editorial-label block">Metodologia Oficial</span>
          <h2 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px] text-slate-dark">
            Seu texto está fácil de encontrar, compreender e usar?
          </h2>
          <p className="text-[20px] leading-[1.4] text-slate-dark" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
            A metodologia oficial da Unicamp orienta que toda comunicação pública deve permitir que o leitor atinja seu objetivo na primeira leitura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "1",
              title: "Encontrar",
              desc: "A pessoa consegue localizar rapidamente a informação que procura? Avalia títulos, subtítulos, tópicos com marcadores e hierarquia das informações.",
              Icon: Search,
            },
            {
              num: "2",
              title: "Compreender",
              desc: "A pessoa entende o conteúdo na primeira leitura? Avalia frases curtas (≤ 20 palavras), ordem direta, eliminação de verbosidade, jargões e siglas sem explicação.",
              Icon: Lightbulb,
            },
            {
              num: "3",
              title: "Usar",
              desc: "Depois de ler, a pessoa consegue agir? Avalia instruções passo a passo, prazos, formas de tratamento oficiais e linguagem não-sexista.",
              Icon: CheckCircle2,
            },
          ].map((pillar) => (
            <div
              key={pillar.num}
              className="bg-ivory-light border border-stone rounded-[24px] p-8 space-y-4 hover:border-cloud-dark transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-sans text-cloud-medium">{pillar.num}.</span>
                <pillar.Icon className="w-5 h-5 text-clay" />
              </div>
              <h3 className="text-[24px] leading-[1.3] tracking-[-0.05px] text-slate-dark" style={{ fontFamily: "var(--font-anthropic-serif)" }}>{pillar.title}</h3>
              <p className="text-[16px] leading-[1] tracking-[-0.08px] text-slate-dark" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          EXEMPLOS — Before/After showcase
          ========================================================================== */}
      <section className="py-[80px] border-y border-stone">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="editorial-label block mb-2">Exemplos Oficiais</span>
              <h2 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px] text-slate-dark">
                Veja a transformação na prática
              </h2>
            </div>
            <Link
              href="/exemplos"
              className="ghost-link text-[16px] tracking-[-0.08px] font-sans text-slate-dark flex items-center gap-1.5"
            >
              <span>Ver todos os exemplos</span>
              <ArrowRight className="w-4 h-4 text-clay" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {casosUnicampData.slice(0, 2).map((ex) => (
              <div key={ex.id} className="bg-ivory-light border border-stone rounded-[24px] p-8 space-y-5">
                <h3 className="text-[24px] leading-[1.3] tracking-[-0.05px] text-slate-dark" style={{ fontFamily: "var(--font-anthropic-serif)" }}>{ex.titulo}</h3>

                <div className="space-y-2">
                  <span className="text-[12px] font-sans text-cloud-medium block">Antes</span>
                  <div className="bg-oat-warm/50 border border-stone p-4 rounded-[12px] text-[16px] tracking-[-0.08px] text-slate-dark font-mono leading-relaxed">
                    {ex.textoOriginal}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[12px] font-sans text-cloud-medium block">Depois</span>
                  <div className="bg-manilla border border-clay/30 p-4 rounded-[12px] text-[16px] tracking-[-0.08px] text-slate-dark font-semibold leading-relaxed">
                    {ex.textoSimplificado}
                  </div>
                </div>

                <p className="text-[16px] tracking-[-0.08px] text-slate-dark leading-relaxed border-t border-stone pt-4" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
                  <strong className="text-slate-dark">Por que melhorou?</strong> {ex.explicacao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          PRIVACIDADE — Slate Dark inverted section
          ========================================================================== */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="bg-slate-dark rounded-[24px] p-10 sm:p-14 relative overflow-hidden border border-slate-medium">
          <div className="max-w-2xl space-y-5 relative z-10">
            <span className="text-[12px] font-sans text-clay tracking-caption block">
              Privacidade e Soberania
            </span>
            <h2 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px] text-ivory-light">
              Uma ferramenta pública, transparente e segura
            </h2>
            <p className="text-[20px] leading-[1.4] text-cloud-medium" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
              Não armazenamos seus textos. Todas as análises são processadas sob demanda e validadas semanticamente para garantir que obrigações, prazos e referências legais sejam sempre preservados.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/como-funciona"
                className="text-[16px] tracking-[-0.08px] font-sans text-ivory-light border-b border-cloud-medium hover:border-ivory-light pb-px transition-colors"
              >
                Entenda como analisamos
              </Link>
              <Link
                href="/criterios"
                className="text-[16px] tracking-[-0.08px] font-sans text-cloud-medium border-b border-slate-medium hover:border-cloud-medium pb-px transition-colors"
              >
                Consultar catálogo de regras
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
