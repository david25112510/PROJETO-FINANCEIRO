import type { ReactNode } from "react";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";

export type Coluna<T> = {
  chave: string;
  cabecalho: string;
  renderizar: (linha: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  colunas: Coluna<T>[];
  linhas: T[];
  chaveLinha: (linha: T) => string;
  estado: EstadoComponente;
  mensagemVazio?: string;
  mensagemErro?: string;
  pagina: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
  toolbar?: ReactNode;
};

const LINHAS_ESQUELETO = 5;

/**
 * Tabela com filtro e paginação — componente obrigatório do design system.
 * O filtro é fornecido via slot `toolbar`; trata os 4 estados exigidos.
 */
export function DataTable<T>({
  colunas,
  linhas,
  chaveLinha,
  estado,
  mensagemVazio = "Nenhum registro encontrado.",
  mensagemErro = "Não foi possível carregar os dados.",
  pagina,
  totalPaginas,
  onMudarPagina,
  toolbar,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-lg border border-graphite-200 bg-surface shadow-sm">
      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b border-graphite-100 bg-panel p-4">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-graphite-100 bg-panel text-xs font-medium uppercase tracking-wide text-graphite-500">
              {colunas.map((coluna) => (
                <th key={coluna.chave} className={`px-4 py-3 ${coluna.className ?? ""}`}>
                  {coluna.cabecalho}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {estado === "carregando" &&
              Array.from({ length: LINHAS_ESQUELETO }).map((_, i) => (
                <tr key={i} className="border-b border-graphite-50">
                  {colunas.map((coluna) => (
                    <td key={coluna.chave} className="px-4 py-3">
                      <div className="h-4 w-full max-w-32 animate-pulse rounded bg-graphite-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {estado === "vazio" && (
              <tr>
                <td colSpan={colunas.length} className="px-4 py-10 text-center">
                  <span className="inline-flex rounded-lg bg-graphite-50 px-3 py-2 text-sm text-graphite-500">
                    {mensagemVazio}
                  </span>
                </td>
              </tr>
            )}

            {estado === "erro" && (
              <tr>
                <td colSpan={colunas.length} className="px-4 py-10 text-center" role="alert">
                  <span className="inline-flex rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">
                    {mensagemErro}
                  </span>
                </td>
              </tr>
            )}

            {estado === "sucesso" &&
              linhas.map((linha) => (
                <tr key={chaveLinha(linha)} className="border-b border-graphite-50 last:border-0 hover:bg-aqua-50/50">
                  {colunas.map((coluna) => (
                    <td key={coluna.chave} className={`px-4 py-3 text-graphite-800 ${coluna.className ?? ""}`}>
                      {coluna.renderizar(linha)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {estado === "sucesso" && totalPaginas > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-graphite-100 p-3">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => onMudarPagina(pagina - 1)}
            className="rounded-md px-3 py-1.5 text-sm text-graphite-600 hover:bg-graphite-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-graphite-500">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => onMudarPagina(pagina + 1)}
            className="rounded-md px-3 py-1.5 text-sm text-graphite-600 hover:bg-graphite-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
