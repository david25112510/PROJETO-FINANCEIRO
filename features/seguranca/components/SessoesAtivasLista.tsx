"use client";

import { useEffect, useState } from "react";
import { listarSessoes, revogarSessao, type SessaoDto } from "@/features/seguranca/api";
import { formatarData } from "@/lib/format";

function nomeDispositivo(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo desconhecido";
  if (/mobile/i.test(userAgent)) return "Dispositivo móvel";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Navegador";
}

export function SessoesAtivasLista() {
  const [sessoes, setSessoes] = useState<SessaoDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "erro" | "sucesso">("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarSessoes();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setSessoes(resposta.dados);
        setEstado("sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [refreshKey]);

  async function handleRevogar(id: string) {
    await revogarSessao(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-graphite-700">Sessões ativas</h2>
      <p className="mt-1 text-xs text-graphite-400">Dispositivos com acesso à sua conta neste momento.</p>

      <div className="mt-4 flex flex-col gap-2">
        {estado === "carregando" &&
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-graphite-50" />)}

        {estado === "erro" && (
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar as sessões.
          </p>
        )}

        {estado === "sucesso" &&
          sessoes.map((sessao) => (
            <div key={sessao.id} className="flex items-center justify-between rounded-lg bg-graphite-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-graphite-800">
                  {nomeDispositivo(sessao.userAgent)}
                  {sessao.atual && <span className="ml-2 text-xs font-normal text-success-600">(esta sessão)</span>}
                </p>
                <p className="text-xs text-graphite-400">
                  {sessao.ipAddress ?? "IP desconhecido"} · desde {formatarData(sessao.createdAt)}
                </p>
              </div>
              {!sessao.atual && (
                <button
                  type="button"
                  onClick={() => handleRevogar(sessao.id)}
                  className="text-sm text-danger-600 hover:underline"
                >
                  Encerrar
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
