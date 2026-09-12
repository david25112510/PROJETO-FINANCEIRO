import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { compraRepository } from "@/repositories/compraRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import { cartaoService } from "@/services/cartoes/cartaoService";
import { dividaService } from "@/services/dividas/dividaService";
import { metaService } from "@/services/metas/metaService";
import { simularQuitacaoAntecipada } from "@/services/dividas/simulacaoQuitacaoService";
import { combinarTotaisPorCategoria } from "@/services/relatorios/relatorioService";

export type SeveridadeInsight = "info" | "atencao" | "critico";

export type Insight = {
  tipo: string;
  severidade: SeveridadeInsight;
  titulo: string;
  mensagem: string;
};

function inicioFimMes(offsetMeses: number) {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - offsetMeses, 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() - offsetMeses + 1, 0, 23, 59, 59, 999);
  return { inicio, fim };
}

async function insightsCategoriaDespesa(userId: string): Promise<Insight[]> {
  const atual = inicioFimMes(0);
  const anterior = inicioFimMes(1);

  const [despesasAtual, comprasAtual, despesasAnterior, comprasAnterior, categorias] = await Promise.all([
    despesaRepository.somaPorCategoria(userId, atual.inicio, atual.fim),
    compraRepository.somaPorCategoria(userId, atual.inicio, atual.fim),
    despesaRepository.somaPorCategoria(userId, anterior.inicio, anterior.fim),
    compraRepository.somaPorCategoria(userId, anterior.inicio, anterior.fim),
    categoriaRepository.findAllForUser(userId, "DESPESA"),
  ]);

  const mapaCategorias = new Map(categorias.map((c) => [c.id, c.nome]));
  const totalAtualPorCategoria = combinarTotaisPorCategoria(despesasAtual, comprasAtual);
  const totalAnteriorPorCategoria = new Map(
    combinarTotaisPorCategoria(despesasAnterior, comprasAnterior).map((t) => [t.categoriaId, t.total]),
  );

  const insights: Insight[] = [];
  for (const item of totalAtualPorCategoria) {
    const anteriorValor = totalAnteriorPorCategoria.get(item.categoriaId) ?? 0;
    if (anteriorValor < 50 || item.total < 50) continue;

    const variacao = ((item.total - anteriorValor) / anteriorValor) * 100;
    if (variacao >= 20) {
      const nome = item.categoriaId ? (mapaCategorias.get(item.categoriaId) ?? "Sem categoria") : "Sem categoria";
      insights.push({
        tipo: "AUMENTO_CATEGORIA",
        severidade: variacao >= 50 ? "critico" : "atencao",
        titulo: `Gastos com ${nome} subiram ${variacao.toFixed(0)}%`,
        mensagem: `Você gastou R$ ${item.total.toFixed(2)} com ${nome} este mês, contra R$ ${anteriorValor.toFixed(2)} no mês anterior.`,
      });
    }
  }
  return insights.slice(0, 3);
}

async function insightsLimiteCartao(userId: string): Promise<Insight[]> {
  const cartoes = await cartaoService.listar(userId);
  return cartoes
    .filter((c) => c.ativo && c.percentualUsado >= 0.8)
    .map((c) => ({
      tipo: "LIMITE_CARTAO",
      severidade: c.percentualUsado >= 1 ? "critico" : "atencao",
      titulo: c.percentualUsado >= 1 ? `Limite do cartão ${c.nome} estourado` : `Cartão ${c.nome} perto do limite`,
      mensagem: `Uso de ${(c.percentualUsado * 100).toFixed(0)}% do limite de R$ ${c.limite.toFixed(2)}.`,
    }));
}

async function insightsQuitacaoDivida(userId: string): Promise<Insight[]> {
  const dividas = await dividaService.listar(userId);
  const insights: Insight[] = [];

  for (const divida of dividas) {
    if (divida.status !== "ATIVA" || !divida.parcelasRestantes || !divida.valorParcela) continue;
    const simulacao = simularQuitacaoAntecipada(divida.valorAtual, divida.parcelasRestantes, divida.valorParcela);
    if (simulacao.economiaEstimada > 0) {
      insights.push({
        tipo: "QUITACAO_DIVIDA",
        severidade: "info",
        titulo: `Economize quitando "${divida.descricao}" antecipadamente`,
        mensagem: `Quitar hoje por R$ ${simulacao.valorQuitacaoHoje.toFixed(2)} economiza R$ ${simulacao.economiaEstimada.toFixed(2)} em juros futuros.`,
      });
    }
  }
  return insights.slice(0, 2);
}

async function insightsMetasAtrasadas(userId: string): Promise<Insight[]> {
  const metas = await metaService.listar(userId);
  const hoje = new Date();

  return metas
    .filter((m) => m.status === "EM_ANDAMENTO" && new Date(m.dataAlvo) < hoje)
    .map((m) => ({
      tipo: "META_ATRASADA",
      severidade: "atencao" as const,
      titulo: `Meta "${m.nome}" passou do prazo`,
      mensagem: `Prazo era ${new Date(m.dataAlvo).toLocaleDateString("pt-BR")} e o progresso está em ${m.percentual}%.`,
    }));
}

async function insightTaxaPoupanca(userId: string): Promise<Insight[]> {
  const { inicio, fim } = inicioFimMes(0);
  const [receitas, despesas, compras] = await Promise.all([
    receitaRepository.somaPorPeriodo(userId, inicio, fim),
    despesaRepository.somaPorPeriodo(userId, inicio, fim),
    compraRepository.somaPorPeriodo(userId, inicio, fim),
  ]);
  if (receitas <= 0) return [];

  const taxa = ((receitas - despesas - compras) / receitas) * 100;
  if (taxa >= 10) return [];

  return [
    {
      tipo: "TAXA_POUPANCA_BAIXA",
      severidade: taxa < 0 ? "critico" : "atencao",
      titulo: taxa < 0 ? "Você está gastando mais do que ganha este mês" : "Taxa de poupança abaixo do recomendado",
      mensagem: `Sua taxa de poupança este mês está em ${taxa.toFixed(1)}%. O recomendado é manter acima de 10-20%.`,
    },
  ];
}

export const insightsService = {
  async gerar(userId: string): Promise<Insight[]> {
    const grupos = await Promise.all([
      insightsCategoriaDespesa(userId),
      insightsLimiteCartao(userId),
      insightsQuitacaoDivida(userId),
      insightsMetasAtrasadas(userId),
      insightTaxaPoupanca(userId),
    ]);

    const ordemSeveridade: Record<SeveridadeInsight, number> = { critico: 0, atencao: 1, info: 2 };
    return grupos.flat().sort((a, b) => ordemSeveridade[a.severidade] - ordemSeveridade[b.severidade]);
  },
};
