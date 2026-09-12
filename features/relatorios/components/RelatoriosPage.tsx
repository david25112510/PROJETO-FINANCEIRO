"use client";

import { useEffect, useState } from "react";
import { IndicatorCard, type EstadoComponente } from "@/components/ui/IndicatorCard";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { CategoriaBarList } from "@/features/relatorios/components/CategoriaBarList";
import { buscarRelatorio, urlExportarRelatorio, type PontoSerieMensalDto, type RelatorioDto } from "@/features/relatorios/api";
import { listarCategorias, type CategoriaDto } from "@/features/lancamentos/api";
import { formatarMoeda, formatarPercentual } from "@/lib/format";

function primeiroDiaDoMes(): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function periodoAnterior(dataInicio: string, dataFim: string): { inicio: string; fim: string } {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const duracaoDias = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const novoFim = new Date(inicio);
  novoFim.setDate(novoFim.getDate() - 1);
  const novoInicio = new Date(novoFim);
  novoInicio.setDate(novoInicio.getDate() - duracaoDias + 1);

  return { inicio: novoInicio.toISOString().slice(0, 10), fim: novoFim.toISOString().slice(0, 10) };
}

const mesAno = (p: { mes: number; ano: number }) => `${String(p.mes).padStart(2, "0")}/${p.ano}`;

export function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes());
  const [dataFim, setDataFim] = useState(hoje());
  const [categoriaId, setCategoriaId] = useState("");
  const [comparar, setComparar] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioDto | null>(null);
  const [estado, setEstado] = useState<EstadoComponente>("carregando");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const [receitas, despesas] = await Promise.all([listarCategorias("RECEITA"), listarCategorias("DESPESA")]);
      if (cancelado) return;
      setCategorias([...(receitas.dados ?? []), ...(despesas.dados ?? [])]);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const comparacao = comparar ? periodoAnterior(dataInicio, dataFim) : null;
        const resposta = await buscarRelatorio({
          dataInicio,
          dataFim,
          categoriaId: categoriaId || undefined,
          compararDataInicio: comparacao?.inicio,
          compararDataFim: comparacao?.fim,
        });
        if (cancelado) return;

        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setRelatorio(resposta.dados);
        const semDados =
          resposta.dados.periodo.totalReceitas === 0 &&
          resposta.dados.periodo.totalDespesas === 0 &&
          resposta.dados.receitasPorCategoria.length === 0 &&
          resposta.dados.despesasPorCategoria.length === 0;
        setEstado(semDados ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [dataInicio, dataFim, categoriaId, comparar]);

  const filtroAtual = {
    dataInicio,
    dataFim,
    categoriaId: categoriaId || undefined,
  };

  const colunasSerie: Coluna<PontoSerieMensalDto>[] = [
    { chave: "mes", cabecalho: "Mês", renderizar: mesAno },
    { chave: "receitas", cabecalho: "Receitas", className: "text-right", renderizar: (p) => formatarMoeda(p.receitas) },
    { chave: "despesas", cabecalho: "Despesas", className: "text-right", renderizar: (p) => formatarMoeda(p.despesas) },
    { chave: "saldo", cabecalho: "Saldo", className: "text-right", renderizar: (p) => formatarMoeda(p.saldo) },
  ];

  const estadoIndicador = estado === "carregando" || estado === "erro" ? estado : relatorio ? "sucesso" : "carregando";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Relatórios</h1>
          <p className="mt-1 text-sm text-graphite-500">Consolidado, comparativo e exportação por período.</p>
        </div>
        <div className="flex gap-2">
          <a href={urlExportarRelatorio(filtroAtual, "pdf")}>
            <Button variant="secondary" type="button">
              Exportar PDF
            </Button>
          </a>
          <a href={urlExportarRelatorio(filtroAtual, "xlsx")}>
            <Button variant="secondary" type="button">
              Exportar Excel
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-graphite-200 bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rel-data-inicio" className="text-sm font-medium text-graphite-700">
            De
          </label>
          <input
            id="rel-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-navy-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rel-data-fim" className="text-sm font-medium text-graphite-700">
            Até
          </label>
          <input
            id="rel-data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-navy-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rel-categoria" className="text-sm font-medium text-graphite-700">
            Categoria
          </label>
          <select
            id="rel-categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="rounded-lg border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-navy-500"
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm text-graphite-700">
          <input
            type="checkbox"
            checked={comparar}
            onChange={(e) => setComparar(e.target.checked)}
            className="h-4 w-4 rounded border-graphite-300"
          />
          Comparar com o período anterior
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IndicatorCard
          titulo="Receitas"
          estado={estadoIndicador}
          valor={relatorio ? formatarMoeda(relatorio.periodo.totalReceitas) : undefined}
          tom="sucesso"
          descricao={
            relatorio?.comparacao?.variacaoReceitas != null
              ? `${formatarPercentual(relatorio.comparacao.variacaoReceitas)} vs. período anterior`
              : undefined
          }
        />
        <IndicatorCard
          titulo="Despesas"
          estado={estadoIndicador}
          valor={relatorio ? formatarMoeda(relatorio.periodo.totalDespesas) : undefined}
          tom="atencao"
          descricao={
            relatorio?.comparacao?.variacaoDespesas != null
              ? `${formatarPercentual(relatorio.comparacao.variacaoDespesas)} vs. período anterior`
              : undefined
          }
        />
        <IndicatorCard
          titulo="Saldo"
          estado={estadoIndicador}
          valor={relatorio ? formatarMoeda(relatorio.periodo.saldo) : undefined}
          tom={relatorio && relatorio.periodo.saldo < 0 ? "critico" : "sucesso"}
          descricao={
            relatorio?.comparacao?.variacaoSaldo != null
              ? `${formatarPercentual(relatorio.comparacao.variacaoSaldo)} vs. período anterior`
              : undefined
          }
        />
      </div>

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível gerar o relatório.
          </p>
        </div>
      )}

      {relatorio && estado !== "erro" && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoriaBarList titulo="Receitas por categoria" itens={relatorio.receitasPorCategoria} />
            <CategoriaBarList titulo="Despesas por categoria" itens={relatorio.despesasPorCategoria} />
          </div>

          {relatorio.serieMensal.length > 1 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-graphite-700">Evolução mensal</h2>
              <DataTable
                colunas={colunasSerie}
                linhas={relatorio.serieMensal}
                chaveLinha={mesAno}
                estado="sucesso"
                pagina={1}
                totalPaginas={1}
                onMudarPagina={() => {}}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
