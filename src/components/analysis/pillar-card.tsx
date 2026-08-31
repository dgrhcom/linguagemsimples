import { PillarScore } from "@/types/score";
import { Search, Lightbulb, CheckCircle2 } from "lucide-react";

interface PillarCardProps {
  pillar: PillarScore;
}

export function PillarCard({ pillar }: PillarCardProps) {
  const isEncontrar = pillar.pillar === "encontrar";
  const isCompreender = pillar.pillar === "compreender";

  const Icon = isEncontrar ? Search : isCompreender ? Lightbulb : CheckCircle2;

  return (
    <div className="rounded-[24px] p-5 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: "#141413", color: "#d97757" }}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px]" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>
              {pillar.title}
            </h3>
            <span className="text-[10px]" style={{ color: "#b0aea5" }}>
              {pillar.pillar}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[32px] leading-[1.25] tracking-[-0.05px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
            {pillar.score}
          </span>
          <span className="text-[10px]" style={{ color: "#b0aea5" }}>/100</span>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${Math.max(5, pillar.score)}%`, backgroundColor: "#d97757" }}
        />
      </div>

      <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
        {pillar.summary}
      </p>
    </div>
  );
}
