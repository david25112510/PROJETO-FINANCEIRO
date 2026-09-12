"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import { IconPlus } from "@/components/ui/icons";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";
import { CompraFormModal } from "@/features/cartoes/components/CompraFormModal";
import { PagamentoFaturaModal } from "@/features/cartoes/components/PagamentoFaturaModal";
import {
  buscarCartao,
  buscarFatura,
  excluirCompra,
  listarFaturas,
  type CartaoDto,
  type CompraDto,
  type FaturaComComprasDto,
  type FaturaDto,
  type StatusFatura,
} from "@/features/cartoes/api";
import { formatarData, formatarMoeda } from "@/lib/format";

const ROTULO_STATUS: Record<StatusFatura, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  PAGA_PARCIAL: "Paga parcialmente",
  PAGA: "Paga",
};

const COR_STATUS: Record<StatusFatura, string> = {
  ABERTA: "bg-graphite-100 text-graphite-600",
  FECHADA: "bg-warning-50 text-warning-600",
  PAGA_PARCIAL: "bg-warning-50 text-warning-600",
  PAGA: "bg-success-50 text-success-600",
};

function nomeMes(mes: number): string {
  return new Date(2000, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
}

export function CartaoDetalhe({ cartaoId }: { cartaoId: string }) {
  const [cartao, setCartao] = useState<CartaoDto | null>(null);
  const [faturas, setFaturas] = useState<FaturaDto[]>([]);
  const [estadoFaturas, setEstadoFaturas] = useState<EstadoComponente>("carregando");
  const [faturaSelecionadaId, setFaturaSelecionadaId] = useState<string | null>(null);
  const [faturaDetalhe, setFaturaDetalhe] = useState<FaturaComComprasDto | null>(null);
  const [estadoDetalhe, setEstadoDetalhe] = useState<EstadoComponente>("vazio");

  const [modalCompraAberto, setModalCompraAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [chaveModalCompra, setChaveModalCompra] = useState(0);
  const [chaveModalPagamento, setChaveModalPagamento] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  function recarregar() {
    setRefreshKey((k) => k + 1);
  }

  function abrirModalCompra() {
    setChaveModalCompra((k) => k + 1);
    setModalCompraAberto(true);
  }

  function abrirModalPagamento() {
    setChaveModalPagamento((k) => k + 1);
    setModalPagamentoAberto(true);
  }

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resposta = await buscarCartao(cartaoId);
      if (!cancelado && resposta.sucesso && resposta.dados) setCartao(resposta.dados);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [cartaoId, refreshKey]);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstadoFaturas("carregando");
      try {
        const resposta = await listarFaturas(cartaoId);
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstadoFaturas("erro");
          return;
        }
        setFaturas(resposta.dados);
        setEstadoFaturas(resposta.dados.length === 0 ? "vazio" : "sucesso");
        if (resposta.dados.length === 0) {
          setFaturaDetalhe(null);
          setEstadoDetalhe("vazio");
        }
        setFaturaSelecionadaId((atual) => atual ?? resposta.dados![0]?.id ?? null);
      } catch {
        if (!cancelado) setEstadoFaturas("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [cartaoId, refreshKey]);

  useEffect(() => {
    if (!faturaSelecionadaId) return;
    const faturaId = faturaSelecionadaId;
    let cancelado = false;

    async function carregar() {
      setEstadoDetalhe("carregando");
      try {
        const resposta = await buscarFatura(faturaId);
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstadoDetalhe("erro");
          return;
        }
        setFaturaDetalhe(resposta.dados);
        setEstadoDetalhe(resposta.dados.compras.length === 0 ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstadoDetalhe("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [faturaSelecionadaId, refreshKey]);

  async function handleExcluirCompra(compra: CompraDto) {
    setErroAcao(null);
    try {
      const resposta = await excluirCompra(compra.id);
      if (!resposta.sucesso) {
        setErroAcao(resposta.erro?.mensagem ?? "Não foi possível excluir a compra.");
        return;
      }
      recarregar();
    } catch {
      setErroAcao("Falha de conexão. Tente novamente.");
    }
  }

  const colunasCompras: Coluna<CompraDto>[] = [
    { chave: "data", cabecalho: "Data", renderizar: (c) => formatarData(c.data), className: "whitespace-nowrap" },
    {
      chave: "descricao",
      cabecalho: "Descrição",
      renderizar: (c) => (
        <div className="flex flex-col">
          <span>{c.descricao}</span>
          {c.totalParcelas && (
            <span className="text-xs text-graphite-400">
              Parcela {c.parcelaAtual}/{c.totalParcelas}
            </span>
          )}
        </div>
      ),
    },
    { chave: "categoria", cabecalho: "Categoria", renderizar: (c) => c.categoria?.nome ?? "—" },
    { chave: "valor", cabecalho: "Valor", className: "text-right whitespace-nowrap", renderizar: (c) => formatarMoeda(c.valor) },
    {
      chave: "acoes",
      cabecalho: "",
      className: "text-right whitespace-nowrap",
      renderizar: (c) => (
        <button type="button" onClick={() => handleExcluirCompra(c)} className="text-sm text-danger-600 hover:underline">
          Excluir
        </button>
      ),
    },
  ];

  const podePagar = faturaDetalhe && (faturaDetalhe.status === "FECHADA" || faturaDetalhe.status === "PAGA_PARCIAL");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/cartoes" className="text-sm text-navy-600 hover:underline">
            ← Cartões
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-graphite-900">{cartao?.nome ?? "Cartão"}</h1>
          {cartao && (
            <p className="mt-1 text-sm text-graphite-500">
              Limite {formatarMoeda(cartao.limite)} · Usado {formatarMoeda(cartao.limiteUsado)} · Fecha dia{" "}
              {cartao.diaFechamento}, vence dia {cartao.diaVencimento}
            </p>
          )}
        </div>
        <Button onClick={abrirModalCompra}>
          <IconPlus className="size-4" />
          Nova compra
        </Button>
      </div>

      {erroAcao && (
        <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {erroAcao}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-graphite-700">Faturas</h2>
          {estadoFaturas === "carregando" &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg border border-graphite-200 bg-graphite-50" />
            ))}
          {estadoFaturas === "vazio" && <p className="text-sm text-graphite-400">Nenhuma fatura ainda.</p>}
          {estadoFaturas === "erro" && (
            <p role="alert" className="text-sm text-danger-600">
              Não foi possível carregar as faturas.
            </p>
          )}
          {estadoFaturas === "sucesso" &&
            faturas.map((fatura) => (
              <button
                key={fatura.id}
                type="button"
                onClick={() => setFaturaSelecionadaId(fatura.id)}
                className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                  fatura.id === faturaSelecionadaId
                    ? "border-navy-500 bg-navy-50"
                    : "border-graphite-200 bg-surface hover:bg-graphite-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-graphite-800">
                    {nomeMes(fatura.mesReferencia)} {fatura.anoReferencia}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${COR_STATUS[fatura.status]}`}>
                    {ROTULO_STATUS[fatura.status]}
                  </span>
                </div>
                <span className="text-sm text-graphite-600">{formatarMoeda(fatura.valorTotal)}</span>
                <span className="text-xs text-graphite-400">Vence em {formatarData(fatura.dataVencimento)}</span>
              </button>
            ))}
        </div>

        <div className="flex flex-col gap-3">
          {faturaDetalhe && (
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-graphite-700">
                Compras — {nomeMes(faturaDetalhe.mesReferencia)} {faturaDetalhe.anoReferencia}
              </h2>
              {podePagar && (
                <Button variant="secondary" onClick={abrirModalPagamento}>
                  Pagar fatura
                </Button>
              )}
            </div>
          )}

          <DataTable
            colunas={colunasCompras}
            linhas={faturaDetalhe?.compras ?? []}
            chaveLinha={(c) => c.id}
            estado={estadoDetalhe}
            mensagemVazio="Nenhuma compra nesta fatura."
            pagina={1}
            totalPaginas={1}
            onMudarPagina={() => {}}
          />
        </div>
      </div>

      <CompraFormModal
        key={chaveModalCompra}
        open={modalCompraAberto}
        onClose={() => setModalCompraAberto(false)}
        cartaoId={cartaoId}
        onSalvo={recarregar}
      />

      <PagamentoFaturaModal
        key={chaveModalPagamento}
        open={modalPagamentoAberto}
        onClose={() => setModalPagamentoAberto(false)}
        fatura={faturaDetalhe}
        onSalvo={recarregar}
      />
    </div>
  );
}
