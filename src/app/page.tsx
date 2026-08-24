"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextEditor } from "@/components/editor/text-editor";
import { AnalysisInput } from "@/types/analysis";
import { Search, Lightbulb, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen, FileCheck, Layers } from "lucide-react";
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
    <div className="space-y-16 pb-16">
      {/* Seção Hero com Identidade Visual Unicamp */}
      <section className="bg-linear-to-b from-[#eaf2f8] via-[#f4f8fb] to-[#f6f9fc] pt-12 pb-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 bg-[#164e87]/10 text-[#164e87] text-xs font-bold px-4 py-1.5 rounded-full border border-[#164e87]/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#164e87]" />
              <span>Baseado no Projeto Linguagem Simples e Inclusiva da Unicamp</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Avalie e simplifique seu texto
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Descubra se sua comunicação está clara, inclusiva e fácil de entender — e veja como transformar seus textos aplicando os princípios de <strong>Linguagem Simples</strong>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <TextEditor onAnalyze={handleAnalyze} isLoading={false} />
          </div>
        </div>
      </section>

      {/* Os Três Pilares da Metodologia Unicamp */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Seu texto está fácil de encontrar, compreender e usar?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            A metodologia oficial da Unicamp orienta que toda comunicação pública deve permitir que o leitor atinja seu objetivo na primeira leitura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold shadow-xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Encontrar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A pessoa consegue localizar rapidamente a informação que procura? Avalia títulos, subtítulos, tópicos com marcadores e hierarquia das informações.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-xs">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Compreender</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A pessoa entende o conteúdo na primeira leitura? Avalia a regra de frases curtas (&le; 20 palavras), ordem direta, eliminação de verbosidade, jargões e siglas sem explicação.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs space-y-3 hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Usar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Depois de ler, a pessoa consegue agir? Avalia instruções passo a passo, prazos, formas de tratamento oficiais (sem DD./Ilmo.) e linguagem não-sexista.
            </p>
          </div>
        </div>
      </section>

      {/* Casos Práticos Antes/Depois da Unicamp */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-bold text-[#164e87] uppercase tracking-wider block mb-1">
                Exemplos Oficiais
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Veja a transformação na prática
              </h2>
            </div>
            <Link
              href="/exemplos"
              className="text-xs font-bold text-[#164e87] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Ver todos os exemplos catalogados</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {casosUnicampData.slice(0, 2).map((ex) => (
              <div key={ex.id} className="bg-slate-50/70 rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base">{ex.titulo}</h3>
                
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                    Antes (Texto Burocrático / Complexo)
                  </div>
                  <div className="bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl text-xs text-slate-800 font-mono">
                    {ex.textoOriginal}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Depois (Linguagem Simples)</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-xl text-xs text-slate-900 font-semibold whitespace-pre-wrap">
                    {ex.textoSimplificado}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                  <strong>Por que melhorou?</strong> {ex.explicacao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compromisso Ético e Privacidade */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#164e87] text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-sky-200 text-xs font-bold px-3.5 py-1 rounded-full border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacidade e Soberania</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Uma ferramenta pública, transparente e segura
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Não armazenamos seus textos. Todas as análises são processadas sob demanda e validadas semanticamente para garantir que obrigações, prazos e referências legais sejam sempre preservados.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/como-funciona"
                className="bg-white hover:bg-sky-50 text-[#164e87] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Entenda como analisamos
              </Link>
              <Link
                href="/criterios"
                className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors border border-white/20"
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
