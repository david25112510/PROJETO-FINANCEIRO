"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { criarDivida } from "@/features/dividas/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSalvo: () => void;
};

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DividaFormModal({ open, onClose, onSalvo }: Props) {
  const [descricao, setDescricao] = useState("");
  const [credor, setCredor] = useState("");
  const [valorOriginal, setValorOriginal] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [taxaJurosMensal, setTaxaJurosMensal] = useState("");
  const [parcelasRestantes, setParcelasRestantes] = useState("");
  const [valorParcela, setValorParcela] = useState("");
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
    const original = Number(valorOriginal.replace(",", "."));
    if (!valorOriginal || Number.isNaN(original) || original <= 0) novosErros.valorOriginal = "Informe um valor maior que zero.";
    const atual = Number((valorAtual || valorOriginal).replace(",", "."));
    if (Number.isNaN(atual) || atual < 0) novosErros.valorAtual = "Saldo devedor inválido.";
    const taxa = Number(taxaJurosMensal.replace(",", "."));
    if (taxaJurosMensal === "" || Number.isNaN(taxa) || taxa < 0) novosErros.taxaJurosMensal = "Informe a taxa de juros.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const resposta = await criarDivida({
        descricao: descricao.trim(),
        credor: credor.trim() || undefined,
        valorOriginal: original,
        valorAtual: atual,
        taxaJurosMensal: taxa,
        parcelasRestantes: parcelasRestantes ? Number(parcelasRestantes) : undefined,
        valorParcela: valorParcela ? Number(valorParcela.replace(",", ".")) : undefined,
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
      title="Nova dívida"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-divida" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-divida" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
          placeholder="Ex.: Empréstimo pessoal, financiamento do irmão..."
        />

        <FormField
          label="Credor (opcional)"
          value={credor}
          onChange={(e) => setCredor(e.target.value)}
          disabled={salvando}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            label="Valor original (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valorOriginal}
            onChange={(e) => setValorOriginal(e.target.value)}
            error={erros.valorOriginal}
            disabled={salvando}
          />
          <FormField
            label="Saldo devedor hoje (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valorAtual}
            onChange={(e) => setValorAtual(e.target.value)}
            error={erros.valorAtual}
            disabled={salvando}
            placeholder="Igual ao original, se não informado"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <FormField
            label="Data de contratação"
            type="date"
            value={dataContratacao}
            onChange={(e) => setDataContratacao(e.target.value)}
            disabled={salvando}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            label="Parcelas restantes (opcional)"
            type="number"
            min="1"
            value={parcelasRestantes}
            onChange={(e) => setParcelasRestantes(e.target.value)}
            disabled={salvando}
          />
          <FormField
            label="Valor da parcela (opcional)"
            type="number"
            step="0.01"
            min="0"
            value={valorParcela}
            onChange={(e) => setValorParcela(e.target.value)}
            disabled={salvando}
          />
        </div>
        <p className="-mt-2 text-xs text-graphite-400">
          Informe parcelas restantes e valor da parcela para habilitar a simulação de quitação antecipada.
        </p>

        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={salvando} />
      </form>
    </Modal>
  );
}
