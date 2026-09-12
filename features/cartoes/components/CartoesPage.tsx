"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IconPlus } from "@/components/ui/icons";
import { CartaoCard } from "@/features/cartoes/components/CartaoCard";
import { CartaoFormModal } from "@/features/cartoes/components/CartaoFormModal";
import { excluirCartao, listarCartoes, type CartaoDto } from "@/features/cartoes/api";

export function CartoesPage() {
  const [cartoes, setCartoes] = useState<CartaoDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "vazio" | "erro" | "sucesso">("carregando");
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [chaveModal, setChaveModal] = useState(0);
  const [cartaoEditando, setCartaoEditando] = useState<CartaoDto | null>(null);
  const [cartaoExcluindo, setCartaoExcluindo] = useState<CartaoDto | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const resposta = await listarCartoes();
        if (cancelado) return;
        if (!resposta.sucesso || !resposta.dados) {
          setEstado("erro");
          return;
        }
        setCartoes(resposta.dados);
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

  function handleNovo() {
    setCartaoEditando(null);
    setChaveModal((k) => k + 1);
    setModalAberto(true);
  }

  function handleEditar(cartao: CartaoDto) {
    setCartaoEditando(cartao);
    setChaveModal((k) => k + 1);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!cartaoExcluindo) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      const resposta = await excluirCartao(cartaoExcluindo.id);
      if (!resposta.sucesso) {
        setErroExclusao(resposta.erro?.mensagem ?? "Não foi possível excluir o cartão.");
        return;
      }
      setCartaoExcluindo(null);
      recarregar();
    } catch {
      setErroExclusao("Falha de conexão. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-graphite-900">Cartões</h1>
          <p className="mt-1 text-sm text-graphite-500">Limite, fechamento e faturas dos seus cartões.</p>
        </div>
        <Button onClick={handleNovo}>
          <IconPlus className="size-4" />
          Novo cartão
        </Button>
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          ))}
        </div>
      )}

      {estado === "vazio" && (
        <div className="rounded-lg border border-dashed border-graphite-300 bg-surface p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-graphite-700">Nenhum cartão cadastrado ainda.</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-10 text-center shadow-sm">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar os cartões.
          </p>
        </div>
      )}

      {estado === "sucesso" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cartoes.map((cartao) => (
            <CartaoCard
              key={cartao.id}
              cartao={cartao}
              onEditar={() => handleEditar(cartao)}
              onExcluir={() => setCartaoExcluindo(cartao)}
            />
          ))}
        </div>
      )}

      <CartaoFormModal
        key={chaveModal}
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        cartaoEditando={cartaoEditando}
        onSalvo={recarregar}
      />

      <Modal
        open={Boolean(cartaoExcluindo)}
        onClose={() => setCartaoExcluindo(null)}
        title="Excluir cartão"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setErroExclusao(null);
                setCartaoExcluindo(null);
              }}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button type="button" variant="danger" loading={excluindo} onClick={confirmarExclusao}>
              Excluir
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
          Tem certeza que deseja excluir <strong>&ldquo;{cartaoExcluindo?.nome}&rdquo;</strong>? Todas as faturas e
          compras associadas também serão excluídas.
        </p>
      </Modal>
    </div>
  );
}
