"use client";

import { useState, useEffect } from "react";
import { Sparkles, Key, Check, X, Shield, Cpu, HelpCircle, ExternalLink } from "lucide-react";
import { safeStorage } from "@/lib/storage";


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
      const storedGemini = safeStorage.getItem("custom_gemini_api_key") || "";
      const storedOpenAI = safeStorage.getItem("custom_openai_api_key") || "";
      const storedProvider = (safeStorage.getItem("preferred_ai_provider") as any) || (storedGemini ? "gemini" : storedOpenAI ? "openai" : "offline");

      setGeminiKey(storedGemini);
      setOpenaiKey(storedOpenAI);
      setProvider(storedProvider);
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      let finalProvider = provider;
      if (geminiKey.trim() && provider === "offline") {
        finalProvider = "gemini";
      } else if (openaiKey.trim() && provider === "offline") {
        finalProvider = "openai";
      }

      safeStorage.setItem("preferred_ai_provider", finalProvider);
      if (geminiKey.trim()) {
        safeStorage.setItem("custom_gemini_api_key", geminiKey.trim());
      } else {
        safeStorage.removeItem("custom_gemini_api_key");
      }

      if (openaiKey.trim()) {
        safeStorage.setItem("custom_openai_api_key", openaiKey.trim());
      } else {
        safeStorage.removeItem("custom_openai_api_key");
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo do Modal */}
        <div className="px-6 py-4 bg-[#18181b] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#FBB040]" />
            <h3 className="text-sm font-black tracking-tight">Configurações de Inteligência Artificial</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5 text-xs text-zinc-700 bg-[#faf9f5]">
          <div className="bg-[#fef7eb] border border-[#FBB040]/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#FBB040]" />
              <span>Como funcionam os Provedores de IA?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-800">
              A ferramenta funciona <strong>100% offline</strong> utilizando o motor determinístico e dicionários oficiais da Unicamp. Para que modelos neurais generativos (LLMs) gerem reescritas contextuais livres e sugestões semânticas contínuas, você pode configurar uma chave de API gratuita do <strong>Google Gemini</strong> ou da <strong>OpenAI</strong>.
            </p>
          </div>

          {/* Seleção de Modo */}
          <div className="space-y-2">
            <label className="font-bold text-zinc-900 block">Selecione o Motor de IA:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "gemini"
                    ? "border-[#FBB040] bg-white font-bold text-black ring-2 ring-[#FBB040]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <div className="font-bold">Google Gemini</div>
                <div className="text-[10px] text-zinc-500 font-normal">Recomendado (Grátis)</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider("openai")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "openai"
                    ? "border-[#FBB040] bg-white font-bold text-black ring-2 ring-[#FBB040]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <div className="font-bold">OpenAI GPT</div>
                <div className="text-[10px] text-zinc-500 font-normal">GPT-4o mini</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider("offline")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === "offline"
                    ? "border-[#FBB040] bg-white font-bold text-black ring-2 ring-[#FBB040]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <div className="font-bold">Motor Unicamp</div>
                <div className="text-[10px] text-zinc-500 font-normal">Offline / Local</div>
              </button>
            </div>
          </div>

          {/* Campo de Chave Gemini */}
          {provider === "gemini" && (
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-zinc-900">Chave de API do Google Gemini:</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-black hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Obter chave gratuita</span>
                  <ExternalLink className="w-3 h-3 text-[#FBB040]" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Ex: AIzaSy..."
                className="w-full bg-[#faf9f5] border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#FBB040] focus:ring-1 focus:ring-[#FBB040] outline-hidden"
              />
              <span className="text-[10px] text-zinc-500 block">
                Sua chave fica salva apenas na sessão do seu navegador (localStorage) e nunca é armazenada em servidor.
              </span>
            </div>
          )}

          {/* Campo de Chave OpenAI */}
          {provider === "openai" && (
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-zinc-900">Chave de API da OpenAI:</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-black hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Obter na OpenAI</span>
                  <ExternalLink className="w-3 h-3 text-[#FBB040]" />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Ex: sk-proj-..."
                className="w-full bg-[#faf9f5] border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#FBB040] focus:ring-1 focus:ring-[#FBB040] outline-hidden"
              />
            </div>
          )}

          {/* Modo Offline */}
          {provider === "offline" && (
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-zinc-600 text-xs leading-relaxed">
              O modo offline utiliza o motor baseado nos 4 dicionários estruturados da Unicamp, realizando todas as substituições de termos arcaicos, chavões, quebra de frases longas e linguagem não-sexista sem necessidade de internet.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-white px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {savedSuccess ? "Configurações salvas!" : "As alterações têm efeito imediato."}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-zinc-600 hover:text-black px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="text-xs font-black bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all border border-[#d98a1a]"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-black" /> : null}
              <span>{savedSuccess ? "Salvo!" : "Salvar Configuração"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
