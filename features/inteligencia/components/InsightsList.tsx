import type { InsightDto, SeveridadeInsight } from "@/features/inteligencia/api";

const ESTILO_SEVERIDADE: Record<SeveridadeInsight, string> = {
  critico: "border-danger-200 bg-danger-50",
  atencao: "border-warning-200 bg-warning-50",
  info: "border-navy-100 bg-navy-50",
};

const COR_TITULO: Record<SeveridadeInsight, string> = {
  critico: "text-danger-600",
  atencao: "text-warning-600",
  info: "text-navy-600",
};

const ROTULO: Record<SeveridadeInsight, string> = {
  critico: "Ação imediata",
  atencao: "Acompanhar",
  info: "Oportunidade",
};

const ACAO_POR_TIPO: Record<string, string> = {
  AUMENTO_CATEGORIA: "Compare os lançamentos desta categoria e ajuste o limite do próximo mês.",
  LIMITE_CARTAO: "Evite novas compras neste cartão e confira a data de fechamento da fatura.",
  QUITACAO_DIVIDA: "Abra a área de dívidas e compare a economia antes de antecipar o pagamento.",
  META_ATRASADA: "Revise o prazo ou programe um aporte que caiba no orçamento atual.",
  TAXA_POUPANCA_BAIXA: "Use o simulador abaixo para encontrar uma redução mensal viável.",
};

export function InsightsList({ insights }: { insights: InsightDto[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-graphite-300 bg-surface p-8 text-center">
        <p className="text-sm text-graphite-500">Nenhum ponto de atenção encontrado — continue assim.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight, i) => (
        <div key={`${insight.tipo}-${i}`} className={`rounded-xl border p-4 ${ESTILO_SEVERIDADE[insight.severidade]}`}>
          <div className="flex items-start gap-3">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm ${COR_TITULO[insight.severidade]}`}>{i + 1}</span>
            <div className="min-w-0">
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${COR_TITULO[insight.severidade]}`}>{ROTULO[insight.severidade]}</span>
              <p className="mt-0.5 text-sm font-semibold text-graphite-900">{insight.titulo}</p>
              <p className="mt-1 text-sm leading-5 text-graphite-600">{insight.mensagem}</p>
              {ACAO_POR_TIPO[insight.tipo] && <p className="mt-2 border-t border-black/5 pt-2 text-xs font-medium leading-5 text-graphite-600">Próxima ação: {ACAO_POR_TIPO[insight.tipo]}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
