"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";
import {
  buscarAmortizacao,
  buscarFinanciamento,
  type AmortizacaoDto,
  type FinanciamentoDto,
  type ParcelaAmortizacaoDto,
} from "@/features/financiamentos/api";
import { formatarMoeda } from "@/lib/format";

const PAGE_SIZE = 12;

export function FinanciamentoDetalhe({ financiamentoId }: { financiamentoId: string }) {
  const [financiamento, setFinanciamento] = useState<FinanciamentoDto | null>(null);
  const [amortizacao, setAmortizacao] = useState<AmortizacaoDto | null>(null);
  const [estado, setEstado] = useState<EstadoComponente>("carregando");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const [respostaFinanciamento, respostaAmortizacao] = await Promise.all([
          buscarFinanciamento(financiamentoId),
          buscarAmortizacao(financiamentoId),
        ]);
        if (cancelado) return;

        if (!respostaFinanciamento.sucesso || !respostaFinanciamento.dados || !respostaAmortizacao.sucesso || !respostaAmortizacao.dados) {
          setEstado("erro");
          return;
        }

        setFinanciamento(respostaFinanciamento.dados);
        setAmortizacao(respostaAmortizacao.dados);
        setEstado("sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [financiamentoId]);

  const totalPaginas = amortizacao ? Math.max(1, Math.ceil(amortizacao.parcelas.length / PAGE_SIZE)) : 1;
  const linhasPagina = useMemo(() => {
    if (!amortizacao) return [];
    return amortizacao.parcelas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);
  }, [amortizacao, pagina]);

  const colunas: Coluna<ParcelaAmortizacaoDto>[] = [
    { chave: "numero", cabecalho: "#", renderizar: (p) => p.numero },
    { chave: "valorParcela", cabecalho: "Parcela", className: "text-right", renderizar: (p) => formatarMoeda(p.valorParcela) },
    { chave: "juros", cabecalho: "Juros", className: "text-right", renderizar: (p) => formatarMoeda(p.juros) },
    { chave: "amortizacao", cabecalho: "Amortização", className: "text-right", renderizar: (p) => formatarMoeda(p.amortizacao) },
    { chave: "saldoDevedor", cabecalho: "Saldo devedor", className: "text-right", renderizar: (p) => formatarMoeda(p.saldoDevedor) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/financiamentos" className="text-sm text-navy-600 hover:underline">
          ← Financiamentos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-graphite-900">{financiamento?.descricao ?? "Financiamento"}</h1>
        {financiamento && (
          <p className="mt-1 text-sm text-graphite-500">
            {formatarMoeda(financiamento.valorTotal)} · {financiamento.numeroParcelas}x · {financiamento.taxaJurosMensal}% a.m. ·
            sistema contratado: {financiamento.sistemaAmortizacao}
          </p>
        )}
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          <div className="h-32 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar este financiamento.
          </p>
        </div>
      )}

      {estado === "sucesso" && amortizacao && financiamento && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-graphite-700">Comparador de cenários</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["price", "sac"] as const).map((sistema) => {
                const resumo = amortizacao.comparador[sistema];
                const contratado = financiamento.sistemaAmortizacao === sistema.toUpperCase();
                return (
                  <div
                    key={sistema}
                    className={`rounded-xl border p-5 shadow-sm ${
                      contratado ? "border-navy-500 bg-navy-50" : "border-graphite-200 bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-graphite-800">{sistema.toUpperCase()}</span>
                      {contratado && (
                        <span className="rounded-full bg-navy-600 px-2 py-0.5 text-[11px] font-medium text-white">
                          Contratado
                        </span>
                      )}
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-graphite-400">1ª parcela</dt>
                        <dd className="numero-destaque font-semibold text-graphite-900">{formatarMoeda(resumo.primeiraParcela)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-graphite-400">Última parcela</dt>
                        <dd className="numero-destaque font-semibold text-graphite-900">{formatarMoeda(resumo.ultimaParcela)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-graphite-400">Total de juros</dt>
                        <dd className="numero-destaque font-semibold text-warning-600">{formatarMoeda(resumo.totalJuros)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-graphite-400">Total pago</dt>
                        <dd className="numero-destaque font-semibold text-graphite-900">{formatarMoeda(resumo.totalPago)}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-graphite-700">Tabela de amortização</h2>
            <DataTable
              colunas={colunas}
              linhas={linhasPagina}
              chaveLinha={(p) => String(p.numero)}
              estado="sucesso"
              pagina={pagina}
              totalPaginas={totalPaginas}
              onMudarPagina={setPagina}
            />
          </div>
        </>
      )}
    </div>
  );
}
