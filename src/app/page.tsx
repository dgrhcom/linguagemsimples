"use client";

import Link from "next/link";
import { HeroTitleAnimation } from "@/components/home/hero-title-animation";
import { ArrowRight, BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-80px-240px)] flex flex-col justify-center items-center py-16 sm:py-24">
      <section className="w-full max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Micro-label */}
          <span className="editorial-label block">
            Projeto Linguagem Simples e Inclusiva da Unicamp
          </span>

          {/* Masthead Display Heading — Animação Didática de Simplificação */}
          <HeroTitleAnimation />

          {/* Subtítulo Descritivo */}
          <p
            className="text-[20px] sm:text-[22px] leading-[1.4] text-slate-dark max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-anthropic-serif)" }}
          >
            Descubra se sua comunicação está clara, inclusiva e fácil de entender — e veja como transformar seus textos aplicando os princípios de Linguagem Simples.
          </p>

          {/* Botões de Ação Principais */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analisar"
              className="w-full sm:w-auto bg-clay hover:bg-clay-deep text-ivory-light font-sans text-[16px] font-semibold px-8 py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 group"
            >
              <span>Avaliar texto</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/como-funciona"
              className="w-full sm:w-auto bg-ivory-light border border-stone hover:border-slate-dark text-slate-dark font-sans text-[16px] font-medium px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 group"
            >
              <BookOpen className="w-4 h-4 text-cloud-dark group-hover:text-slate-dark transition-colors" />
              <span>Como funciona</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
