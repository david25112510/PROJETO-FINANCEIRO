import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";

export type SugestaoCategoria = {
  categoriaId: string;
  nome: string;
  cor: string;
  ocorrencias: number;
};

const TAMANHO_MINIMO_TERMO = 3;

/**
 * Sugere uma categoria com base no histórico: procura lançamentos anteriores
 * do mesmo tipo com descrição semelhante e retorna a categoria mais usada
 * entre eles. Não usa aprendizado de máquina — é um casamento de texto
 * simples (contains, case-insensitive) sobre o histórico do próprio usuário.
 */
export const categorizacaoService = {
  async sugerir(userId: string, descricao: string, tipo: "RECEITA" | "DESPESA"): Promise<SugestaoCategoria | null> {
    const termo = descricao.trim();
    if (termo.length < TAMANHO_MINIMO_TERMO) return null;

    const contagens =
      tipo === "RECEITA"
        ? await receitaRepository.contarCategoriasPorDescricaoSimilar(userId, termo)
        : await despesaRepository.contarCategoriasPorDescricaoSimilar(userId, termo);

    if (contagens.length === 0) return null;

    const [maisFrequente] = contagens;
    const categoria = await categoriaRepository.findById(maisFrequente.categoriaId, userId);
    if (!categoria) return null;

    return {
      categoriaId: categoria.id,
      nome: categoria.nome,
      cor: categoria.cor,
      ocorrencias: maisFrequente.contagem,
    };
  },
};
