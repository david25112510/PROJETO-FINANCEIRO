"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MetaFormModal } from "@/features/metas/components/MetaFormModal";
import { MetaAporteModal } from "@/features/metas/components/MetaAporteModal";
import { excluirMeta, listarMetas, type MetaDto } from "@/features/metas/api";
import { formatarData, formatarMoeda } from "@/lib/format";

export function MetasPage() {
  const [metas, setMetas] = useState<MetaDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "vazio" | "erro" | "sucesso">("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [metaAportando, setMetaAportando] = useState<MetaDto | null>(null);
  const [chaveModalAporte, setChaveModalAporte] = useState(0);
  const [metaExcluindo, setMetaExcluindo] = useState<MetaDto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarMetas();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setMetas(resposta.dados);
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

  function abrirAporte(meta: MetaDto) {
    setMetaAportando(meta);
    setChaveModalAporte((k) => k + 1);
  }

  async function confirmarExclusao() {
    if (!metaExcluindo) return;
    setExcluindo(true);
    try {
      await excluirMeta(metaExcluindo.id);
      setMetaExcluindo(null);
      recarregar();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Metas</h1>
          <p className="mt-1 text-sm text-graphite-500">Progresso e sugestão de aporte mensal para cada objetivo.</p>
        </div>
        <Button onClick={() => setModalNovaAberto(true)}>Nova meta</Button>
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          ))}
        </div>
      )}

      {estado === "vazio" && (
        <div className="rounded-xl border border-dashed border-graphite-300 bg-surface p-10 text-center">
          <p className="text-sm text-graphite-500">Nenhuma meta cadastrada ainda.</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar as metas.
          </p>
        </div>
      )}

      {estado === "sucesso" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metas.map((meta) => (
            <div key={meta.id} className="flex flex-col gap-3 rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-graphite-900">{meta.nome}</p>
                  {meta.categoria && <p className="text-xs text-graphite-400">{meta.categoria.nome}</p>}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    meta.status === "CONCLUIDA" ? "bg-success-50 text-success-600" : "bg-graphite-100 text-graphite-600"
                  }`}
                >
                  {meta.status === "CONCLUIDA" ? "Concluída" : "Em andamento"}
                </span>
              </div>

              <div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-graphite-100">
                  <div
                    className={`h-full rounded-full ${meta.status === "CONCLUIDA" ? "bg-success-500" : "bg-navy-600"}`}
                    style={{ width: `${meta.percentual}%` }}
                  />
                </div>
                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="numero-destaque font-semibold text-graphite-900">{formatarMoeda(meta.valorAtual)}</span>
                  <span className="text-xs text-graphite-400">de {formatarMoeda(meta.valorAlvo)}</span>
                </div>
              </div>

              {meta.status === "EM_ANDAMENTO" && (
                <p className="text-xs text-graphite-500">
                  Aporte sugerido: <strong>{formatarMoeda(meta.aporteMensalSugerido)}</strong>/mês por{" "}
                  {meta.mesesRestantes} {meta.mesesRestantes === 1 ? "mês" : "meses"}
                </p>
              )}

              <p className="text-xs text-graphite-400">Meta para {formatarData(meta.dataAlvo)}</p>

              <div className="flex justify-end gap-3 border-t border-graphite-100 pt-3 text-sm">
                {meta.status === "EM_ANDAMENTO" && (
                  <button type="button" onClick={() => abrirAporte(meta)} className="text-navy-600 hover:underline">
                    Aportar
                  </button>
                )}
                <button type="button" onClick={() => setMetaExcluindo(meta)} className="text-danger-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MetaFormModal open={modalNovaAberto} onClose={() => setModalNovaAberto(false)} onSalvo={recarregar} />

      <MetaAporteModal
        key={chaveModalAporte}
        open={Boolean(metaAportando)}
        onClose={() => setMetaAportando(null)}
        meta={metaAportando}
        onSalvo={recarregar}
      />

      <Modal
        open={Boolean(metaExcluindo)}
        onClose={() => setMetaExcluindo(null)}
        title="Excluir meta"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setMetaExcluindo(null)} disabled={excluindo}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" loading={excluindo} onClick={confirmarExclusao}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-graphite-600">
          Tem certeza que deseja excluir <strong>&ldquo;{metaExcluindo?.nome}&rdquo;</strong>?
        </p>
      </Modal>
    </div>
  );
}
