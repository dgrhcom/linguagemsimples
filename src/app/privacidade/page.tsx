import { ShieldCheck, Lock, Database, EyeOff } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-section space-y-section">
      <div className="text-center space-y-3">
        <h1 className="font-display text-heading sm:text-heading-lg text-ink">
          Privacidade e Transparência de Dados
        </h1>
        <p className="text-body text-charcoal max-w-2xl mx-auto leading-relaxed">
          Como ferramenta pública voltada à cidadania e à administração pública, assumimos compromissos rígidos com a confidencialidade das suas informações.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-body font-display text-ink">Zero Armazenamento de Textos</h2>
          </div>
          <p className="text-body-sm text-charcoal leading-relaxed">
            Os textos submetidos para avaliação são processados exclusivamente na memória volátil durante a requisição e <strong className="text-ink">nunca são salvos em nenhum banco de dados ou disco</strong>.
          </p>
        </div>

        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-body font-display text-ink">Não Utilização para Treinamento de Modelos</h2>
          </div>
          <p className="text-body-sm text-charcoal leading-relaxed">
            Nenhuma informação pessoal, administrativa ou minuta institucional enviada através desta ferramenta é retida ou utilizada para treinar modelos de inteligência artificial de terceiros.
          </p>
        </div>

        <div className="bg-paper rounded-card border border-sand p-6 sm:p-7 space-y-3 hover:border-amber/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="text-body font-display text-ink">Não Exigência de Cadastro</h2>
          </div>
          <p className="text-body-sm text-charcoal leading-relaxed">
            A ferramenta é de acesso público, livre e anônimo, não exigindo criação de conta, login ou fornecimento de e-mail para realização de análises completas.
          </p>
        </div>
      </div>
    </div>
  );
}
