"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { quitarDivida, simularQuitacao, type DividaDto, type SimulacaoQuitacaoDto } from "@/features/dividas/api";
import { formatarMoeda } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  divida: DividaDto | null;
  onSalvo: () => void;
};

export function DividaQuitacaoModal({ open, onClose, divida, onSalvo }: Props) {
  const [simulacao, setSimulacao] = useState<SimulacaoQuitacaoDto | null>(null);
  const [carregandoSimulacao, setCarregandoSimulacao] = useState(false);

  const [valor, setValor] = useState(divida ? String(divida.valorAtual) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open || !divida) return;
    let cancelado = false;

    async function carregar() {
      setCarregandoSimulacao(true);
      try {
        const resposta = await simularQuitacao(divida!.id);
        if (!cancelado && resposta.sucesso && resposta.dados) setSimulacao(resposta.dados);
      } finally {
        if (!cancelado) setCarregandoSimulacao(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [open, divida]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    if (!divida) return;

    const valorNumerico = Number(valor.replace(",", "."));
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await quitarDivida(divida.id, valorNumerico);
      if (!resposta.sucesso) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível registrar a quitação.");
        return;
      }
      onSalvo();
      onClose();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quitar dívida"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-quitacao" loading={salvando}>
            Confirmar
          </Button>
        </>
      }
    >
      <form id="form-quitacao" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erro && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}

        {carregandoSimulacao && <div className="h-20 animate-pulse rounded-lg bg-graphite-100" />}

        {!carregandoSimulacao && simulacao && (
          <div className="rounded-lg border border-success-50 bg-success-50 p-4">
            <p className="text-sm text-graphite-700">
              Quitando hoje por <strong>{formatarMoeda(simulacao.valorQuitacaoHoje)}</strong>, em vez de{" "}
              {simulacao.parcelasRestantes} parcelas somando {formatarMoeda(simulacao.totalSeContinuar)}, você
              economiza:
            </p>
            <p className="numero-destaque mt-1 text-xl font-semibold text-success-600">
              {formatarMoeda(simulacao.economiaEstimada)}
            </p>
          </div>
        )}

        {!carregandoSimulacao && !simulacao && (
          <p className="text-sm text-graphite-500">
            Cadastre parcelas restantes e valor da parcela nesta dívida para ver a simulação de economia.
          </p>
        )}

        <FormField
          label="Valor a quitar agora (R$)"
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={salvando}
        />
        <p className="-mt-2 text-xs text-graphite-400">
          Informe um valor menor que o saldo devedor para uma quitação parcial.
        </p>
      </form>
    </Modal>
  );
}
