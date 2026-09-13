import type { ComponenteScoreDto } from "@/features/inteligencia/api";

const CENTRO = 120;
const RAIO = 78;

function ponto(indice: number, total: number, proporcao: number) {
  const angulo = -Math.PI / 2 + (indice * Math.PI * 2) / total;
  return `${CENTRO + Math.cos(angulo) * RAIO * proporcao},${CENTRO + Math.sin(angulo) * RAIO * proporcao}`;
}

function poligono(total: number, proporcao: number) {
  return Array.from({ length: total }, (_, indice) => ponto(indice, total, proporcao)).join(" ");
}

export function HealthRadar({ componentes }: { componentes: ComponenteScoreDto[] }) {
  const total = componentes.length;
  const dados = componentes
    .map((componente, indice) => ponto(indice, total, componente.pontuacao / componente.pontuacaoMaxima))
    .join(" ");

  return (
    <div className="flex flex-col items-center" aria-label="Gráfico das dimensões da saúde financeira">
      <svg viewBox="0 0 240 240" className="w-full max-w-64" role="img">
        <title>Desempenho nas dimensões da saúde financeira</title>
        {[0.25, 0.5, 0.75, 1].map((nivel) => (
          <polygon key={nivel} points={poligono(total, nivel)} fill="none" stroke="currentColor" className="text-white/15" strokeWidth="1" />
        ))}
        {componentes.map((_, indice) => {
          const [x2, y2] = ponto(indice, total, 1).split(",");
          return <line key={indice} x1={CENTRO} y1={CENTRO} x2={x2} y2={y2} stroke="currentColor" className="text-white/15" />;
        })}
        <polygon points={dados} fill="rgba(21,154,156,.34)" stroke="#38c6c8" strokeWidth="2.5" strokeLinejoin="round" />
        {componentes.map((componente, indice) => {
          const [cx, cy] = ponto(indice, total, componente.pontuacao / componente.pontuacaoMaxima).split(",");
          return <circle key={componente.chave} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#159a9c" strokeWidth="2" />;
        })}
      </svg>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {componentes.map((componente) => (
          <div key={componente.chave} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-navy-100">{componente.nome}</span>
            <span className="numero-destaque font-semibold text-white">{Math.round((componente.pontuacao / componente.pontuacaoMaxima) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
