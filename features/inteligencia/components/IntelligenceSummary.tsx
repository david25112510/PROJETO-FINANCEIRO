import type { InsightDto, ScoreSaudeDto } from "@/features/inteligencia/api";

export function IntelligenceSummary({ score, insights }: { score: ScoreSaudeDto; insights: InsightDto[] }) {
  const ordenados = [...score.componentes].sort(
    (a, b) => b.pontuacao / b.pontuacaoMaxima - a.pontuacao / a.pontuacaoMaxima,
  );
  const melhor = ordenados[0];
  const prioridade = ordenados.at(-1);
  const pontosDisponiveis = score.componentes.reduce((total, item) => total + item.pontuacaoMaxima - item.pontuacao, 0);
  const alertas = insights.filter((item) => item.severidade !== "info").length;
  const itens = [
    { rotulo: "Ponto mais forte", valor: melhor?.nome ?? "Sem dados", detalhe: melhor ? `${Math.round((melhor.pontuacao / melhor.pontuacaoMaxima) * 100)}% do potencial` : "" },
    { rotulo: "Prioridade atual", valor: prioridade?.nome ?? "Sem dados", detalhe: prioridade ? `${Math.round(prioridade.pontuacaoMaxima - prioridade.pontuacao)} pontos para evoluir` : "" },
    { rotulo: "Potencial de evolução", valor: `${Math.round(pontosDisponiveis)} pontos`, detalhe: "Soma das oportunidades no score" },
    { rotulo: "Pontos de atenção", valor: String(alertas), detalhe: alertas === 1 ? "Alerta que pede acompanhamento" : "Alertas que pedem acompanhamento" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {itens.map((item, indice) => (
        <div key={item.rotulo} className="depth-card relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-4 backdrop-blur sm:p-5">
          <span className="absolute right-4 top-4 text-3xl font-light text-aqua-500/15">0{indice + 1}</span>
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">{item.rotulo}</p>
          <p className="mt-2 text-lg font-semibold text-graphite-900">{item.valor}</p>
          <p className="mt-1 text-xs leading-5 text-graphite-500">{item.detalhe}</p>
        </div>
      ))}
    </div>
  );
}
