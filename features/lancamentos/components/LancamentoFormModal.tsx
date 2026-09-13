"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  atualizarLancamento,
  criarCategoria,
  criarLancamento,
  type CategoriaDto,
  type LancamentoDto,
  type Recurso,
  type TipoCategoria,
} from "@/features/lancamentos/api";
import { sugerirCategoria, type SugestaoCategoriaDto } from "@/features/inteligencia/api";

const FREQUENCIAS = [
  { valor: "SEMANAL", rotulo: "Semanal" },
  { valor: "MENSAL", rotulo: "Mensal" },
  { valor: "BIMESTRAL", rotulo: "Bimestral" },
  { valor: "TRIMESTRAL", rotulo: "Trimestral" },
  { valor: "SEMESTRAL", rotulo: "Semestral" },
  { valor: "ANUAL", rotulo: "Anual" },
];

type Repeticao = "unico" | "recorrente" | "parcelado";

type Props = {
  open: boolean;
  onClose: () => void;
  recurso: Recurso;
  tipoCategoria: TipoCategoria;
  categorias: CategoriaDto[];
  onCategoriaCriada: (categoria: CategoriaDto) => void;
  lancamentoEditando: LancamentoDto | null;
  onSalvo: () => void;
};

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LancamentoFormModal({
  open,
  onClose,
  recurso,
  tipoCategoria,
  categorias,
  onCategoriaCriada,
  lancamentoEditando,
  onSalvo,
}: Props) {
  const editando = Boolean(lancamentoEditando);

  // O componente pai remonta este modal (via `key`) a cada abertura, então
  // inicializar o estado direto a partir da prop substitui um efeito de reset.
  const [descricao, setDescricao] = useState(lancamentoEditando?.descricao ?? "");
  const [valor, setValor] = useState(lancamentoEditando ? String(lancamentoEditando.valor) : "");
  const [data, setData] = useState(lancamentoEditando ? lancamentoEditando.data.slice(0, 10) : hoje());
  const [categoriaId, setCategoriaId] = useState(lancamentoEditando?.categoriaId ?? "");
  const [observacoes, setObservacoes] = useState(lancamentoEditando?.observacoes ?? "");
  const [repeticao, setRepeticao] = useState<Repeticao>("unico");
  const [frequencia, setFrequencia] = useState("MENSAL");
  const [totalParcelas, setTotalParcelas] = useState("2");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [sugestao, setSugestao] = useState<SugestaoCategoriaDto | null>(null);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const termo = descricao.trim();
    if (editando || categoriaId || termo.length < 3) return;

    let cancelado = false;
    const timer = setTimeout(async () => {
      const resposta = await sugerirCategoria(termo, tipoCategoria);
      if (!cancelado && resposta.sucesso && resposta.dados) {
        setSugestao(resposta.dados);
      }
    }, 500);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [descricao, categoriaId, editando, tipoCategoria]);

  function usarSugestao() {
    if (!sugestao) return;
    setCategoriaId(sugestao.categoriaId);
    setSugestao(null);
  }

  async function handleCriarCategoria() {
    if (!novaCategoria.trim()) return;
    setCriandoCategoria(true);
    try {
      const resposta = await criarCategoria(novaCategoria.trim(), tipoCategoria);
      if (resposta.sucesso && resposta.dados) {
        onCategoriaCriada(resposta.dados);
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
      if (editando && lancamentoEditando) {
        const resposta = await atualizarLancamento(recurso, lancamentoEditando.id, {
          categoriaId: categoriaId || null,
          descricao: descricao.trim(),
          valor: valorNumerico,
          data,
          observacoes: observacoes.trim() || undefined,
        });
        if (!resposta.sucesso) {
          setErroGeral(resposta.erro?.mensagem ?? "Não foi possível salvar.");
          return;
        }
      } else {
        const resposta = await criarLancamento(recurso, {
          categoriaId: categoriaId || null,
          descricao: descricao.trim(),
          valor: valorNumerico,
          data,
          observacoes: observacoes.trim() || undefined,
          recorrente: repeticao === "recorrente",
          frequenciaRecorrencia: repeticao === "recorrente" ? frequencia : undefined,
          totalParcelas: repeticao === "parcelado" ? Number(totalParcelas) : undefined,
        });
        if (!resposta.sucesso) {
          setErroGeral(resposta.erro?.mensagem ?? "Não foi possível salvar.");
          return;
        }
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
      title={editando ? "Editar lançamento" : "Novo lançamento"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-lancamento" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-lancamento" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            error={erros.data}
            disabled={salvando}
          />
        </div>

        <Select
          label="Categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          disabled={salvando}
        >
          <option value="">Sem categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </Select>

        {sugestao && !categoriaId && (
          <div className="-mt-2 flex items-center justify-between rounded-lg bg-navy-50 px-3.5 py-2 text-sm">
            <span className="text-navy-700">
              Sugestão baseada no histórico: <strong>{sugestao.nome}</strong>
            </span>
            <button type="button" onClick={usarSugestao} className="font-medium text-navy-600 hover:underline">
              Usar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <FormField
            label="Nova categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            disabled={salvando || criandoCategoria}
            placeholder="Ex.: Salário, Aluguel..."
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

        {!editando && (
          <>
            <Select
              label="Repetição"
              value={repeticao}
              onChange={(e) => setRepeticao(e.target.value as Repeticao)}
              disabled={salvando}
            >
              <option value="unico">Lançamento único</option>
              <option value="recorrente">Recorrente</option>
              <option value="parcelado">Parcelado</option>
            </Select>

            {repeticao === "recorrente" && (
              <Select
                label="Frequência"
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                disabled={salvando}
              >
                {FREQUENCIAS.map((f) => (
                  <option key={f.valor} value={f.valor}>
                    {f.rotulo}
                  </option>
                ))}
              </Select>
            )}

            {repeticao === "parcelado" && (
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
          </>
        )}

        <Textarea
          label="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={salvando}
        />
      </form>
    </Modal>
  );
}
