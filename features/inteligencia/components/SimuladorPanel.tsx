"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import { simular, type PontoProjecaoDto, type ResultadoSimulacaoDto } from "@/features/inteligencia/api";
import { formatarMoeda } from "@/lib/format";
import { ProjectionChart } from "@/features/inteligencia/components/ProjectionChart";

const colunasProjecao: Coluna<PontoProjecaoDto>[] = [
  { chave: "mes", cabecalho: "Mês", renderizar: (p) => `Mês ${p.mes}` },
  { chave: "receitas", cabecalho: "Receitas", className: "text-right", renderizar: (p) => formatarMoeda(p.receitas) },
  { chave: "despesas", cabecalho: "Despesas", className: "text-right", renderizar: (p) => formatarMoeda(p.despesas) },
  { chave: "saldoMes", cabecalho: "Saldo do mês", className: "text-right", renderizar: (p) => formatarMoeda(p.saldoMes) },
  {
    chave: "saldoAcumulado",
    cabecalho: "Acumulado",
    className: "text-right",
    renderizar: (p) => formatarMoeda(p.saldoAcumulado),
  },
];

export function SimuladorPanel() {
  const [percentualReceitas, setPercentualReceitas] = useState(0);
  const [percentualDespesas, setPercentualDespesas] = useState(0);
  const [receitaAdicionalMensal, setReceitaAdicionalMensal] = useState("");
  const [despesaAdicionalMensal, setDespesaAdicionalMensal] = useState("");
  const [meses, setMeses] = useState("6");

  const [resultado, setResultado] = useState<ResultadoSimulacaoDto | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSimular() {
    setErro(null);
    setSimulando(true);
    try {
      const resposta = await simular({
        percentualReceitas,
        percentualDespesas,
        receitaAdicionalMensal: receitaAdicionalMensal ? Number(receitaAdicionalMensal.replace(",", ".")) : 0,
        despesaAdicionalMensal: despesaAdicionalMensal ? Number(despesaAdicionalMensal.replace(",", ".")) : 0,
        meses: Number(meses) || 6,
      });
      if (!resposta.sucesso || !resposta.dados) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível simular.");
        return;
      }
      setResultado(resposta.dados);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setSimulando(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-graphite-200 bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <p className="text-xs font-medium uppercase tracking-wide text-aqua-600">Planejamento</p>
        <h2 className="mt-1 text-xl font-semibold text-graphite-900">Simulador &ldquo;e se&rdquo;</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-graphite-500">
          A base é a média das suas receitas e despesas dos últimos 3 meses. Ajuste os cenários abaixo.
        </p>
        </div>
        <span className="rounded-full bg-graphite-50 px-3 py-1 text-xs font-medium text-graphite-500">Projeção de 1 a 24 meses</span>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
          {erro}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 rounded-2xl bg-graphite-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <label htmlFor="sim-receitas" className="font-medium text-graphite-700">
              Variação de receitas
            </label>
            <span className="numero-destaque text-graphite-900">
              {percentualReceitas > 0 ? "+" : ""}
              {percentualReceitas}%
            </span>
          </div>
          <input
            id="sim-receitas"
            type="range"
            min="-50"
            max="100"
            value={percentualReceitas}
            onChange={(e) => setPercentualReceitas(Number(e.target.value))}
            className="w-full accent-navy-600"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <label htmlFor="sim-despesas" className="font-medium text-graphite-700">
              Variação de despesas
            </label>
            <span className="numero-destaque text-graphite-900">
              {percentualDespesas > 0 ? "+" : ""}
              {percentualDespesas}%
            </span>
          </div>
          <input
            id="sim-despesas"
            type="range"
            min="-50"
            max="100"
            value={percentualDespesas}
            onChange={(e) => setPercentualDespesas(Number(e.target.value))}
            className="w-full accent-navy-600"
          />
        </div>

        <FormField
          label="Receita adicional mensal (R$)"
          type="number"
          value={receitaAdicionalMensal}
          onChange={(e) => setReceitaAdicionalMensal(e.target.value)}
          placeholder="Ex.: novo freelance"
        />
        <FormField
          label="Despesa adicional mensal (R$)"
          type="number"
          value={despesaAdicionalMensal}
          onChange={(e) => setDespesaAdicionalMensal(e.target.value)}
          placeholder="Ex.: nova assinatura"
        />
        <FormField
          label="Meses para projetar"
          type="number"
          min="1"
          max="24"
          value={meses}
          onChange={(e) => setMeses(e.target.value)}
        />
      </div>

      <Button type="button" onClick={handleSimular} loading={simulando} className="w-full sm:w-auto sm:self-start">
        Gerar projeção
      </Button>

      {resultado && (
        <div className="flex flex-col gap-4 border-t border-graphite-100 pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-graphite-50 p-4">
              <p className="text-xs font-medium text-graphite-500">Situação atual (base histórica)</p>
              <p className="numero-destaque mt-1 text-xl font-semibold text-graphite-900">
                {formatarMoeda(resultado.baseline.saldo)}/mês
              </p>
              <p className="text-xs text-graphite-400">
                {formatarMoeda(resultado.baseline.receitas)} receitas − {formatarMoeda(resultado.baseline.despesas)} despesas
              </p>
            </div>
            <div className="rounded-lg bg-navy-50 p-4">
              <p className="text-xs font-medium text-navy-600">Cenário simulado</p>
              <p
                className={`numero-destaque mt-1 text-xl font-semibold ${
                  resultado.simulado.saldo >= 0 ? "text-success-600" : "text-danger-600"
                }`}
              >
                {formatarMoeda(resultado.simulado.saldo)}/mês
              </p>
              <p className="text-xs text-graphite-400">
                {formatarMoeda(resultado.simulado.receitas)} receitas − {formatarMoeda(resultado.simulado.despesas)} despesas
              </p>
            </div>
          </div>
          <ProjectionChart pontos={resultado.projecao} />
          <details className="group rounded-xl border border-graphite-200 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-graphite-700 marker:hidden">Ver valores mês a mês <span className="float-right text-graphite-400 transition-transform group-open:rotate-180">⌄</span></summary>
            <div className="border-t border-graphite-100 p-3">
              <DataTable colunas={colunasProjecao} linhas={resultado.projecao} chaveLinha={(p) => String(p.mes)} estado="sucesso" pagina={1} totalPaginas={1} onMudarPagina={() => {}} />
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
