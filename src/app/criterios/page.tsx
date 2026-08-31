import rulesData from "@/data/rules/rules-unicamp.json";
import { ExternalLink } from "lucide-react";

export default function CriteriosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Critérios e Regras de Avaliação
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Catálogo estruturado de todas as regras e princípios catalogados a partir do Projeto de Linguagem Simples e Inclusiva da Unicamp.
        </p>
      </div>

      <div className="space-y-6">
        {rulesData.map((rule) => (
          <div key={rule.id} className="rounded-[24px] p-6 sm:p-7 space-y-4 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <span className="text-[10px] px-2.5 py-1 rounded-[8px] mr-2" style={{ backgroundColor: "#141413", color: "#d97757" }}>
                  {rule.category}
                </span>
                <span className="text-[10px] font-mono" style={{ color: "#b0aea5" }}>
                  ID: {rule.id}
                </span>
                <h2 className="text-[20px] mt-1" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
                  {rule.title}
                </h2>
              </div>

              {rule.source && (
                <a
                  href={rule.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-[14px] shrink-0 flex items-center gap-1"
                  style={{ color: "#141413" }}
                >
                  <span>Fonte: {rule.source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 inline" style={{ color: "#d97757" }} />
                </a>
              )}
            </div>

            <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              {rule.description}
            </p>

            <div className="rounded-[12px] p-4 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8", color: "#141413" }}>
              <strong className="block font-semibold mb-0.5" style={{ fontFamily: "var(--font-anthropic-sans)" }}>Recomendação Prática:</strong>
              {rule.recommendation}
            </div>

            {rule.examples && rule.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] block" style={{ color: "#b0aea5" }}>
                  Exemplo de Aplicação:
                </span>
                {rule.examples.map((ex, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-[24px] text-[14px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
                    <div>
                      <span className="font-semibold block mb-1" style={{ color: "#b0aea5" }}>❌ Antes (Evitar):</span>
                      <p className="font-mono p-2.5 rounded-[12px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}>{ex.before}</p>
                    </div>
                    <div>
                      <span className="font-semibold block mb-1" style={{ color: "#141413" }}>✅ Depois (Linguagem Simples):</span>
                      <p className="font-semibold p-2.5 rounded-[12px] whitespace-pre-wrap" style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", border: "1px solid rgba(217, 119, 87, 0.4)", color: "#141413" }}>{ex.after}</p>
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
