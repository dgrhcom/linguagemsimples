import rulesData from "@/data/rules/rules-unicamp.json";
import { CheckCircle2, ExternalLink, BookOpen, AlertTriangle } from "lucide-react";

export default function CriteriosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-section space-y-section">
      <div className="text-center space-y-3">
        <h1 className="font-display text-heading sm:text-heading-lg text-ink">
          Critérios e Regras de Avaliação
        </h1>
        <p className="text-body text-charcoal max-w-2xl mx-auto leading-relaxed">
          Catálogo estruturado de todas as regras e princípios catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp.
        </p>
      </div>

      <div className="space-y-6">
        {rulesData.map((rule) => (
          <div key={rule.id} className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-4 hover:border-amber/40 transition-all">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <span className="text-micro-label text-stone px-2.5 py-1 rounded-btn bg-ink text-amber mr-2">
                  {rule.category}
                </span>
                <span className="text-micro-label text-stone font-mono">
                  ID: {rule.id}
                </span>
                <h2 className="text-body font-display text-ink mt-1">
                  {rule.title}
                </h2>
              </div>

              {rule.source && (
                <a
                  href={rule.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-body-sm text-ink shrink-0"
                >
                  <span>Fonte: {rule.source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber inline ml-1" />
                </a>
              )}
            </div>

            <p className="text-body-sm text-charcoal leading-relaxed">
              {rule.description}
            </p>

            <div className="bg-sand/30 border border-sand rounded-tile p-4 text-body-sm text-ink leading-relaxed">
              <strong className="block text-ink font-semibold mb-0.5">Recomendação Prática:</strong>
              {rule.recommendation}
            </div>

            {rule.examples && rule.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-micro-label text-stone block">
                  Exemplo de Aplicação:
                </span>
                {rule.examples.map((ex, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sand/30 p-4 rounded-card border border-sand text-body-sm">
                    <div>
                      <span className="text-stone font-semibold block mb-1">❌ Antes (Evitar):</span>
                      <p className="text-charcoal font-mono bg-paper p-2.5 rounded-tile border border-sand">{ex.before}</p>
                    </div>
                    <div>
                      <span className="text-ink font-semibold block mb-1">✅ Depois (Linguagem Simples):</span>
                      <p className="text-ink font-semibold bg-amber/10 border border-amber/40 p-2.5 rounded-tile whitespace-pre-wrap">{ex.after}</p>
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
