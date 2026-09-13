import type { NivelSaude, ScoreSaudeDto } from "@/features/inteligencia/api";
import { HealthRadar } from "@/features/inteligencia/components/HealthRadar";

const ROTULO_NIVEL: Record<NivelSaude, string> = {
  critico: "Crítico",
  atencao: "Atenção",
  bom: "Bom",
  excelente: "Excelente",
};

const COR_NIVEL: Record<NivelSaude, string> = {
  critico: "text-danger-600 bg-danger-50",
  atencao: "text-warning-600 bg-warning-50",
  bom: "text-navy-600 bg-navy-50",
  excelente: "text-success-600 bg-success-50",
};

export function ScoreSaudeCard({ score }: { score: ScoreSaudeDto }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-graphite-200 bg-surface shadow-sm">
      <div className="grid bg-gradient-to-br from-ink via-navy-900 to-navy-700 p-5 text-white sm:grid-cols-[180px_1fr] sm:items-center sm:gap-6 sm:p-6">
        <div className="flex flex-col items-center sm:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aqua-500">Saúde financeira</p>
          <div
            className="relative mt-4 flex size-36 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#22b6b8 ${score.score * 3.6}deg, rgba(255,255,255,.12) 0deg)` }}
          >
            <div className="flex size-28 flex-col items-center justify-center rounded-full bg-navy-900 shadow-inner">
              <span className="numero-destaque text-4xl font-semibold">{score.score}</span>
              <span className="text-xs text-navy-100">de 100 pontos</span>
            </div>
          </div>
          <span className={`mt-4 rounded-full px-3 py-1 text-xs font-semibold ${COR_NIVEL[score.nivel]}`}>{ROTULO_NIVEL[score.nivel]}</span>
        </div>
        <HealthRadar componentes={score.componentes} />
      </div>

      <div className="grid gap-px bg-graphite-100 sm:grid-cols-2">
        {score.componentes.map((componente) => {
          const percentual = Math.round((componente.pontuacao / componente.pontuacaoMaxima) * 100);
          return (
            <div key={componente.chave} className="bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-graphite-800">{componente.nome}</p>
                <span className="numero-destaque text-xs font-semibold text-navy-600">{componente.pontuacao}/{componente.pontuacaoMaxima}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-graphite-100">
                <div className="h-full rounded-full bg-gradient-to-r from-navy-500 to-aqua-500" style={{ width: `${percentual}%` }} />
              </div>
              <p className="mt-2 text-xs leading-5 text-graphite-500">{componente.descricao}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
