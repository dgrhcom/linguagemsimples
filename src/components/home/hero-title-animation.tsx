"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles } from "lucide-react";

type AnimationStage = "bureaucratic" | "analyzing" | "transforming" | "simplified";

interface HeroTitleAnimationProps {
  isIntro?: boolean;
  hasPlayed?: boolean;
  onIntroComplete?: () => void;
  onSkipIntro?: () => void;
}

export function HeroTitleAnimation({
  isIntro = false,
  hasPlayed = false,
  onIntroComplete,
  onSkipIntro,
}: HeroTitleAnimationProps) {
  const [stage, setStage] = useState<AnimationStage>(
    hasPlayed ? "simplified" : "bureaucratic"
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect accessibility preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      setStage("simplified");
      if (isIntro && onIntroComplete) {
        onIntroComplete();
      }
    }
  }, [isIntro, onIntroComplete]);

  // If already played, lock in simplified stage
  useEffect(() => {
    if (hasPlayed) {
      setStage("simplified");
    }
  }, [hasPlayed]);

  // Sequence timer logic during Intro or normal run
  useEffect(() => {
    if (prefersReducedMotion || hasPlayed) return;

    let timer: NodeJS.Timeout;

    if (stage === "bureaucratic") {
      // 1. Initial prolix sentence visible for 2.2s
      timer = setTimeout(() => {
        setStage("analyzing");
      }, 2200);
    } else if (stage === "analyzing") {
      // 2. Highlighting prolix terms for 2.2s
      timer = setTimeout(() => {
        setStage("transforming");
      }, 2200);
    } else if (stage === "transforming") {
      // 3. Strikethrough effect for 1.4s
      timer = setTimeout(() => {
        setStage("simplified");
      }, 1400);
    } else if (stage === "simplified") {
      // 4. Simplified headline displays for 1.2s before finishing intro
      if (isIntro && onIntroComplete) {
        timer = setTimeout(() => {
          onIntroComplete();
        }, 1200);
      }
    }

    return () => clearTimeout(timer);
  }, [stage, prefersReducedMotion, hasPlayed, isIntro, onIntroComplete]);

  if (prefersReducedMotion || hasPlayed) {
    return (
      <div className="relative flex flex-col items-center justify-center select-none cursor-default">
        <h1 className="font-sans font-bold text-[32px] sm:text-[46px] md:text-[54px] lg:text-[60px] leading-[1.15] tracking-[-0.12px] text-slate-dark text-center">
          Avalie e simplifique seu texto
        </h1>
      </div>
    );
  }

  const isBureaucratic = stage === "bureaucratic";
  const isAnalyzing = stage === "analyzing";
  const isTransforming = stage === "transforming";
  const isSimplified = stage === "simplified";

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none cursor-default"
      onClick={isIntro ? onSkipIntro : undefined}
    >
      <h1 className="sr-only">Avalie e simplifique seu texto</h1>

      {/* Container with dynamic responsive height during intro vs standard */}
      <div
        aria-hidden="true"
        className={`relative w-full flex items-center justify-center transition-all duration-500 ${
          isIntro
            ? "min-h-[160px] sm:min-h-[200px] md:min-h-[240px] max-w-5xl"
            : "h-[135px] sm:h-[150px] md:h-[170px]"
        }`}
      >
        {/* VERSION 1: Bureaucratic / Analyzing / Transforming */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-2 transition-all duration-600 ease-out ${
            isSimplified
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
        >
          <p
            className={`w-full text-center font-sans leading-[1.25] tracking-[-0.08px] text-slate-dark transition-all duration-300 ${
              isIntro
                ? "text-[32px] sm:text-[48px] md:text-[60px] lg:text-[72px]"
                : "text-[26px] sm:text-[36px] md:text-[44px] lg:text-[50px]"
            }`}
          >
            {/* Term 1 */}
            <span
              className={`transition-all duration-300 ${
                isAnalyzing
                  ? "bg-[#d97757]/15 text-[#c6613f] font-medium px-2 py-0.5 rounded-[8px] border-b-2 border-dashed border-[#d97757]"
                  : isTransforming
                  ? "line-through decoration-[#d97757] decoration-2 text-cloud-medium opacity-50"
                  : "text-slate-dark/90 font-medium"
              }`}
            >
              Proceda à avaliação
            </span>

            <span className="text-slate-dark/70 font-normal"> e </span>

            {/* Term 2 */}
            <span
              className={`transition-all duration-300 ${
                isAnalyzing
                  ? "bg-[#d97757]/15 text-[#c6613f] font-medium px-2 py-0.5 rounded-[8px] border-b-2 border-dashed border-[#d97757]"
                  : isTransforming
                  ? "line-through decoration-[#d97757] decoration-2 text-cloud-medium opacity-50"
                  : "text-slate-dark/90 font-medium"
              }`}
            >
              promova a simplificação de
            </span>

            <span className="text-slate-dark/90 font-medium"> seu texto</span>
          </p>
        </div>

        {/* VERSION 2: Simplified Headline */}
        <div
          className={`absolute inset-0 flex items-center justify-center px-2 transition-all duration-600 ease-out ${
            isSimplified
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <p
            className={`w-full text-center font-sans font-bold text-slate-dark transition-all duration-500 ${
              isIntro
                ? "text-[40px] sm:text-[58px] md:text-[72px] lg:text-[84px] leading-[1.1] tracking-[-0.03em]"
                : "text-[32px] sm:text-[46px] md:text-[54px] lg:text-[60px] leading-[1.15] tracking-[-0.12px]"
            }`}
          >
            Avalie e simplifique seu texto
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-center gap-2.5 h-9">
        {isBureaucratic && (
          <span className="text-[13px] sm:text-[14px] font-sans text-cloud-medium animate-in fade-in duration-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone animate-pulse" />
            <span>Redação institucional prolixa</span>
          </span>
        )}

        {isAnalyzing && (
          <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <span className="text-[12px] sm:text-[13px] font-sans font-semibold bg-[#f5e3c7] text-[#c6613f] border border-[#d97757]/40 px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-ping" />
              Locução verbal
            </span>
            <span className="text-[12px] sm:text-[13px] font-sans font-semibold bg-[#f5e3c7] text-[#c6613f] border border-[#d97757]/40 px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-ping" />
              Verbosidade
            </span>
          </div>
        )}

        {isTransforming && (
          <span className="text-[13px] sm:text-[14px] font-sans text-[#d97757] font-semibold animate-in fade-in duration-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d97757] animate-spin" />
            <span>Aplicando regras de Linguagem Simples...</span>
          </span>
        )}

        {isSimplified && (
          <div className="flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-400">
            <span className="text-[13px] sm:text-[14px] font-sans font-semibold text-slate-dark bg-[#e3dacc]/70 border border-stone px-3 py-1 rounded-full flex items-center gap-2">
              <Check className="w-4 h-4 text-[#d97757] stroke-[3]" />
              <span>Direto ao ponto</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
