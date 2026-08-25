"use client";

import { useState, useEffect } from "react";
import { Sparkles, Key, Check, X, Shield, Cpu, HelpCircle, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function SettingsModal({ isOpen, onClose, onSaved }: SettingsModalProps) {
  const [provider, setProvider] = useState<"gemini" | "openai" | "offline">("offline");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const storedGemini = localStorage.getItem("custom_gemini_api_key") || "";
      const storedOpenAI = localStorage.getItem("custom_openai_api_key") || "";
      const storedProvider = (localStorage.getItem("preferred_ai_provider") as any) || (storedGemini ? "gemini" : storedOpenAI ? "openai" : "offline");

      setGeminiKey(storedGemini);
      setOpenaiKey(storedOpenAI);
      setProvider(storedProvider);
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      localStorage.setItem("preferred_ai_provider", provider);
      if (geminiKey.trim()) {
        localStorage.setItem("custom_gemini_api_key", geminiKey.trim());
      } else {
        localStorage.removeItem("custom_gemini_api_key");
      }

      if (openaiKey.trim()) {
        localStorage.setItem("custom_openai_api_key", openaiKey.trim());
      } else {
        localStorage.removeItem("custom_openai_api_key");
      }

      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo do Modal */}
        <div className="px-6 py-4 bg-[#353c43] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold tracking-tight">Configurações de Inteligência Artificial</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Como funcionam os Provedores de IA?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-950">
              A ferramenta funciona <strong>100% offline</strong> utilizando o motor determinístico e dicionários oficiais da Unicamp. Para que modelos neurais generativos (LLMs) gerem reescritas contextuais livres e sugestões semânticas contínuas, você pode configurar uma chave de API gratuita do <strong>Google Gemini</strong> ou da <strong>OpenAI</strong>.
            </p>
          </div>

          {/* Seleção de Modo */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Selecione o Motor de IA:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "gemini"
                    ? "border-[#005a87] bg-sky-50/80 font-bold text-[#005a87] ring-1 ring-[#005a87]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-bold">Google Gemini</div>
                <div className="text-[10px] text-slate-500 font-normal">Recomendado (Grátis)</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider("openai")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "openai"
                    ? "border-[#005a87] bg-sky-50/80 font-bold text-[#005a87] ring-1 ring-[#005a87]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-bold">OpenAI GPT</div>
                <div className="text-[10px] text-slate-500 font-normal">GPT-4o mini</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider("offline")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "offline"
                    ? "border-[#005a87] bg-sky-50/80 font-bold text-[#005a87] ring-1 ring-[#005a87]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-bold">Motor Unicamp</div>
                <div className="text-[10px] text-slate-500 font-normal">Offline / Local</div>
              </button>
            </div>
          </div>

          {/* Campo de Chave Gemini */}
          {provider === "gemini" && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800">Chave de API do Google Gemini:</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#005a87] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Obter chave gratuita</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Ex: AIzaSy..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#005a87] focus:ring-1 focus:ring-[#005a87] outline-hidden"
              />
              <span className="text-[10px] text-slate-500 block">
                Sua chave fica salva apenas na sessão do seu navegador (localStorage) e nunca é armazenada em banco de dados.
              </span>
            </div>
          )}

          {/* Campo de Chave OpenAI */}
          {provider === "openai" && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800">Chave de API da OpenAI:</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#005a87] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Obter na OpenAI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Ex: sk-proj-..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#005a87] focus:ring-1 focus:ring-[#005a87] outline-hidden"
              />
            </div>
          )}

          {/* Modo Offline */}
          {provider === "offline" && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs leading-relaxed">
              O modo offline utiliza o motor baseado nos 4 dicionários estruturados da Unicamp, realizando todas as substituições de termos arcaicos, chavões, quebra de frases longas e linguagem não-sexista sem necessidade de internet.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {savedSuccess ? "Configurações salvas!" : "As alterações têm efeito imediato."}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="text-xs font-bold bg-[#c2383f] hover:bg-[#a7282e] text-white px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{savedSuccess ? "Salvo!" : "Salvar Configuração"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
