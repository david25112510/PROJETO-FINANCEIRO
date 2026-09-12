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
          <p className={`text-sm font-semibold ${COR_TITULO[insight.severidade]}`}>{insight.titulo}</p>
          <p className="mt-1 text-sm text-graphite-600">{insight.mensagem}</p>
        </div>
      ))}
    </div>
  );
}
