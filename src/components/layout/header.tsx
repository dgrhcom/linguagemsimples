"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityBar } from "./accessibility-bar";
import { SettingsModal } from "./settings-modal";
import { Settings } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { href: "/analisar", label: "Avaliar Texto" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/criterios", label: "Critérios" },
    { href: "/exemplos", label: "Exemplos" },
    { href: "/sobre", label: "Sobre" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory-medium/95 backdrop-blur-sm border-b border-stone no-print">
        <AccessibilityBar />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-3">
            {/* Logotipo */}
            <Link href="/" className="flex items-center gap-3 group py-1 shrink-0" title="Página Inicial - Linguagem Simples Unicamp">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dgrh.svg"
                alt="Linguagem Simples - Unicamp"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Navegação Principal — micro-labels editoriais */}
            <nav id="main-nav" className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Menu principal">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 text-caption uppercase tracking-caption font-sans transition-colors ${
                      isActive
                        ? "text-slate-dark font-semibold border-l-[3px] border-clay pl-3"
                        : "text-cloud-medium hover:text-slate-dark hover:bg-oat-warm/40 rounded-[0px]"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-cloud-medium hover:text-slate-dark flex items-center gap-1.5 px-2.5 py-1.5 rounded-[0px] hover:bg-oat-warm/40 transition-colors"
                title="Configurações de IA"
                aria-label="Configurações de IA"
              >
                <Settings className="w-4 h-4" />
              </button>

              <Link
                href="/analisar"
                className="font-sans text-caption uppercase tracking-caption text-slate-dark hover:text-slate-dark border-b border-slate-dark hover:border-slate-dark pb-px transition-all"
              >
                Avaliar Texto
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
