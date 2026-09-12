"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DividaFormModal } from "@/features/dividas/components/DividaFormModal";
import { DividaQuitacaoModal } from "@/features/dividas/components/DividaQuitacaoModal";
import { excluirDivida, listarDividas, type DividaDto } from "@/features/dividas/api";
import { formatarData, formatarMoeda } from "@/lib/format";

export function DividasPage() {
  const [dividas, setDividas] = useState<DividaDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "vazio" | "erro" | "sucesso">("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [dividaQuitando, setDividaQuitando] = useState<DividaDto | null>(null);
  const [chaveModalQuitacao, setChaveModalQuitacao] = useState(0);
  const [dividaExcluindo, setDividaExcluindo] = useState<DividaDto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarDividas();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setDividas(resposta.dados);
        setEstado(resposta.dados.length === 0 ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [refreshKey]);

  function recarregar() {
    setRefreshKey((k) => k + 1);
  }

  function abrirQuitacao(divida: DividaDto) {
    setDividaQuitando(divida);
    setChaveModalQuitacao((k) => k + 1);
  }

  async function confirmarExclusao() {
    if (!dividaExcluindo) return;
    setExcluindo(true);
    try {
      await excluirDivida(dividaExcluindo.id);
      setDividaExcluindo(null);
      recarregar();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Dívidas</h1>
          <p className="mt-1 text-sm text-graphite-500">Empréstimos e parcelamentos fora do cartão.</p>
        </div>
        <Button onClick={() => setModalNovaAberto(true)}>Nova dívida</Button>
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          ))}
        </div>
      )}

      {estado === "vazio" && (
        <div className="rounded-xl border border-dashed border-graphite-300 bg-surface p-10 text-center">
          <p className="text-sm text-graphite-500">Nenhuma dívida cadastrada ainda.</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar as dívidas.
          </p>
        </div>
      )}

      {estado === "sucesso" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dividas.map((divida) => {
            const percentualPago =
              divida.valorOriginal > 0
                ? Math.round(((divida.valorOriginal - divida.valorAtual) / divida.valorOriginal) * 100)
                : 0;

            return (
              <div key={divida.id} className="flex flex-col gap-3 rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-graphite-900">{divida.descricao}</p>
                    {divida.credor && <p className="text-xs text-graphite-400">{divida.credor}</p>}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      divida.status === "QUITADA" ? "bg-success-50 text-success-600" : "bg-graphite-100 text-graphite-600"
                    }`}
                  >
                    {divida.status === "QUITADA" ? "Quitada" : "Ativa"}
                  </span>
                </div>

                <div>
                  <span className="numero-destaque text-2xl font-semibold text-graphite-900">
                    {formatarMoeda(divida.valorAtual)}
                  </span>
                  <p className="text-xs text-graphite-400">
                    de {formatarMoeda(divida.valorOriginal)} · {divida.taxaJurosMensal}% a.m. · {percentualPago}% pago
                  </p>
                </div>

                <p className="text-xs text-graphite-400">Contratada em {formatarData(divida.dataContratacao)}</p>

                <div className="flex justify-end gap-3 border-t border-graphite-100 pt-3 text-sm">
                  {divida.status === "ATIVA" && (
                    <button type="button" onClick={() => abrirQuitacao(divida)} className="text-navy-600 hover:underline">
                      Quitar
                    </button>
                  )}
                  <button type="button" onClick={() => setDividaExcluindo(divida)} className="text-danger-600 hover:underline">
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DividaFormModal open={modalNovaAberto} onClose={() => setModalNovaAberto(false)} onSalvo={recarregar} />

      <DividaQuitacaoModal
        key={chaveModalQuitacao}
        open={Boolean(dividaQuitando)}
        onClose={() => setDividaQuitando(null)}
        divida={dividaQuitando}
        onSalvo={recarregar}
      />

      <Modal
        open={Boolean(dividaExcluindo)}
        onClose={() => setDividaExcluindo(null)}
        title="Excluir dívida"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDividaExcluindo(null)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" loading={excluindo} onClick={confirmarExclusao}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-graphite-600">
          Tem certeza que deseja excluir <strong>&ldquo;{dividaExcluindo?.descricao}&rdquo;</strong>?
        </p>
      </Modal>
    </div>
  );
}
