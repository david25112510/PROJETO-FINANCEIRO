import { NavList } from "@/components/layout/NavList";

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-ink text-white lg:flex">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua-500 text-sm font-bold text-white shadow-lg shadow-aqua-500/20">
          F
        </div>
        <div>
          <span className="text-base font-semibold text-white">FinanceOps</span>
          <p className="text-xs text-graphite-300">Controle financeiro pessoal</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavList />
      </div>
      <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-medium uppercase text-aqua-500">Próximo passo</p>
        <p className="mt-1 text-sm text-graphite-200">
          Cadastre cartões e categorias para deixar o dashboard mais preciso.
        </p>
      </div>
    </aside>
  );
}
