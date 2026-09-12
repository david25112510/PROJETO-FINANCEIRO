"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { criarFinanciamento } from "@/features/financiamentos/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSalvo: () => void;
};

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FinanciamentoFormModal({ open, onClose, onSalvo }: Props) {
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [taxaJurosMensal, setTaxaJurosMensal] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("360");
  const [sistemaAmortizacao, setSistemaAmortizacao] = useState<"PRICE" | "SAC">("PRICE");
  const [dataContratacao, setDataContratacao] = useState(hoje());
  const [observacoes, setObservacoes] = useState("");

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroGeral(null);

    const novosErros: Record<string, string> = {};
    if (!descricao.trim()) novosErros.descricao = "Informe a descrição.";
    const valor = Number(valorTotal.replace(",", "."));
    if (!valorTotal || Number.isNaN(valor) || valor <= 0) novosErros.valorTotal = "Informe um valor maior que zero.";
    const taxa = Number(taxaJurosMensal.replace(",", "."));
    if (taxaJurosMensal === "" || Number.isNaN(taxa) || taxa < 0) novosErros.taxaJurosMensal = "Informe a taxa de juros.";
    const parcelas = Number(numeroParcelas);
    if (!parcelas || parcelas < 1) novosErros.numeroParcelas = "Informe o número de parcelas.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const resposta = await criarFinanciamento({
        descricao: descricao.trim(),
        valorTotal: valor,
        taxaJurosMensal: taxa,
        numeroParcelas: parcelas,
        sistemaAmortizacao,
        dataContratacao,
        observacoes: observacoes.trim() || undefined,
      });

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
      title="Novo financiamento"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-financiamento" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-financiamento" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erroGeral && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erroGeral}
          </p>
        )}

        <FormField
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          error={erros.descricao}
          disabled={salvando}
          placeholder="Ex.: Financiamento do apartamento, do carro..."
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Valor financiado (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            error={erros.valorTotal}
            disabled={salvando}
          />
          <FormField
            label="Taxa de juros mensal (%)"
            type="number"
            step="0.01"
            min="0"
            value={taxaJurosMensal}
            onChange={(e) => setTaxaJurosMensal(e.target.value)}
            error={erros.taxaJurosMensal}
            disabled={salvando}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Número de parcelas"
            type="number"
            min="1"
            max="600"
            value={numeroParcelas}
            onChange={(e) => setNumeroParcelas(e.target.value)}
            error={erros.numeroParcelas}
            disabled={salvando}
          />
          <Select
            label="Sistema de amortização"
            value={sistemaAmortizacao}
            onChange={(e) => setSistemaAmortizacao(e.target.value as "PRICE" | "SAC")}
            disabled={salvando}
          >
            <option value="PRICE">Price (parcelas fixas)</option>
            <option value="SAC">SAC (parcelas decrescentes)</option>
          </Select>
        </div>

        <FormField
          label="Data de contratação"
          type="date"
          value={dataContratacao}
          onChange={(e) => setDataContratacao(e.target.value)}
          disabled={salvando}
        />

        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={salvando} />
      </form>
    </Modal>
  );
}
