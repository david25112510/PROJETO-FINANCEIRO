"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { pagarFatura, type FaturaDto } from "@/features/cartoes/api";
import { formatarMoeda } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  fatura: FaturaDto | null;
  onSalvo: () => void;
};

export function PagamentoFaturaModal({ open, onClose, fatura, onSalvo }: Props) {
  const saldoDevedor = fatura ? fatura.valorTotal - fatura.valorPago : 0;

  const [valor, setValor] = useState(saldoDevedor > 0 ? saldoDevedor.toFixed(2) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!fatura) return;
    const valorNumerico = Number(valor.replace(",", "."));
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await pagarFatura(fatura.id, valorNumerico);
      if (!resposta.sucesso) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível registrar o pagamento.");
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
      title="Pagar fatura"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-pagamento" loading={salvando}>
            Confirmar pagamento
          </Button>
        </>
      }
    >
      <form id="form-pagamento" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erro && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}

        <p className="text-sm text-graphite-600">
          Saldo devedor: <strong>{formatarMoeda(saldoDevedor)}</strong>
        </p>

        <FormField
          label="Valor a pagar (R$)"
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={salvando}
        />
      </form>
    </Modal>
  );
}
