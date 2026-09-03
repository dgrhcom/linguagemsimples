"use client";

import React, { useState, useEffect } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";

type AnimationStage = "bureaucratic" | "analyzing" | "transforming" | "simplified";

export function HeroTitleAnimation() {
  const [stage, setStage] = useState<AnimationStage>("bureaucratic");
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detecta preferência de acessibilidade para redução de movimento
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setStage("simplified");
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setPrefersReducedMotion(true);
        setStage("simplified");
      } else {
        setPrefersReducedMotion(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Orquestração temporal das etapas
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    let timer: NodeJS.Timeout;

    if (stage === "bureaucratic") {
      // 1. Frase burocrática inicial visível por 2.8s
      timer = setTimeout(() => {
        setStage("analyzing");
      }, 2800);
    } else if (stage === "analyzing") {
      // 2. Diagnóstico com termos destacados visível por 2.6s
      timer = setTimeout(() => {
        setStage("transforming");
      }, 2600);
    } else if (stage === "transforming") {
      // 3. Efeito de corte/simplificação por 1.4s
      timer = setTimeout(() => {
        setStage("simplified");
      }, 1400);
    } else if (stage === "simplified") {
      // 4. Frase simplificada final exibida por 7.5s antes de reiniciar suavemente
      timer = setTimeout(() => {
        setStage("bureaucratic");
      }, 7500);
    }

    return () => clearTimeout(timer);
  }, [stage, isPaused, prefersReducedMotion]);

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStage("bureaucratic");
  };

  // Renderização acessível caso o usuário prefira movimento reduzido
  if (prefersReducedMotion) {
    return (
      <h1 className="font-sans text-[32px] sm:text-[44px] md:text-[52px] lg:text-[58px] leading-[1.15] tracking-[-0.12px] text-slate-dark text-center font-bold">
        Avalie e simplifique seu texto
      </h1>
    );
  }

  const isBureaucratic = stage === "bureaucratic";
  const isAnalyzing = stage === "analyzing";
  const isTransforming = stage === "transforming";
  const isSimplified = stage === "simplified";

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none cursor-default group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      title="Passe o mouse para pausar a demonstração"
    >
      {/* Título semântico para SEO e leitores de tela */}
      <h1 className="sr-only">Avalie e simplifique seu texto</h1>

      {/* Container com altura estável (elimina 100% de layout shift) */}
      <div
        aria-hidden="true"
        className="relative w-full h-[135px] sm:h-[150px] md:h-[170px] flex items-center justify-center"
      >
        {/* VERSÃO 1: Frase Burocrática / Diagnóstico / Transformação (Texto Contínuo Natural) */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-2 transition-all duration-600 ease-out ${
            isSimplified
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
        >
          <p className="w-full text-center font-sans text-[26px] sm:text-[36px] md:text-[44px] lg:text-[50px] leading-[1.25] tracking-[-0.08px] text-slate-dark transition-colors duration-300">
            {/* Termo 1 */}
            <span
              className={`transition-all duration-300 ${
                isAnalyzing
                  ? "bg-[#d97757]/15 text-[#c6613f] font-medium px-2 py-0.5 rounded-[6px] border-b-2 border-dashed border-[#d97757]"
                  : isTransforming
                  ? "line-through decoration-[#d97757] decoration-2 text-cloud-medium opacity-50"
                  : "text-slate-dark/90 font-medium"
              }`}
            >
              Proceda à avaliação
            </span>

            {/* Conector 'e' em fluxo natural de texto */}
            <span className="text-slate-dark/70 font-normal"> e </span>

            {/* Termo 2 */}
            <span
              className={`transition-all duration-300 ${
                isAnalyzing
                  ? "bg-[#d97757]/15 text-[#c6613f] font-medium px-2 py-0.5 rounded-[6px] border-b-2 border-dashed border-[#d97757]"
                  : isTransforming
                  ? "line-through decoration-[#d97757] decoration-2 text-cloud-medium opacity-50"
                  : "text-slate-dark/90 font-medium"
              }`}
            >
              promova a simplificação de
            </span>

            {/* Final da frase em fluxo natural */}
            <span className="text-slate-dark/90 font-medium"> seu texto</span>
          </p>
        </div>

        {/* VERSÃO 2: Frase Simplificada Final Oficial (Manchete Límpida e Direta) */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-2 transition-all duration-600 ease-out ${
            isSimplified
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <p className="w-full text-center font-sans font-bold text-[32px] sm:text-[46px] md:text-[54px] lg:text-[60px] leading-[1.15] tracking-[-0.12px] text-slate-dark">
            Avalie e simplifique seu texto
          </p>
        </div>
      </div>

      {/* Barra de Status e Feedback Educativo */}
      <div className="mt-3 flex items-center justify-center gap-2.5 h-8">
        {isBureaucratic && (
          <span className="text-[12px] font-sans text-cloud-medium animate-in fade-in duration-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone animate-pulse" />
            <span>Redação institucional prolixa</span>
          </span>
        )}

        {isAnalyzing && (
          <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <span className="text-[11px] font-sans font-semibold bg-[#f5e3c7] text-[#c6613f] border border-[#d97757]/40 px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-ping" />
              Locução verbal
            </span>
            <span className="text-[11px] font-sans font-semibold bg-[#f5e3c7] text-[#c6613f] border border-[#d97757]/40 px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-ping" />
              Verbosidade
            </span>
          </div>
        )}

        {isTransforming && (
          <span className="text-[12px] font-sans text-[#d97757] font-semibold animate-in fade-in duration-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#d97757] animate-spin" />
            <span>Aplicando regras de Linguagem Simples...</span>
          </span>
        )}

        {isSimplified && (
          <div className="flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-400">
            <span className="text-[12px] font-sans font-semibold text-slate-dark bg-[#e3dacc]/60 border border-stone px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#d97757] stroke-[3]" />
              <span>Direto ao ponto</span>
            </span>

            <button
              type="button"
              onClick={handleRestart}
              className="text-[11px] font-sans text-cloud-medium hover:text-slate-dark flex items-center gap-1 transition-colors px-2 py-0.5 rounded-[6px] hover:bg-oat-warm/40"
              title="Ver demonstração da transformação novamente"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Ver novamente</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
