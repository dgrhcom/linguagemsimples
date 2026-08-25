import rulesData from "@/data/rules/rules-unicamp.json";
import { CheckCircle2, ExternalLink, BookOpen, AlertTriangle } from "lucide-react";

export default function CriteriosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Critérios e Regras de Avaliação
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Catálogo estruturado de todas as regras e princípios catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp.
        </p>
      </div>

      <div className="space-y-6">
        {rulesData.map((rule) => (
          <div key={rule.id} className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-4 hover:border-[#FBB040] transition-all">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#18181b] text-[#FBB040] mr-2">
                  {rule.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ID: {rule.id}
                </span>
                <h2 className="text-base sm:text-lg font-black text-black mt-1">
                  {rule.title}
                </h2>
              </div>

              {rule.source && (
                <a
                  href={rule.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-black font-bold hover:text-[#d98a1a] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Fonte: {rule.source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FBB040]" />
                </a>
              )}
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
              {rule.description}
            </p>

            <div className="bg-[#faf9f5] border border-zinc-200 rounded-2xl p-4 text-xs text-zinc-900 leading-relaxed font-medium">
              <strong className="block text-black font-bold mb-0.5">Recomendação Prática:</strong>
              {rule.recommendation}
            </div>

            {rule.examples && rule.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-black block">
                  Exemplo de Aplicação:
                </span>
                {rule.examples.map((ex, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#faf9f5] p-4 rounded-2xl border border-zinc-200 text-xs">
                    <div>
                      <span className="text-zinc-600 font-bold block mb-1">❌ Antes (Evitar):</span>
                      <p className="text-zinc-700 font-mono bg-white p-2.5 rounded-xl border border-zinc-200">{ex.before}</p>
                    </div>
                    <div>
                      <span className="text-black font-black block mb-1">✅ Depois (Linguagem Simples):</span>
                      <p className="text-black font-bold bg-[#fef7eb] border border-[#FBB040] p-2.5 rounded-xl whitespace-pre-wrap">{ex.after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
