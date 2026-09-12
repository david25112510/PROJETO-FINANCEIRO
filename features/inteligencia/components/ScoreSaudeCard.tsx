import type { NivelSaude, ScoreSaudeDto } from "@/features/inteligencia/api";

const ROTULO_NIVEL: Record<NivelSaude, string> = {
  critico: "Crítico",
  atencao: "Atenção",
  bom: "Bom",
  excelente: "Excelente",
};

const COR_NIVEL: Record<NivelSaude, string> = {
  critico: "text-danger-600",
  atencao: "text-warning-600",
  bom: "text-navy-600",
  excelente: "text-success-600",
};

const COR_BARRA_NIVEL: Record<NivelSaude, string> = {
  critico: "bg-danger-500",
  atencao: "bg-warning-500",
  bom: "bg-navy-600",
  excelente: "bg-success-500",
};

export function ScoreSaudeCard({ score }: { score: ScoreSaudeDto }) {
  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-graphite-500">Score de saúde financeira</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="numero-destaque text-4xl font-semibold text-graphite-900">{score.score}</span>
            <span className="text-sm text-graphite-400">/ 100</span>
          </div>
        </div>
        <span className={`rounded-full bg-graphite-50 px-3 py-1 text-sm font-medium ${COR_NIVEL[score.nivel]}`}>
          {ROTULO_NIVEL[score.nivel]}
        </span>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-graphite-100">
        <div className={`h-full rounded-full ${COR_BARRA_NIVEL[score.nivel]}`} style={{ width: `${score.score}%` }} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {score.componentes.map((componente) => {
          const percentual = Math.round((componente.pontuacao / componente.pontuacaoMaxima) * 100);
          return (
            <div key={componente.chave}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-graphite-700">{componente.nome}</span>
                <span className="text-graphite-500">
                  {componente.pontuacao}/{componente.pontuacaoMaxima}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-graphite-100">
                <div className="h-full rounded-full bg-navy-500" style={{ width: `${percentual}%` }} />
              </div>
              <p className="mt-1 text-xs text-graphite-400">{componente.descricao}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
