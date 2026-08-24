"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityBar } from "./accessibility-bar";
import { BookOpen, CheckCircle2, Sparkles, HelpCircle, FileText, Info } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/analisar", label: "AVALIE SEU TEXTO", icon: Sparkles },
    { href: "/como-funciona", label: "COMO FUNCIONA", icon: HelpCircle },
    { href: "/criterios", label: "CRITÉRIOS E REGRAS", icon: CheckCircle2 },
    { href: "/exemplos", label: "EXEMPLOS ANTES/DEPOIS", icon: FileText },
    { href: "/sobre", label: "SOBRE O PROJETO", icon: Info }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dddee0] shadow-2xs no-print">
      <AccessibilityBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logotipo Unicamp LinguagemSimples */}
          <Link href="/" className="flex items-center gap-3.5 group py-2">
            <div className="w-11 h-11 rounded-xl bg-[#c2383f] flex items-center justify-center text-white font-black shadow-xs group-hover:bg-[#a7282e] transition-colors">
              <span className="text-xl font-black">LS</span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#1c2d42] tracking-tight leading-none">
                <span className="text-[#005a87]">Linguagem</span>
                <span className="text-[#c2383f]">Simples</span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">
                Universidade Estadual de Campinas
              </span>
            </div>
          </Link>

          {/* Navegação Principal Estilo Unicamp */}
          <nav id="main-nav" className="hidden lg:flex items-center gap-1" aria-label="Menu principal">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all relative ${
                    isActive
                      ? "text-[#c2383f] font-black after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[3px] after:bg-[#c2383f]"
                      : "text-slate-700 hover:text-[#005a87] hover:bg-slate-50 rounded-lg"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Botão de Destaque Avaliar Texto */}
          <div className="flex items-center gap-3">
            <Link
              href="/analisar"
              className="bg-[#c2383f] hover:bg-[#a7282e] text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Avaliar Texto</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
