import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { compraRepository } from "@/repositories/compraRepository";
import { cartaoService } from "@/services/cartoes/cartaoService";
import { dividaService } from "@/services/dividas/dividaService";
import { metaService } from "@/services/metas/metaService";

export type NivelSaude = "critico" | "atencao" | "bom" | "excelente";

export type ComponenteScore = {
  chave: string;
  nome: string;
  pontuacao: number;
  pontuacaoMaxima: number;
  descricao: string;
};

export type ScoreSaude = {
  score: number;
  nivel: NivelSaude;
  componentes: ComponenteScore[];
};

const MESES_MEDIA_RECEITA = 3;

function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10;
}

async function receitaMediaMensal(userId: string): Promise<number> {
  const hoje = new Date();
  let total = 0;
  for (let i = 0; i < MESES_MEDIA_RECEITA; i++) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59, 999);
    total += await receitaRepository.somaPorPeriodo(userId, inicio, fim);
  }
  return total / MESES_MEDIA_RECEITA;
}

async function taxaPoupancaMedia(userId: string): Promise<number> {
  const hoje = new Date();
  let receitas = 0;
  let despesas = 0;
  for (let i = 0; i < MESES_MEDIA_RECEITA; i++) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const [r, d, c] = await Promise.all([
      receitaRepository.somaPorPeriodo(userId, inicio, fim),
      despesaRepository.somaPorPeriodo(userId, inicio, fim),
      compraRepository.somaPorPeriodo(userId, inicio, fim),
    ]);
    receitas += r;
    despesas += d + c;
  }
  if (receitas === 0) return 0;
  return (receitas - despesas) / receitas;
}

function nivelPorScore(score: number): NivelSaude {
  if (score >= 80) return "excelente";
  if (score >= 60) return "bom";
  if (score >= 40) return "atencao";
  return "critico";
}

export const scoreSaudeService = {
  async calcular(userId: string): Promise<ScoreSaude> {
    const [taxaPoupanca, cartoes, dividas, metas, receitaMedia] = await Promise.all([
      taxaPoupancaMedia(userId),
      cartaoService.listar(userId),
      dividaService.listar(userId),
      metaService.listar(userId),
      receitaMediaMensal(userId),
    ]);

    // 1. Taxa de poupança (35 pts) — 20% de poupança já pontua o máximo.
    const pontosPoupanca = clamp((taxaPoupanca / 0.2) * 35, 0, 35);

    // 2. Uso de crédito (25 pts) — média do percentual usado dos cartões ativos.
    const cartoesAtivos = cartoes.filter((c) => c.ativo);
    const usoMedioCredito =
      cartoesAtivos.length > 0
        ? cartoesAtivos.reduce((soma, c) => soma + Math.min(1, c.percentualUsado), 0) / cartoesAtivos.length
        : 0;
    const pontosCredito = cartoesAtivos.length > 0 ? clamp((1 - usoMedioCredito) * 25, 0, 25) : 25;

    // 3. Endividamento (25 pts) — dívidas ativas em relação à receita mensal média.
    const dividasAtivas = dividas.filter((d) => d.status === "ATIVA");
    const totalDividasAtivas = dividasAtivas.reduce((soma, d) => soma + d.valorAtual, 0);
    const razaoEndividamento = receitaMedia > 0 ? totalDividasAtivas / receitaMedia : totalDividasAtivas > 0 ? 3 : 0;
    const pontosEndividamento = dividasAtivas.length > 0 ? clamp((1 - razaoEndividamento / 3) * 25, 0, 25) : 25;

    // 4. Progresso de metas (15 pts) — média do percentual concluído das metas em andamento.
    const metasAtivas = metas.filter((m) => m.status === "EM_ANDAMENTO");
    const pontosMetas =
      metasAtivas.length > 0
        ? clamp((metasAtivas.reduce((soma, m) => soma + m.percentual, 0) / metasAtivas.length / 100) * 15, 0, 15)
        : 10;

    const componentes: ComponenteScore[] = [
      {
        chave: "poupanca",
        nome: "Taxa de poupança",
        pontuacao: arredondar(pontosPoupanca),
        pontuacaoMaxima: 35,
        descricao: `Média dos últimos ${MESES_MEDIA_RECEITA} meses: ${(taxaPoupanca * 100).toFixed(1)}% da renda poupada.`,
      },
      {
        chave: "credito",
        nome: "Uso do limite de cartão",
        pontuacao: arredondar(pontosCredito),
        pontuacaoMaxima: 25,
        descricao:
          cartoesAtivos.length > 0
            ? `Uso médio de ${(usoMedioCredito * 100).toFixed(0)}% do limite entre ${cartoesAtivos.length} cartão(ões).`
            : "Nenhum cartão ativo cadastrado.",
      },
      {
        chave: "endividamento",
        nome: "Endividamento",
        pontuacao: arredondar(pontosEndividamento),
        pontuacaoMaxima: 25,
        descricao:
          dividasAtivas.length > 0
            ? `Dívidas ativas equivalem a ${razaoEndividamento.toFixed(1)}x a renda mensal média.`
            : "Nenhuma dívida ativa.",
      },
      {
        chave: "metas",
        nome: "Progresso de metas",
        pontuacao: arredondar(pontosMetas),
        pontuacaoMaxima: 15,
        descricao:
          metasAtivas.length > 0
            ? `${metasAtivas.length} meta(s) em andamento, progresso médio de ${(
                metasAtivas.reduce((soma, m) => soma + m.percentual, 0) / metasAtivas.length
              ).toFixed(0)}%.`
            : "Nenhuma meta em andamento.",
      },
    ];

    const score = Math.round(componentes.reduce((soma, c) => soma + c.pontuacao, 0));

    return { score: clamp(score, 0, 100), nivel: nivelPorScore(score), componentes };
  },
};
