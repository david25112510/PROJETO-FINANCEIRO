"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { aportarMeta, type MetaDto } from "@/features/metas/api";
import { formatarMoeda } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  meta: MetaDto | null;
  onSalvo: () => void;
};

export function MetaAporteModal({ open, onClose, meta, onSalvo }: Props) {
  const [valor, setValor] = useState(meta ? String(meta.aporteMensalSugerido) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    if (!meta) return;

    const valorNumerico = Number(valor.replace(",", "."));
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await aportarMeta(meta.id, valorNumerico);
      if (!resposta.sucesso) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível registrar o aporte.");
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
      title="Registrar aporte"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-aporte" loading={salvando}>
            Confirmar
          </Button>
        </>
      }
    >
      <form id="form-aporte" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erro && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}

        {meta && (
          <p className="text-sm text-graphite-600">
            Faltam <strong>{formatarMoeda(meta.faltante)}</strong> para atingir a meta. Sugestão de aporte mensal
            (para chegar até a data-alvo): <strong>{formatarMoeda(meta.aporteMensalSugerido)}</strong>.
          </p>
        )}

        <FormField
          label="Valor do aporte (R$)"
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
