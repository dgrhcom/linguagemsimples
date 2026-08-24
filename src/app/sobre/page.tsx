import Link from "next/link";
import { BookOpen, ExternalLink, Award, Users, HeartHandshake } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sobre o Projeto
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Conheça a origem do movimento de Linguagem Simples na Universidade Estadual de Campinas e a motivação para a criação desta ferramenta aberta.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
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
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs"
            >
              <span>Acessar o portal oficial da Unicamp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>O Papel Desta Ferramenta Digital</span>
          </h2>
          <p>
            Esta plataforma web foi desenvolvida para <strong>transformar o conhecimento teórico e metodológico acumulado no portal da Unicamp em um motor interativo de avaliação</strong>.
          </p>
          <p>
            A proposta vai além de um simples corretor automático: a ferramenta ensina quem escreve, apresenta a justificativa de cada problema encontrado, sugere termos substitutos fundamentados e permite exportar versões em conformidade com as normas oficiais da administração pública brasileira.
          </p>
        </div>

        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <span>Princípios Inegociáveis</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700">
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
