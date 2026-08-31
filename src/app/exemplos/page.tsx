import Link from "next/link";
import casosUnicampData from "@/data/examples/casos-unicamp.json";
import { Sparkles, BookOpen, Check } from "lucide-react";

export default function ExemplosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Exemplos Práticos: Antes e Depois
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Casos reais catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp, demonstrando como transformar textos burocráticos em comunicações claras.
        </p>
      </div>

      <div className="space-y-8">
        {casosUnicampData.map((caso) => (
          <div key={caso.id} className="rounded-[24px] p-6 sm:p-8 space-y-6 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
            <div className="flex flex-wrap justify-between items-center gap-2 pb-4" style={{ borderBottom: "1px solid #cccbc8" }}>
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-[8px]" style={{ backgroundColor: "#141413", color: "#d97757" }}>
                  {caso.tipoDocumento}
                </span>
                <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] mt-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
                  {caso.titulo}
                </h2>
              </div>
              <span className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
                Público-alvo: <strong style={{ color: "#141413" }}>{caso.publicoAlvo}</strong>
              </span>
            </div>

            {/* Comparação Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px]" style={{ color: "#b0aea5" }}>
                  <span>❌ Texto Original</span>
                </div>
                <div className="p-4 rounded-[24px] text-[14px] font-mono leading-relaxed" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8", color: "#141413" }}>
                  {caso.textoOriginal}
                </div>
              </div>

              {/* Depois */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px]" style={{ color: "#141413" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#d97757" }} />
                  <span>✅ Versão em Linguagem Simples</span>
                </div>
                <div className="p-4 rounded-[24px] text-[14px] font-semibold whitespace-pre-wrap leading-relaxed" style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", border: "1px solid rgba(217, 119, 87, 0.4)", color: "#141413" }}>
                  {caso.textoSimplificado}
                </div>
              </div>
            </div>

            {/* Problemas identificados */}
            <div className="p-5 rounded-[24px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <span className="text-[14px] font-semibold block" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>
                Problemas Identificados no Texto Original:
              </span>
              <ul className="list-disc list-inside text-[14px] space-y-1" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
                {caso.problemasIdentificados.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>

            <div className="text-[14px] leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" style={{ fontFamily: "var(--font-anthropic-serif)", borderTop: "1px solid #cccbc8", paddingTop: "16px" }}>
              <p style={{ color: "#141413" }}>
                <strong>Por que melhorou?</strong> {caso.explicacao}
              </p>
              <span className="text-[10px] shrink-0" style={{ color: "#b0aea5" }}>
                Fonte: {caso.fonte}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
