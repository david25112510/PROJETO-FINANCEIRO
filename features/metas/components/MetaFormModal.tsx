"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { criarMeta } from "@/features/metas/api";
import { listarCategorias, type CategoriaDto } from "@/features/lancamentos/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSalvo: () => void;
};

export function MetaFormModal({ open, onClose, onSalvo }: Props) {
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [dataAlvo, setDataAlvo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;

    async function carregar() {
      const [receitas, despesas] = await Promise.all([listarCategorias("RECEITA"), listarCategorias("DESPESA")]);
      if (cancelado) return;
      const todas = [...(receitas.dados ?? []), ...(despesas.dados ?? [])];
      setCategorias(todas);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroGeral(null);

    const novosErros: Record<string, string> = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome da meta.";
    const alvo = Number(valorAlvo.replace(",", "."));
    if (!valorAlvo || Number.isNaN(alvo) || alvo <= 0) novosErros.valorAlvo = "Informe um valor maior que zero.";
    if (!dataAlvo) novosErros.dataAlvo = "Informe a data-alvo.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const resposta = await criarMeta({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        valorAlvo: alvo,
        valorAtual: valorAtual ? Number(valorAtual.replace(",", ".")) : undefined,
        dataAlvo,
        categoriaId: categoriaId || null,
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
      title="Nova meta"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-meta" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-meta" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {erroGeral && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erroGeral}
          </p>
        )}

        <FormField
          label="Nome da meta"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          disabled={salvando}
          placeholder="Ex.: Reserva de emergência, Viagem..."
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Valor alvo (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valorAlvo}
            onChange={(e) => setValorAlvo(e.target.value)}
            error={erros.valorAlvo}
            disabled={salvando}
          />
          <FormField
            label="Já guardado (opcional)"
            type="number"
            step="0.01"
            min="0"
            value={valorAtual}
            onChange={(e) => setValorAtual(e.target.value)}
            disabled={salvando}
          />
        </div>

        <FormField
          label="Data-alvo"
          type="date"
          value={dataAlvo}
          onChange={(e) => setDataAlvo(e.target.value)}
          error={erros.dataAlvo}
          disabled={salvando}
        />

        <Select
          label="Categoria vinculada (opcional)"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          disabled={salvando}
        >
          <option value="">Sem categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome} ({categoria.tipo === "RECEITA" ? "receita" : "despesa"})
            </option>
          ))}
        </Select>

        <Textarea label="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={salvando} />
      </form>
    </Modal>
  );
}
