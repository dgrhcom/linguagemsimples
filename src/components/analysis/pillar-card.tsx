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
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 transition-all shadow-xs hover:border-[#FBB040]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#18181b]">
              {pillar.title}
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {pillar.pillar}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-black tracking-tight">
            {pillar.score}
          </span>
          <span className="text-xs text-zinc-400 font-bold">/100</span>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-3 border border-zinc-200">
        <div
          className="h-full bg-[#FBB040] transition-all duration-500 rounded-full"
          style={{ width: `${Math.max(5, pillar.score)}%` }}
        />
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
        {pillar.summary}
      </p>
    </div>
  );
}
