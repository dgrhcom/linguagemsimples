import { PillarScore } from "@/types/score";
import { Search, Lightbulb, CheckCircle2 } from "lucide-react";

interface PillarCardProps {
  pillar: PillarScore;
}

export function PillarCard({ pillar }: PillarCardProps) {
  const isEncontrar = pillar.pillar === "encontrar";
  const isCompreender = pillar.pillar === "compreender";

  const Icon = isEncontrar ? Search : isCompreender ? Lightbulb : CheckCircle2;

  const colorStyles = isEncontrar
    ? { border: "border-sky-200", bg: "bg-sky-50/60", iconBg: "bg-sky-500 text-white", text: "text-sky-900", progress: "bg-sky-500" }
    : isCompreender
    ? { border: "border-indigo-200", bg: "bg-indigo-50/60", iconBg: "bg-indigo-500 text-white", text: "text-indigo-900", progress: "bg-indigo-500" }
    : { border: "border-emerald-200", bg: "bg-emerald-50/60", iconBg: "bg-emerald-500 text-white", text: "text-emerald-900", progress: "bg-emerald-500" };

  return (
    <div className={`rounded-2xl border ${colorStyles.border} ${colorStyles.bg} p-5 transition-all shadow-xs`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colorStyles.iconBg} flex items-center justify-center shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${colorStyles.text}`}>
              {pillar.title}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              {pillar.pillar}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {pillar.score}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/100</span>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${colorStyles.progress} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.max(5, pillar.score)}%` }}
        />
      </div>

      <p className="text-xs text-slate-700 leading-relaxed">
        {pillar.summary}
      </p>
    </div>
  );
}
