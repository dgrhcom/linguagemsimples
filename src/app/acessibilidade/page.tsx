import { Eye, Type, Keyboard, CheckCircle2 } from "lucide-react";

export default function AcessibilidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Recursos de Acessibilidade
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Nossa aplicação foi concebida para atender às diretrizes internacionais de acessibilidade digital (WCAG 2.1 nível AA e e-MAG).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Eye, title: "Modo de Alto Contraste", desc: "Permite alternar para uma paleta de alto contraste com fundo preto e tipografia amarela brilhante para facilitar a leitura por pessoas com baixa visão ou fotofobia." },
          { icon: Type, title: "Redimensionamento de Fontes", desc: "A barra superior de acessibilidade permite aumentar (A+) ou diminuir (A-) o tamanho de todo o conteúdo textual sem quebrar o layout da página." },
          { icon: Keyboard, title: "Navegação Total por Teclado", desc: "Todos os botões, links, abas e formulários possuem anéis de foco visíveis e podem ser operados exclusivamente via teclado (Tab, Enter, Espaço e Setas)." },
          { icon: CheckCircle2, title: "Semântica e Leitores de Tela", desc: "Estrutura HTML5 com títulos hierarquizados (h1, h2, h3), marcos de navegação (main, nav, header) e atributos ARIA para tecnologias assistivas." }
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] p-6 sm:p-7 space-y-3 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold" style={{ backgroundColor: "#141413", color: "#d97757" }}>
              <item.icon className="w-5 h-5" />
            </div>
            <h2 className="text-[20px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>{item.title}</h2>
            <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
