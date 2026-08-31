import Link from "next/link";
import { ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer id="main-footer" className="bg-slate-dark text-cloud-medium text-sm mt-auto border-t border-slate-medium no-print">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dgrh.svg"
                alt="Linguagem Simples Unicamp"
                className="h-7 w-auto object-contain brightness-0 invert opacity-90"
              />
            </div>

            <p className="text-cloud-medium text-xs leading-relaxed max-w-md">
              Uma ferramenta pública de apoio à redação oficial para transformar a comunicação em uma experiência clara, direta e acessível, fundamentada nas diretrizes do <strong className="text-ivory-light">Projeto Linguagem Simples e Inclusiva da Unicamp</strong>.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-clay">
              <span>Privacidade garantida: seus textos não são armazenados.</span>
            </div>
          </div>

          <div>
            <h4 className="text-ivory-light font-sans text-caption uppercase tracking-caption mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/analisar" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Avaliar Texto
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/criterios" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Critérios e Regras
                </Link>
              </li>
              <li>
                <Link href="/exemplos" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Exemplos Antes/Depois
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-ivory-light font-sans text-caption uppercase tracking-caption mb-4">Metodologia Unicamp</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://linguagemsimples.unicamp.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-clay hover:text-ivory-light transition-colors"
                >
                  <span>Portal Oficial Unicamp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/acessibilidade" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Acessibilidade (WCAG AA)
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Privacidade e Transparência
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-cloud-medium hover:text-ivory-light transition-colors">
                  Sobre o Projeto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-medium mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-cloud-medium gap-4">
          <p>
            Universidade Estadual de Campinas • Coordenadoria Geral da Universidade (CGU) & Educorp
          </p>
          <p className="flex items-center gap-1.5">
            <span>Comunicação simples para todas e todos</span>
            <Heart className="w-3.5 h-3.5 text-clay" />
          </p>
        </div>
      </div>
    </footer>
  );
}
