import Link from "next/link";
import casosUnicampData from "@/data/examples/casos-unicamp.json";
import { Sparkles, ArrowRight, BookOpen, Check } from "lucide-react";

export default function ExemplosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Exemplos Práticos: Antes e Depois
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Casos reais catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp, demonstrando como transformar textos burocráticos em comunicações claras.
        </p>
      </div>

      <div className="space-y-8">
        {casosUnicampData.map((caso) => (
          <div key={caso.id} className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6 hover:border-[#FBB040] transition-all">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#18181b] text-[#FBB040]">
                  {caso.tipoDocumento}
                </span>
                <h2 className="text-lg font-black text-black mt-2">
                  {caso.titulo}
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                Público-alvo: <strong className="text-black">{caso.publicoAlvo}</strong>
              </span>
            </div>

            {/* Comparação Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  <span>❌ Texto Original</span>
                </div>
                <div className="bg-[#faf9f5] border border-zinc-200 p-4 rounded-2xl text-xs text-zinc-800 font-mono leading-relaxed">
                  {caso.textoOriginal}
                </div>
              </div>

              {/* Depois */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-black text-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBB040]" />
                  <span>✅ Versão em Linguagem Simples</span>
                </div>
                <div className="bg-[#fef7eb] border border-[#FBB040] p-4 rounded-2xl text-xs text-black font-bold whitespace-pre-wrap leading-relaxed">
                  {caso.textoSimplificado}
                </div>
              </div>
            </div>

            {/* Problemas identificados */}
            <div className="bg-[#faf9f5] p-5 rounded-2xl border border-zinc-200 space-y-2">
              <span className="text-xs font-black text-black block">
                Problemas Identificados no Texto Original:
              </span>
              <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1 font-medium">
                {caso.problemasIdentificados.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-zinc-700 leading-relaxed border-t border-zinc-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-medium">
              <p>
                <strong className="text-black">Por que melhorou?</strong> {caso.explicacao}
              </p>
              <span className="text-[11px] text-zinc-400 shrink-0">
                Fonte: {caso.fonte}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
