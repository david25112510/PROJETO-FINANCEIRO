"use client";

import { useEffect, useRef, useState } from "react";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";
import { OpenFinanceSection } from "@/features/openfinance/components/OpenFinanceSection";
import {
  importarArquivo,
  listarHistoricoImportacoes,
  type ImportacaoHistoricoDto,
  type RelatorioImportacaoDto,
} from "@/features/importacao/api";
import { formatarData } from "@/lib/format";

const colunasHistorico: Coluna<ImportacaoHistoricoDto>[] = [
  { chave: "data", cabecalho: "Data", renderizar: (h) => formatarData(h.createdAt), className: "whitespace-nowrap" },
  { chave: "arquivo", cabecalho: "Arquivo", renderizar: (h) => h.nomeArquivo },
  { chave: "tipo", cabecalho: "Tipo", renderizar: (h) => h.tipoArquivo },
  { chave: "lidos", cabecalho: "Lidos", className: "text-right", renderizar: (h) => h.totalLidos },
  { chave: "importados", cabecalho: "Importados", className: "text-right", renderizar: (h) => h.totalImportados },
  { chave: "duplicados", cabecalho: "Duplicados", className: "text-right", renderizar: (h) => h.totalDuplicados },
];

export function ImportacaoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RelatorioImportacaoDto | null>(null);

  const [historico, setHistorico] = useState<ImportacaoHistoricoDto[]>([]);
  const [estadoHistorico, setEstadoHistorico] = useState<EstadoComponente>("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstadoHistorico("carregando");
      try {
        const resposta = await listarHistoricoImportacoes();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstadoHistorico("erro");
          return;
        }
        setHistorico(resposta.dados);
        setEstadoHistorico(resposta.dados.length === 0 ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstadoHistorico("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [refreshKey]);

  async function handleArquivoSelecionado() {
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) return;

    setErro(null);
    setResultado(null);
    setEnviando(true);
    try {
      const resposta = await importarArquivo(arquivo);
      if (!resposta.sucesso || !resposta.dados) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível importar o arquivo.");
        return;
      }
      setResultado(resposta.dados);
      setRefreshKey((k) => k + 1);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-graphite-900">Importação</h1>
        <p className="mt-1 text-sm text-graphite-500">
          Importe extratos OFX ou CSV. Transações já lançadas são detectadas e ignoradas automaticamente.
        </p>
      </div>

      <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
        {erro && (
          <p role="alert" className="mb-4 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".ofx,.csv"
            onChange={handleArquivoSelecionado}
            disabled={enviando}
            className="text-sm text-graphite-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-navy-800"
          />
          {enviando && <span className="text-sm text-graphite-500">Importando...</span>}
        </div>
        <p className="mt-3 text-xs text-graphite-400">
          CSV esperado: colunas <code>data</code>, <code>descricao</code>, <code>valor</code> (e opcionalmente{" "}
          <code>tipo</code>). Aceita separador vírgula ou ponto-e-vírgula, e valores em formato BR ou US.
        </p>

        {resultado && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-graphite-50 p-3 text-center">
              <p className="numero-destaque text-xl font-semibold text-graphite-900">{resultado.totalLidos}</p>
              <p className="text-xs text-graphite-500">Lidos</p>
            </div>
            <div className="rounded-lg bg-success-50 p-3 text-center">
              <p className="numero-destaque text-xl font-semibold text-success-600">{resultado.totalImportados}</p>
              <p className="text-xs text-graphite-500">Importados</p>
            </div>
            <div className="rounded-lg bg-warning-50 p-3 text-center">
              <p className="numero-destaque text-xl font-semibold text-warning-600">{resultado.totalDuplicados}</p>
              <p className="text-xs text-graphite-500">Duplicados (ignorados)</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-graphite-700">Histórico de importações</h2>
        <DataTable
          colunas={colunasHistorico}
          linhas={historico}
          chaveLinha={(h) => h.id}
          estado={estadoHistorico}
          mensagemVazio="Nenhuma importação realizada ainda."
          pagina={1}
          totalPaginas={1}
          onMudarPagina={() => {}}
        />
      </div>

      <OpenFinanceSection />
    </div>
  );
}
