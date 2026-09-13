import type { PontoProjecaoDto } from "@/features/inteligencia/api";
import { formatarMoeda } from "@/lib/format";

const W = 720;
const H = 250;
const PAD_X = 44;
const PAD_Y = 28;

function moedaCompacta(valor: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL", maximumFractionDigits: 1 }).format(valor);
}

export function ProjectionChart({ pontos }: { pontos: PontoProjecaoDto[] }) {
  const valores = [0, ...pontos.map((ponto) => ponto.saldoAcumulado)];
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const amplitude = Math.max(maximo - minimo, 1);
  const x = (indice: number) => PAD_X + (indice / Math.max(pontos.length - 1, 1)) * (W - PAD_X * 2);
  const y = (valor: number) => PAD_Y + ((maximo - valor) / amplitude) * (H - PAD_Y * 2);
  const linha = pontos.map((ponto, indice) => `${x(indice)},${y(ponto.saldoAcumulado)}`).join(" ");
  const base = y(0);
  const area = `${x(0)},${base} ${linha} ${x(pontos.length - 1)},${base}`;
  const positivo = pontos.at(-1)?.saldoAcumulado ? pontos.at(-1)!.saldoAcumulado >= 0 : true;
  const indicesRotulo = new Set([0, pontos.length - 1, ...pontos.map((_, i) => i).filter((i) => pontos.length <= 8 || i % Math.ceil(pontos.length / 6) === 0)]);

  return (
    <div className="depth-card rounded-2xl border border-white/80 bg-[linear-gradient(145deg,#fff,#f5fafb)] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Projeção acumulada</p>
          <p className={`numero-destaque mt-1 text-2xl font-semibold ${positivo ? "text-success-600" : "text-danger-600"}`}>{formatarMoeda(pontos.at(-1)?.saldoAcumulado ?? 0)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-graphite-500"><span className={`size-2.5 rounded-full ${positivo ? "bg-aqua-500" : "bg-danger-500"}`} />Saldo acumulado</div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[560px]" role="img" aria-label="Evolução mensal do saldo acumulado simulado">
          <defs>
            <linearGradient id="saldo-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={positivo ? "#159a9c" : "#d13c3c"} stopOpacity="0.32" />
              <stop offset="1" stopColor={positivo ? "#159a9c" : "#d13c3c"} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((nivel) => {
            const yy = PAD_Y + nivel * (H - PAD_Y * 2);
            const valor = maximo - nivel * amplitude;
            return <g key={nivel}><line x1={PAD_X} y1={yy} x2={W - PAD_X} y2={yy} stroke="#eceef1" /><text x={PAD_X - 8} y={yy + 4} textAnchor="end" fontSize="10" fill="#8b95a1">{moedaCompacta(valor)}</text></g>;
          })}
          <line x1={PAD_X} y1={base} x2={W - PAD_X} y2={base} stroke="#b9c0c9" strokeDasharray="4 4" />
          <polygon points={area} fill="url(#saldo-area)" />
          <polyline points={linha} fill="none" stroke={positivo ? "#159a9c" : "#d13c3c"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {pontos.map((ponto, indice) => (
            <g key={ponto.mes}>
              <circle cx={x(indice)} cy={y(ponto.saldoAcumulado)} r="4" fill="white" stroke={positivo ? "#159a9c" : "#d13c3c"} strokeWidth="2.5"><title>Mês {ponto.mes}: {formatarMoeda(ponto.saldoAcumulado)}</title></circle>
              {indicesRotulo.has(indice) && <text x={x(indice)} y={H - 7} textAnchor="middle" fontSize="10" fill="#626c78">M{ponto.mes}</text>}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
