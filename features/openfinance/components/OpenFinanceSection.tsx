"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  buscarStatusConsentimento,
  definirConsentimento,
  sincronizarOpenFinance,
  type StatusConsentimentoDto,
} from "@/features/openfinance/api";

export function OpenFinanceSection() {
  const [status, setStatus] = useState<StatusConsentimentoDto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagemSincronizacao, setMensagemSincronizacao] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resposta = await buscarStatusConsentimento();
      if (!cancelado && resposta.sucesso && resposta.dados) {
        setStatus(resposta.dados);
      }
      if (!cancelado) setCarregando(false);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function alternarConsentimento() {
    if (!status) return;
    setAtualizando(true);
    try {
      const resposta = await definirConsentimento(!status.consentido);
      if (resposta.sucesso && resposta.dados) setStatus(resposta.dados);
    } finally {
      setAtualizando(false);
    }
  }

  async function handleSincronizar() {
    setMensagemSincronizacao(null);
    const resposta = await sincronizarOpenFinance();
    setMensagemSincronizacao(
      resposta.sucesso ? "Sincronização concluída." : (resposta.erro?.mensagem ?? "Não foi possível sincronizar."),
    );
  }

  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-graphite-700">Open Finance</h2>
      <p className="mt-1 text-xs text-graphite-400">
        Conecte bancos automaticamente via Open Finance. Nenhum dado é sincronizado sem o seu consentimento explícito, e
        nenhuma instituição está conectada neste ambiente ainda.
      </p>

      {carregando ? (
        <div className="mt-4 h-10 animate-pulse rounded-lg bg-graphite-100" />
      ) : (
        status && (
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex items-center justify-between rounded-lg bg-graphite-50 px-4 py-3">
              <span className="text-sm text-graphite-700">
                Consentimento para sincronização{" "}
                {status.consentido ? (
                  <span className="font-medium text-success-600">concedido</span>
                ) : (
                  <span className="font-medium text-graphite-500">não concedido</span>
                )}
              </span>
              <input
                type="checkbox"
                role="switch"
                aria-checked={status.consentido}
                checked={status.consentido}
                onChange={alternarConsentimento}
                disabled={atualizando}
                className="h-5 w-9 cursor-pointer accent-navy-600"
              />
            </label>

            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleSincronizar}>
                Sincronizar agora
              </Button>
              {mensagemSincronizacao && <p className="text-xs text-graphite-500">{mensagemSincronizacao}</p>}
            </div>
          </div>
        )
      )}
    </div>
  );
}
