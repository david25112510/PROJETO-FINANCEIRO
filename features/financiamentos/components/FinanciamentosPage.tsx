"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FinanciamentoFormModal } from "@/features/financiamentos/components/FinanciamentoFormModal";
import { excluirFinanciamento, listarFinanciamentos, type FinanciamentoDto } from "@/features/financiamentos/api";
import { formatarData, formatarMoeda } from "@/lib/format";

export function FinanciamentosPage() {
  const [financiamentos, setFinanciamentos] = useState<FinanciamentoDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "vazio" | "erro" | "sucesso">("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [excluindoAlvo, setExcluindoAlvo] = useState<FinanciamentoDto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarFinanciamentos();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setFinanciamentos(resposta.dados);
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

  async function confirmarExclusao() {
    if (!excluindoAlvo) return;
    setExcluindo(true);
    try {
      await excluirFinanciamento(excluindoAlvo.id);
      setExcluindoAlvo(null);
      recarregar();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Financiamentos</h1>
          <p className="mt-1 text-sm text-graphite-500">Amortização Price e SAC, com comparador de cenários.</p>
        </div>
        <Button onClick={() => setModalNovoAberto(true)}>Novo financiamento</Button>
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          ))}
        </div>
      )}

      {estado === "vazio" && (
        <div className="rounded-xl border border-dashed border-graphite-300 bg-surface p-10 text-center">
          <p className="text-sm text-graphite-500">Nenhum financiamento cadastrado ainda.</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar os financiamentos.
          </p>
        </div>
      )}

      {estado === "sucesso" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {financiamentos.map((financiamento) => (
            <div
              key={financiamento.id}
              className="flex flex-col gap-3 rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/financiamentos/${financiamento.id}`} className="font-semibold text-graphite-900 hover:underline">
                  {financiamento.descricao}
                </Link>
                <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-medium text-navy-600">
                  {financiamento.sistemaAmortizacao}
                </span>
              </div>

              <span className="numero-destaque text-2xl font-semibold text-graphite-900">
                {formatarMoeda(financiamento.valorTotal)}
              </span>
              <p className="text-xs text-graphite-400">
                {financiamento.numeroParcelas}x · {financiamento.taxaJurosMensal}% a.m.
              </p>
              <p className="text-xs text-graphite-400">Contratado em {formatarData(financiamento.dataContratacao)}</p>

              <div className="flex justify-end gap-3 border-t border-graphite-100 pt-3 text-sm">
                <Link href={`/financiamentos/${financiamento.id}`} className="text-navy-600 hover:underline">
                  Ver amortização
                </Link>
                <button type="button" onClick={() => setExcluindoAlvo(financiamento)} className="text-danger-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FinanciamentoFormModal open={modalNovoAberto} onClose={() => setModalNovoAberto(false)} onSalvo={recarregar} />

      <Modal
        open={Boolean(excluindoAlvo)}
        onClose={() => setExcluindoAlvo(null)}
        title="Excluir financiamento"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setExcluindoAlvo(null)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" loading={excluindo} onClick={confirmarExclusao}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-graphite-600">
          Tem certeza que deseja excluir <strong>&ldquo;{excluindoAlvo?.descricao}&rdquo;</strong>?
        </p>
      </Modal>
    </div>
  );
}
