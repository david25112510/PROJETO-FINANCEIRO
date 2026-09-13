"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { criarCompra } from "@/features/cartoes/api";
import { criarCategoria, listarCategorias, type CategoriaDto } from "@/features/lancamentos/api";

type Props = {
  open: boolean;
  onClose: () => void;
  cartaoId: string;
  onSalvo: () => void;
};

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CompraFormModal({ open, onClose, cartaoId, onSalvo }: Props) {
  const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [categoriaId, setCategoriaId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState("2");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;

    async function carregar() {
      const resposta = await listarCategorias("DESPESA");
      if (!cancelado && resposta.sucesso && resposta.dados) setCategorias(resposta.dados);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [open]);

  async function handleCriarCategoria() {
    if (!novaCategoria.trim()) return;
    setCriandoCategoria(true);
    try {
      const resposta = await criarCategoria(novaCategoria.trim(), "DESPESA");
      if (resposta.sucesso && resposta.dados) {
        setCategorias((prev) => [...prev, resposta.dados!]);
        setCategoriaId(resposta.dados.id);
        setNovaCategoria("");
      } else {
        setErroGeral(resposta.erro?.mensagem ?? "Não foi possível criar a categoria.");
      }
    } finally {
      setCriandoCategoria(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroGeral(null);

    const novosErros: Record<string, string> = {};
    if (!descricao.trim()) novosErros.descricao = "Informe a descrição.";
    const valorNumerico = Number(valor.replace(",", "."));
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      novosErros.valor = "Informe um valor maior que zero.";
    }
    if (!data) novosErros.data = "Informe a data.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const resposta = await criarCompra(cartaoId, {
        categoriaId: categoriaId || null,
        descricao: descricao.trim(),
        valor: valorNumerico,
        data,
        observacoes: observacoes.trim() || undefined,
        totalParcelas: parcelado ? Number(totalParcelas) : undefined,
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
      title="Nova compra"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-compra" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-compra" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            error={erros.valor}
            disabled={salvando}
          />
          <FormField
            label="Data da compra"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            error={erros.data}
            disabled={salvando}
          />
        </div>

        <Select label="Categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} disabled={salvando}>
          <option value="">Sem categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <FormField
            label="Nova categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            disabled={salvando || criandoCategoria}
            placeholder="Ex.: Mercado, Assinaturas..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleCriarCategoria}
            loading={criandoCategoria}
            disabled={salvando || !novaCategoria.trim()}
          >
            Adicionar
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm text-graphite-700">
          <input
            type="checkbox"
            checked={parcelado}
            onChange={(e) => setParcelado(e.target.checked)}
            disabled={salvando}
            className="h-4 w-4 rounded border-graphite-300"
          />
          Compra parcelada
        </label>

        {parcelado && (
          <FormField
            label="Número de parcelas"
            type="number"
            min="2"
            max="60"
            value={totalParcelas}
            onChange={(e) => setTotalParcelas(e.target.value)}
            disabled={salvando}
          />
        )}

        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={salvando} />
      </form>
    </Modal>
  );
}
