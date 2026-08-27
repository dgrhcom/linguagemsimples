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
    <div className="rounded-card border border-sand bg-paper p-5 transition-all hover:border-amber/40">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-body-sm text-ink">
              {pillar.title}
            </h3>
            <span className="text-micro-label text-stone">
              {pillar.pillar}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-heading-sm font-display text-ink tracking-tight">
            {pillar.score}
          </span>
          <span className="text-micro-label text-stone">/100</span>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <div className="w-full bg-sand/50 h-2 rounded-full overflow-hidden mb-3 border border-sand">
        <div
          className="h-full bg-amber transition-all duration-500 rounded-full"
          style={{ width: `${Math.max(5, pillar.score)}%` }}
        />
      </div>

      <p className="text-body-sm text-charcoal leading-relaxed">
        {pillar.summary}
      </p>
    </div>
  );
}
