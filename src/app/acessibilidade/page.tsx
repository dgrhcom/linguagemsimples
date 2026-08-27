import { Eye, Type, Keyboard, CheckCircle2 } from "lucide-react";

export default function AcessibilidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-section space-y-section">
      <div className="text-center space-y-3">
        <h1 className="font-display text-heading sm:text-heading-lg text-ink">
          Recursos de Acessibilidade
        </h1>
        <p className="text-body text-charcoal max-w-2xl mx-auto leading-relaxed">
          Nossa aplicação foi concebida para atender às diretrizes internacionais de acessibilidade digital (WCAG 2.1 nível AA e e-MAG).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-body font-display text-ink">Modo de Alto Contraste</h2>
          <p className="text-body-sm text-charcoal leading-relaxed">
            Permite alternar para uma paleta de alto contraste com fundo preto e tipografia amarela brilhante para facilitar a leitura por pessoas com baixa visão ou fotofobia.
          </p>
        </div>

        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-body font-display text-ink">Redimensionamento de Fontes</h2>
          <p className="text-body-sm text-charcoal leading-relaxed">
            A barra superior de acessibilidade permite aumentar (A+) ou diminuir (A-) o tamanho de todo o conteúdo textual sem quebrar o layout da página.
          </p>
        </div>

        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-body font-display text-ink">Navegação Total por Teclado</h2>
          <p className="text-body-sm text-charcoal leading-relaxed">
            Todos os botões, links, abas e formulários possuem anéis de foco visíveis e podem ser operados exclusivamente via teclado (Tab, Enter, Espaço e Setas).
          </p>
        </div>

        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-body font-display text-ink">Semântica e Leitores de Tela</h2>
          <p className="text-body-sm text-charcoal leading-relaxed">
            Estrutura HTML5 com títulos hierarquizados (h1, h2, h3), marcos de navegação (<code className="bg-sand/50 border border-sand px-1.5 py-0.5 rounded-btn text-ink font-semibold">main</code>, <code className="bg-sand/50 border border-sand px-1.5 py-0.5 rounded-btn text-ink font-semibold">nav</code>, <code className="bg-sand/50 border border-sand px-1.5 py-0.5 rounded-btn text-ink font-semibold">header</code>) e atributos ARIA para tecnologias assistivas.
          </p>
        </div>
      </div>
    </div>
  );
}
