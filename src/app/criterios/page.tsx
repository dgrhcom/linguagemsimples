import rulesData from "@/data/rules/rules-unicamp.json";
import { CheckCircle2, ExternalLink, BookOpen, AlertTriangle } from "lucide-react";

export default function CriteriosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Critérios e Regras de Avaliação
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Catálogo estruturado de todas as regras e princípios catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp.
        </p>
      </div>

      <div className="space-y-6">
        {rulesData.map((rule) => (
          <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mr-2">
                  {rule.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {rule.id}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {rule.title}
                </h2>
              </div>

              {rule.source && (
                <a
                  href={rule.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Fonte: {rule.source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {rule.description}
            </p>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
              <strong className="block text-emerald-950 font-bold mb-0.5">Recomendação Prática:</strong>
              {rule.recommendation}
            </div>

            {rule.examples && rule.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Exemplo de Aplicação:
                </span>
                {rule.examples.map((ex, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-rose-700 font-bold block mb-1">❌ Antes (Evitar):</span>
                      <p className="text-slate-700 font-mono">{ex.before}</p>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-bold block mb-1">✅ Depois (Linguagem Simples):</span>
                      <p className="text-slate-900 font-medium whitespace-pre-wrap">{ex.after}</p>
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
