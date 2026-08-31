import { BookOpen, ExternalLink, Award, HeartHandshake } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Sobre o Projeto
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Conheça a origem do movimento de Linguagem Simples na Universidade Estadual de Campinas e a motivação para a criação desta ferramenta aberta.
        </p>
      </div>

      <div className="space-y-6 text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
        <div className="rounded-[24px] p-8 space-y-4 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
          <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
            <BookOpen className="w-5 h-5" style={{ color: "#d97757" }} />
            <span>O Projeto na Unicamp</span>
          </h2>
          <p>
            O <strong>Projeto Linguagem Simples e Inclusiva da Unicamp</strong> foi instituído pela Coordenadoria Geral da Universidade (CGU) por meio da <em>Portaria CGU-01/2023</em>, com o objetivo de tornar as comunicações públicas da universidade mais claras, compreensíveis, acessíveis e não discriminatórias.
          </p>
          <p>
            Em parceria com a Escola de Educação Corporativa (Educorp) e especialistas da instituição, o Grupo de Trabalho elaborou manuais de redação oficial, guias práticos de atos administrativos e normativos, além de recomendações para mensagens eletrônicas e comunicação em redes.
          </p>
          <div className="pt-2">
            <a
              href="https://linguagemsimples.unicamp.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-link text-[14px] inline-flex items-center gap-1"
              style={{ color: "#141413" }}
            >
              <span>Acessar o portal oficial da Unicamp</span>
              <ExternalLink className="w-3.5 h-3.5 inline" style={{ color: "#d97757" }} />
            </a>
          </div>
        </div>

        <div className="rounded-[24px] p-8 space-y-4 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
          <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
            <Award className="w-5 h-5" style={{ color: "#d97757" }} />
            <span>O Papel Desta Ferramenta Digital</span>
          </h2>
          <p>
            Esta plataforma web foi desenvolvida para <strong>transformar o conhecimento teórico e metodológico acumulado no portal da Unicamp em um motor interativo de avaliação</strong>.
          </p>
          <p>
            A proposta vai além de um simples corretor automático: a ferramenta ensina quem escreve, apresenta a justificativa de cada problema encontrado, sugere termos substitutos fundamentados e permite exportar versões em conformidade com as normas oficiais da administração pública brasileira.
          </p>
        </div>

        <div className="rounded-[24px] p-8 space-y-4" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
          <h2 className="text-[24px] leading-[1.3] tracking-[-0.05px] flex items-center gap-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
            <HeartHandshake className="w-5 h-5" style={{ color: "#d97757" }} />
            <span>Princípios Inegociáveis</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-[14px]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
            <li><strong>Preservação do Significado:</strong> Simplificar não é empobrecer nem omitir regras ou leis essenciais.</li>
            <li><strong>Linguagem Não-Sexista e Inclusiva:</strong> Reconhecer a diversidade de todas as pessoas sem discriminação.</li>
            <li><strong>Transparência Total:</strong> Diferenciação clara entre regras oficiais da Unicamp, sugestões linguísticas e apoio de IA.</li>
            <li><strong>Privacidade Absoluta:</strong> Nenhum texto do usuário é retido em servidores ou utilizado para treino.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
