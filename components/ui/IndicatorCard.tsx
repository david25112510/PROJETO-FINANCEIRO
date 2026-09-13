export type EstadoComponente = "carregando" | "vazio" | "erro" | "sucesso";

type Tom = "neutro" | "sucesso" | "atencao" | "critico";

type IndicatorCardProps = {
  titulo: string;
  estado: EstadoComponente;
  valor?: string;
  descricao?: string;
  tom?: Tom;
  mensagemVazio?: string;
  mensagemErro?: string;
};

const corPorTom: Record<Tom, string> = {
  neutro: "text-graphite-900",
  sucesso: "text-aqua-600",
  atencao: "text-warning-600",
  critico: "text-danger-600",
};

const bordaPorTom: Record<Tom, string> = {
  neutro: "before:bg-graphite-300",
  sucesso: "before:bg-aqua-500",
  atencao: "before:bg-warning-500",
  critico: "before:bg-danger-500",
};

/**
 * Card de indicador — componente obrigatório do design system.
 * Trata explicitamente os 4 estados exigidos: carregando, vazio, erro, sucesso.
 */
export function IndicatorCard({
  titulo,
  estado,
  valor,
  descricao,
  tom = "neutro",
  mensagemVazio = "Sem dados ainda",
  mensagemErro = "Não foi possível carregar",
}: IndicatorCardProps) {
  return (
    <div
      className={`depth-card relative flex min-h-36 flex-col gap-2 overflow-hidden rounded-2xl border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,.96),rgba(247,250,253,.9))] p-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${bordaPorTom[tom]}`}
    >
      <span className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-aqua-500/[0.06] blur-xl" />
      <span className="text-sm font-medium text-graphite-500">{titulo}</span>

      {estado === "carregando" && (
        <div className="flex flex-col gap-2" role="status" aria-label={`Carregando ${titulo}`}>
          <div className="h-8 w-32 animate-pulse rounded bg-graphite-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-graphite-100" />
        </div>
      )}

      {estado === "vazio" && <p className="py-2 text-sm text-graphite-400">{mensagemVazio}</p>}

      {estado === "erro" && (
        <p role="alert" className="py-2 text-sm text-danger-600">
          {mensagemErro}
        </p>
      )}

      {estado === "sucesso" && (
        <>
          <span className={`numero-destaque text-3xl font-semibold ${corPorTom[tom]}`}>{valor}</span>
          {descricao && <span className="text-xs text-graphite-500">{descricao}</span>}
        </>
      )}
    </div>
  );
}
