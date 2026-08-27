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
    <div className="space-y-section-lg pb-section-lg">
      {/* ==========================================================================
          HERO — Editorial masthead on Paper Cream canvas
          ========================================================================== */}
      <section className="pt-section pb-section border-b border-sand">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            {/* Micro-label */}
            <span className="editorial-label block">
              Projeto Linguagem Simples e Inclusiva da Unicamp
            </span>

            {/* Masthead Display Heading */}
            <h1 className="font-display text-heading sm:text-heading-lg lg:text-display text-ink leading-[0.92] tracking-editorial">
              Avalie e simplifique seu texto
            </h1>

            <p className="text-body text-charcoal leading-relaxed max-w-xl mx-auto">
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
      <section className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="editorial-label block">Metodologia Oficial</span>
          <h2 className="font-display text-heading sm:text-heading-sm text-ink">
            Seu texto está fácil de encontrar, compreender e usar?
          </h2>
          <p className="text-body text-charcoal leading-relaxed">
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
              className="bg-paper border border-sand rounded-card p-8 space-y-4 hover:border-deep-stone transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-micro-label font-sans text-stone">{pillar.num}.</span>
                <pillar.Icon className="w-5 h-5 text-amber" />
              </div>
              <h3 className="font-display text-subheading text-ink">{pillar.title}</h3>
              <p className="text-body-sm text-charcoal leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          EXEMPLOS — Before/After showcase
          ========================================================================== */}
      <section className="py-section border-y border-sand">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="editorial-label block mb-2">Exemplos Oficiais</span>
              <h2 className="font-display text-heading sm:text-heading-sm text-ink">
                Veja a transformação na prática
              </h2>
            </div>
            <Link
              href="/exemplos"
              className="ghost-link text-body-sm font-sans text-charcoal flex items-center gap-1.5"
            >
              <span>Ver todos os exemplos</span>
              <ArrowRight className="w-4 h-4 text-amber" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {casosUnicampData.slice(0, 2).map((ex) => (
              <div key={ex.id} className="bg-paper border border-sand rounded-card p-8 space-y-5">
                <h3 className="font-display text-subheading text-ink">{ex.titulo}</h3>

                <div className="space-y-2">
                  <span className="text-micro-label font-sans text-stone block">Antes</span>
                  <div className="bg-sand/50 border border-sand p-4 rounded-tile text-body-sm text-charcoal font-mono leading-relaxed">
                    {ex.textoOriginal}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-micro-label font-sans text-stone block">Depois</span>
                  <div className="bg-paper-light border border-amber/30 p-4 rounded-tile text-body-sm text-ink font-semibold leading-relaxed">
                    {ex.textoSimplificado}
                  </div>
                </div>

                <p className="text-body-sm text-charcoal leading-relaxed border-t border-sand pt-4">
                  <strong className="text-ink">Por que melhorou?</strong> {ex.explicacao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          PRIVACIDADE — Ink Field inverted section
          ========================================================================== */}
      <section className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="bg-ink rounded-card p-10 sm:p-14 relative overflow-hidden border border-slate">
          <div className="max-w-2xl space-y-5 relative z-10">
            <span className="text-micro-label font-sans text-amber tracking-micro block">
              Privacidade e Soberania
            </span>
            <h2 className="font-display text-heading sm:text-heading-sm text-paper">
              Uma ferramenta pública, transparente e segura
            </h2>
            <p className="text-body text-stone leading-relaxed">
              Não armazenamos seus textos. Todas as análises são processadas sob demanda e validadas semanticamente para garantir que obrigações, prazos e referências legais sejam sempre preservados.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/como-funciona"
                className="text-body-sm font-sans text-paper border-b border-stone hover:border-paper pb-px transition-colors"
              >
                Entenda como analisamos
              </Link>
              <Link
                href="/criterios"
                className="text-body-sm font-sans text-stone border-b border-slate hover:border-stone pb-px transition-colors"
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
