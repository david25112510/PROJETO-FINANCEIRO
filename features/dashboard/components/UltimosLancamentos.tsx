"use client";

import { useEffect, useState } from "react";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";
import type { ApiResponse } from "@/lib/api-response";
import { formatarData, formatarMoeda } from "@/lib/format";

type CategoriaResumo = { nome: string; cor: string } | null;

type LancamentoBruto = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: CategoriaResumo;
};

type PaginaBruta = { itens: LancamentoBruto[] };

type LancamentoResumo = LancamentoBruto & { tipo: "Receita" | "Despesa" };

const QUANTIDADE_EXIBIDA = 5;

async function buscarLancamentos(caminho: "receitas" | "despesas", tipo: "Receita" | "Despesa") {
  const res = await fetch(`/api/v1/${caminho}?pageSize=${QUANTIDADE_EXIBIDA}`);
  const body: ApiResponse<PaginaBruta> = await res.json();
  if (!body.sucesso || !body.dados) return [];
  return body.dados.itens.map((item) => ({ ...item, tipo }));
}

const colunas: Coluna<LancamentoResumo>[] = [
  {
    chave: "data",
    cabecalho: "Data",
    renderizar: (linha) => formatarData(linha.data),
    className: "whitespace-nowrap",
  },
  {
    chave: "descricao",
    cabecalho: "Descrição",
    renderizar: (linha) => linha.descricao,
  },
  {
    chave: "categoria",
    cabecalho: "Categoria",
    renderizar: (linha) => linha.categoria?.nome ?? "—",
  },
  {
    chave: "valor",
    cabecalho: "Valor",
    className: "text-right whitespace-nowrap",
    renderizar: (linha) => (
      <span className={linha.tipo === "Receita" ? "text-success-600" : "text-graphite-800"}>
        {linha.tipo === "Receita" ? "+" : "-"} {formatarMoeda(linha.valor)}
      </span>
    ),
  },
];

/**
 * Widget mais pesado do dashboard (duas requisições, mesclagem e ordenação
 * no cliente) — carregado sob demanda via next/dynamic, sem bloquear os
 * indicadores acima.
 */
export function UltimosLancamentos() {
  const [estado, setEstado] = useState<EstadoComponente>("carregando");
  const [linhas, setLinhas] = useState<LancamentoResumo[]>([]);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const [receitas, despesas] = await Promise.all([
          buscarLancamentos("receitas", "Receita"),
          buscarLancamentos("despesas", "Despesa"),
        ]);
        if (cancelado) return;

        const combinados = [...receitas, ...despesas]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .slice(0, QUANTIDADE_EXIBIDA);

        setLinhas(combinados);
        setEstado(combinados.length === 0 ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-graphite-700">Últimos lançamentos</h2>
      <DataTable
        colunas={colunas}
        linhas={linhas}
        chaveLinha={(linha) => `${linha.tipo}-${linha.id}`}
        estado={estado}
        mensagemVazio="Nenhum lançamento registrado ainda."
        pagina={1}
        totalPaginas={1}
        onMudarPagina={() => {}}
      />
    </div>
  );
}
