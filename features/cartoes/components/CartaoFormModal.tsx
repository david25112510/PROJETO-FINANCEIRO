"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { atualizarCartao, criarCartao, type CartaoDto } from "@/features/cartoes/api";

type Props = {
  open: boolean;
  onClose: () => void;
  cartaoEditando: CartaoDto | null;
  onSalvo: () => void;
};

export function CartaoFormModal({ open, onClose, cartaoEditando, onSalvo }: Props) {
  const editando = Boolean(cartaoEditando);

  const [nome, setNome] = useState(cartaoEditando?.nome ?? "");
  const [bandeira, setBandeira] = useState(cartaoEditando?.bandeira ?? "");
  const [limite, setLimite] = useState(cartaoEditando ? String(cartaoEditando.limite) : "");
  const [diaFechamento, setDiaFechamento] = useState(cartaoEditando ? String(cartaoEditando.diaFechamento) : "1");
  const [diaVencimento, setDiaVencimento] = useState(cartaoEditando ? String(cartaoEditando.diaVencimento) : "10");
  const [cor, setCor] = useState(cartaoEditando?.cor ?? "#2c4a86");

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroGeral(null);

    const novosErros: Record<string, string> = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do cartão.";
    const limiteNumerico = Number(limite.replace(",", "."));
    if (!limite || Number.isNaN(limiteNumerico) || limiteNumerico <= 0) {
      novosErros.limite = "Informe um limite maior que zero.";
    }
    const fechamento = Number(diaFechamento);
    const vencimento = Number(diaVencimento);
    if (!fechamento || fechamento < 1 || fechamento > 31) novosErros.diaFechamento = "Dia inválido (1-31).";
    if (!vencimento || vencimento < 1 || vencimento > 31) novosErros.diaVencimento = "Dia inválido (1-31).";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const valores = {
        nome: nome.trim(),
        bandeira: bandeira.trim() || undefined,
        limite: limiteNumerico,
        diaFechamento: fechamento,
        diaVencimento: vencimento,
        cor,
      };

      const resposta = editando && cartaoEditando ? await atualizarCartao(cartaoEditando.id, valores) : await criarCartao(valores);

      if (!resposta.sucesso) {
        setErroGeral(resposta.erro?.mensagem ?? "Não foi possível salvar.");
        return;
      }

      onSalvo();
      onClose();
    } catch {
      setErroGeral("Falha de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editando ? "Editar cartão" : "Novo cartão"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cartao" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-cartao" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erroGeral && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erroGeral}
          </p>
        )}

        <div className="flex items-end gap-3">
          <FormField
            label="Nome do cartão"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={erros.nome}
            disabled={salvando}
            className="flex-1"
            placeholder="Ex.: Nubank, Itaú Platinum..."
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cartao-cor" className="text-sm font-medium text-graphite-700">
              Cor
            </label>
            <input
              id="cartao-cor"
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              disabled={salvando}
              className="h-[42px] w-14 cursor-pointer rounded-lg border border-graphite-200"
            />
          </div>
        </div>

        <FormField
          label="Bandeira (opcional)"
          value={bandeira}
          onChange={(e) => setBandeira(e.target.value)}
          disabled={salvando}
          placeholder="Ex.: Visa, Mastercard..."
        />

        <FormField
          label="Limite (R$)"
          type="number"
          step="0.01"
          min="0"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          error={erros.limite}
          disabled={salvando}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            label="Dia de fechamento"
            type="number"
            min="1"
            max="31"
            value={diaFechamento}
            onChange={(e) => setDiaFechamento(e.target.value)}
            error={erros.diaFechamento}
            disabled={salvando}
          />
          <FormField
            label="Dia de vencimento"
            type="number"
            min="1"
            max="31"
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
            error={erros.diaVencimento}
            disabled={salvando}
          />
        </div>
      </form>
    </Modal>
  );
}
