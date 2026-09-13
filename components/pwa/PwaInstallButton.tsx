"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function InstallIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function estaInstalado() {
  const navegador = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navegador.standalone === true;
}

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(() => typeof window !== "undefined" && estaInstalado());
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [ios] = useState(() => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent));

  useEffect(() => {
    function guardarPrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    }

    function confirmarInstalacao() {
      setInstalado(true);
      setPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", guardarPrompt);
    window.addEventListener("appinstalled", confirmarInstalacao);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardarPrompt);
      window.removeEventListener("appinstalled", confirmarInstalacao);
    };
  }, []);

  if (instalado) return null;

  async function instalar() {
    if (!prompt) {
      setAjudaAberta(true);
      return;
    }
    await prompt.prompt();
    const escolha = await prompt.userChoice;
    if (escolha.outcome === "accepted") setInstalado(true);
    setPrompt(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={instalar}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-aqua-500/25 bg-aqua-50 px-3 text-sm font-semibold text-aqua-600 transition-colors hover:bg-aqua-500 hover:text-white"
        aria-label="Instalar FinanceOps como aplicativo"
      >
        <InstallIcon className="size-4" />
        <span className="hidden md:inline">Instalar app</span>
      </button>

      <Modal open={ajudaAberta} onClose={() => setAjudaAberta(false)} title="Instalar o FinanceOps" size="sm">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-600 p-5 text-white">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-aqua-500 text-lg font-bold shadow-lg">F</div>
            <h3 className="mt-4 text-lg font-semibold">FinanceOps na sua tela inicial</h3>
            <p className="mt-1 text-sm leading-6 text-navy-100">Abra com um toque, em tela cheia e com acesso seguro pelo seu aparelho.</p>
          </div>

          {ios ? (
            <ol className="flex flex-col gap-3 text-sm text-graphite-700">
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-aqua-50 font-semibold text-aqua-600">1</span><span>Abra esta página no <strong>Safari</strong>.</span></li>
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-aqua-50 font-semibold text-aqua-600">2</span><span>Toque em <strong>Compartilhar</strong> na barra do navegador.</span></li>
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-aqua-50 font-semibold text-aqua-600">3</span><span>Escolha <strong>Adicionar à Tela de Início</strong> e confirme.</span></li>
            </ol>
          ) : (
            <div className="flex flex-col gap-3 text-sm leading-6 text-graphite-700">
              <p>Abra o menu do navegador e escolha <strong>Instalar FinanceOps</strong> ou <strong>Adicionar à tela inicial</strong>.</p>
              <p className="rounded-xl bg-graphite-50 p-3 text-xs text-graphite-500">No computador, procure também o ícone de instalação no lado direito da barra de endereço. No Android, use Chrome ou Edge.</p>
            </div>
          )}

          <Button type="button" onClick={() => setAjudaAberta(false)} className="w-full">Entendi</Button>
        </div>
      </Modal>
    </>
  );
}
