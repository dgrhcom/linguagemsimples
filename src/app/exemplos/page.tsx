import Link from "next/link";
import casosUnicampData from "@/data/examples/casos-unicamp.json";
import { Sparkles, ArrowRight, BookOpen, Check } from "lucide-react";

export default function ExemplosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Exemplos Práticos: Antes e Depois
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Casos reais catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp, demonstrando como transformar textos burocráticos em comunicações claras.
        </p>
      </div>

      <div className="space-y-8">
        {casosUnicampData.map((caso) => (
          <div key={caso.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {caso.tipoDocumento}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {caso.titulo}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Público-alvo: <strong>{caso.publicoAlvo}</strong>
              </span>
            </div>

            {/* Comparação Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-bold text-rose-700 uppercase tracking-wider">
                  <span>❌ Texto Original</span>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl text-xs text-slate-800 font-mono leading-relaxed">
                  {caso.textoOriginal}
                </div>
              </div>

              {/* Depois */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✅ Versão em Linguagem Simples</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-xs text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                  {caso.textoSimplificado}
                </div>
              </div>
            </div>

            {/* Problemas identificados */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Problemas Identificados no Texto Original:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                {caso.problemasIdentificados.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p>
                <strong>Por que melhorou?</strong> {caso.explicacao}
              </p>
              <span className="text-[11px] text-slate-400 shrink-0">
                Fonte: {caso.fonte}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
