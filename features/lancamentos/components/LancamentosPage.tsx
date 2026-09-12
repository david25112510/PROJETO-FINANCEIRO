"use client";

import { useEffect, useState } from "react";
import { DataTable, type Coluna } from "@/components/ui/DataTable";
import type { EstadoComponente } from "@/components/ui/IndicatorCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IconPlus } from "@/components/ui/icons";
import { LancamentoFormModal } from "@/features/lancamentos/components/LancamentoFormModal";
import {
  excluirLancamento,
  listarCategorias,
  listarLancamentos,
  type CategoriaDto,
  type LancamentoDto,
  type Recurso,
  type TipoCategoria,
} from "@/features/lancamentos/api";
import { formatarData, formatarMoeda } from "@/lib/format";

const PAGE_SIZE = 10;

type Props = {
  titulo: string;
  descricao: string;
  recurso: Recurso;
  tipoCategoria: TipoCategoria;
};

export function LancamentosPage({ titulo, descricao, recurso, tipoCategoria }: Props) {
  const [itens, setItens] = useState<LancamentoDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [estado, setEstado] = useState<EstadoComponente>("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<LancamentoDto | null>(null);
  const [chaveModal, setChaveModal] = useState(0);
  const [itemExcluindo, setItemExcluindo] = useState<LancamentoDto | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const resposta = await listarCategorias(tipoCategoria);
      if (!cancelado && resposta.sucesso && resposta.dados) setCategorias(resposta.dados);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [tipoCategoria]);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarLancamentos(recurso, {
          page,
          pageSize: PAGE_SIZE,
          busca: busca || undefined,
          categoriaId: categoriaFiltro || undefined,
        });
        if (cancelado) return;

        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setItens(resposta.dados.itens);
        setTotal(resposta.dados.total);
        setEstado(resposta.dados.itens.length === 0 ? "vazio" : "sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [recurso, page, busca, categoriaFiltro, refreshKey]);

  function recarregar() {
    setRefreshKey((k) => k + 1);
  }

  function handleNovo() {
    setItemEditando(null);
    setChaveModal((k) => k + 1);
    setModalAberto(true);
  }

  function handleEditar(item: LancamentoDto) {
    setItemEditando(item);
    setChaveModal((k) => k + 1);
    setModalAberto(true);
  }

  function handleExcluir(item: LancamentoDto) {
    setErroExclusao(null);
    setItemExcluindo(item);
  }

  async function confirmarExclusao(serieCompleta: boolean) {
    if (!itemExcluindo) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      const resposta = await excluirLancamento(recurso, itemExcluindo.id, serieCompleta);
      if (!resposta.sucesso) {
        setErroExclusao(resposta.erro?.mensagem ?? "Não foi possível excluir o lançamento.");
        return;
      }
      setItemExcluindo(null);
      recarregar();
    } catch {
      setErroExclusao("Falha de conexão. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const colunas: Coluna<LancamentoDto>[] = [
    { chave: "data", cabecalho: "Data", renderizar: (l) => formatarData(l.data), className: "whitespace-nowrap" },
    {
      chave: "descricao",
      cabecalho: "Descrição",
      renderizar: (l) => (
        <div className="flex flex-col">
          <span>{l.descricao}</span>
          {l.totalParcelas && (
            <span className="text-xs text-graphite-400">
              Parcela {l.parcelaAtual}/{l.totalParcelas}
            </span>
          )}
          {l.recorrente && <span className="text-xs text-graphite-400">Recorrente</span>}
        </div>
      ),
    },
    {
      chave: "categoria",
      cabecalho: "Categoria",
      renderizar: (l) =>
        l.categoria ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${l.categoria.cor}1a`, color: l.categoria.cor }}
          >
            {l.categoria.nome}
          </span>
        ) : (
          <span className="text-graphite-400">—</span>
        ),
    },
    {
      chave: "valor",
      cabecalho: "Valor",
      className: "text-right whitespace-nowrap",
      renderizar: (l) => formatarMoeda(l.valor),
    },
    {
      chave: "acoes",
      cabecalho: "",
      className: "text-right whitespace-nowrap",
      renderizar: (l) => (
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => handleEditar(l)} className="text-sm text-navy-600 hover:underline">
            Editar
          </button>
          <button type="button" onClick={() => handleExcluir(l)} className="text-sm text-danger-600 hover:underline">
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">{titulo}</h1>
          <p className="mt-1 text-sm text-graphite-500">{descricao}</p>
        </div>
        <Button onClick={handleNovo}>
          <IconPlus className="size-4" />
          Novo lançamento
        </Button>
      </div>

      <DataTable
        colunas={colunas}
        linhas={itens}
        chaveLinha={(l) => l.id}
        estado={estado}
        mensagemVazio="Nenhum lançamento encontrado."
        pagina={page}
        totalPaginas={totalPaginas}
        onMudarPagina={setPage}
        toolbar={
          <>
            <input
              type="search"
              placeholder="Buscar por descrição..."
              value={busca}
              onChange={(e) => {
                setPage(1);
                setBusca(e.target.value);
              }}
              className="min-w-48 flex-1 rounded-lg border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-navy-500"
            />
            <select
              value={categoriaFiltro}
              onChange={(e) => {
                setPage(1);
                setCategoriaFiltro(e.target.value);
              }}
              className="rounded-lg border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-navy-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </>
        }
      />

      <LancamentoFormModal
        key={chaveModal}
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        recurso={recurso}
        tipoCategoria={tipoCategoria}
        categorias={categorias}
        onCategoriaCriada={(categoria) => setCategorias((prev) => [...prev, categoria])}
        lancamentoEditando={itemEditando}
        onSalvo={recarregar}
      />

      <Modal
        open={Boolean(itemExcluindo)}
        onClose={() => setItemExcluindo(null)}
        title="Excluir lançamento"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setItemExcluindo(null)} disabled={excluindo}>
              Cancelar
            </Button>
            {itemExcluindo?.grupoRecorrenciaId && (
              <Button type="button" variant="danger" loading={excluindo} onClick={() => confirmarExclusao(true)}>
                Excluir esta e as futuras
              </Button>
            )}
            <Button type="button" variant="danger" loading={excluindo} onClick={() => confirmarExclusao(false)}>
              {itemExcluindo?.grupoRecorrenciaId ? "Excluir apenas esta" : "Excluir"}
            </Button>
          </>
        }
      >
        {erroExclusao && (
          <p role="alert" className="mb-3 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erroExclusao}
          </p>
        )}
        <p className="text-sm text-graphite-600">
          Tem certeza que deseja excluir <strong>&ldquo;{itemExcluindo?.descricao}&rdquo;</strong>?
          {itemExcluindo?.grupoRecorrenciaId && " Este lançamento faz parte de uma recorrência."}
        </p>
      </Modal>
    </div>
  );
}
