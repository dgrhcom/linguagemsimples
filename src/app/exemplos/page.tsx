import Link from "next/link";
import casosUnicampData from "@/data/examples/casos-unicamp.json";
import { Sparkles, ArrowRight, BookOpen, Check } from "lucide-react";

export default function ExemplosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-section space-y-section">
      <div className="text-center space-y-3">
        <h1 className="font-display text-heading sm:text-heading-lg text-ink">
          Exemplos Práticos: Antes e Depois
        </h1>
        <p className="text-body text-charcoal max-w-2xl mx-auto leading-relaxed">
          Casos reais catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp, demonstrando como transformar textos burocráticos em comunicações claras.
        </p>
      </div>

      <div className="space-y-8">
        {casosUnicampData.map((caso) => (
          <div key={caso.id} className="bg-paper rounded-card border border-sand p-6 sm:p-8 space-y-6 hover:border-amber/40 transition-all">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-sand pb-4">
              <div>
                <span className="text-micro-label text-stone px-2.5 py-1 rounded-btn bg-ink text-amber">
                  {caso.tipoDocumento}
                </span>
                <h2 className="text-subheading font-display text-ink mt-2">
                  {caso.titulo}
                </h2>
              </div>
              <span className="text-body-sm text-stone">
                Público-alvo: <strong className="text-ink">{caso.publicoAlvo}</strong>
              </span>
            </div>

            {/* Comparação Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-micro-label text-stone">
                  <span>❌ Texto Original</span>
                </div>
                <div className="bg-sand/30 border border-sand p-4 rounded-card text-body-sm text-charcoal font-mono leading-relaxed">
                  {caso.textoOriginal}
                </div>
              </div>

              {/* Depois */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-micro-label text-ink">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>✅ Versão em Linguagem Simples</span>
                </div>
                <div className="bg-amber/10 border border-amber/40 p-4 rounded-card text-body-sm text-ink font-semibold whitespace-pre-wrap leading-relaxed">
                  {caso.textoSimplificado}
                </div>
              </div>
            </div>

            {/* Problemas identificados */}
            <div className="bg-sand/30 p-5 rounded-card border border-sand space-y-2">
              <span className="text-body-sm font-semibold text-ink block">
                Problemas Identificados no Texto Original:
              </span>
              <ul className="list-disc list-inside text-body-sm text-charcoal space-y-1">
                {caso.problemasIdentificados.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>

            <div className="text-body-sm text-charcoal leading-relaxed border-t border-sand pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p>
                <strong className="text-ink">Por que melhorou?</strong> {caso.explicacao}
              </p>
              <span className="text-micro-label text-stone shrink-0">
                Fonte: {caso.fonte}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
