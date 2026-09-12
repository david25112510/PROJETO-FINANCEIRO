import Link from "next/link";
import type { CartaoDto } from "@/features/cartoes/api";
import { formatarMoeda } from "@/lib/format";

const CORES_ALERTA: Record<CartaoDto["nivelAlerta"], string> = {
  normal: "bg-aqua-500",
  atencao: "bg-warning-500",
  critico: "bg-danger-500",
};

const ROTULO_ALERTA: Record<CartaoDto["nivelAlerta"], string> = {
  normal: "Controle saudável",
  atencao: "Atenção ao limite",
  critico: "Limite crítico",
};

export function CartaoCard({
  cartao,
  onEditar,
  onExcluir,
}: {
  cartao: CartaoDto;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const percentual = Math.min(100, Math.round(cartao.percentualUsado * 100));
  const disponivel = Math.max(0, cartao.limiteDisponivel);

  return (
    <article className="overflow-hidden rounded-xl border border-graphite-200 bg-surface shadow-sm">
      <div className="p-5 text-white" style={{ backgroundColor: cartao.cor }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/cartoes/${cartao.id}`} className="truncate text-lg font-semibold hover:underline">
              {cartao.nome}
            </Link>
            <p className="mt-1 text-xs text-white/75">{cartao.bandeira || "Cartão cadastrado"}</p>
          </div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
            {cartao.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>

        <div className="mt-8">
          <p className="text-xs text-white/70">Disponível</p>
          <p className="numero-destaque mt-1 text-2xl font-semibold">{formatarMoeda(disponivel)}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-graphite-700">{ROTULO_ALERTA[cartao.nivelAlerta]}</span>
            <span className="text-graphite-500">{percentual}% usado</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-graphite-100">
            <div
              className={`h-full rounded-full ${CORES_ALERTA[cartao.nivelAlerta]}`}
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-panel p-3">
            <p className="text-xs text-graphite-500">Usado</p>
            <p className="numero-destaque mt-1 font-semibold text-graphite-900">{formatarMoeda(cartao.limiteUsado)}</p>
          </div>
          <div className="rounded-lg bg-panel p-3">
            <p className="text-xs text-graphite-500">Limite</p>
            <p className="numero-destaque mt-1 font-semibold text-graphite-900">{formatarMoeda(cartao.limite)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-graphite-100 pt-3 text-xs text-graphite-500">
          <span>Fecha dia {cartao.diaFechamento}</span>
          <span>Vence dia {cartao.diaVencimento}</span>
        </div>

        <div className="flex justify-end gap-3 text-sm">
          <button type="button" onClick={onEditar} className="font-medium text-aqua-600 hover:underline">
            Editar
          </button>
          <button type="button" onClick={onExcluir} className="font-medium text-danger-600 hover:underline">
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}
