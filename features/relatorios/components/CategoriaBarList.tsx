import { formatarMoeda } from "@/lib/format";
import type { ItemCategoriaDto } from "@/features/relatorios/api";

export function CategoriaBarList({ titulo, itens }: { titulo: string; itens: ItemCategoriaDto[] }) {
  const total = itens.reduce((soma, item) => soma + item.total, 0);

  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-graphite-700">{titulo}</h3>

      {itens.length === 0 ? (
        <p className="text-sm text-graphite-400">Nenhum valor no período.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {itens.map((item) => {
            const percentual = total > 0 ? Math.round((item.total / total) * 100) : 0;
            return (
              <div key={item.categoriaId ?? "sem-categoria"}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-graphite-700">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.cor }} />
                    {item.nome}
                  </span>
                  <span className="numero-destaque font-medium text-graphite-900">{formatarMoeda(item.total)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-graphite-100">
                  <div className="h-full rounded-full" style={{ width: `${percentual}%`, backgroundColor: item.cor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
