import { NavList } from "@/components/layout/NavList";

export function Sidebar() {
  return (
    <aside className="relative hidden w-72 shrink-0 flex-col overflow-hidden border-r border-aqua-500/15 bg-[linear-gradient(165deg,#0b1526_0%,#07101d_58%,#101d3a_100%)] text-white shadow-[18px_0_50px_-35px_rgba(11,21,38,.9)] lg:flex">
      <div className="pointer-events-none absolute -left-24 top-10 size-64 rounded-full bg-aqua-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-28 size-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="relative flex h-11 w-11 items-center justify-center [perspective:500px]">
          <div className="absolute inset-1 rotate-45 rounded-xl border border-aqua-300/40 bg-aqua-500/20 shadow-[0_0_28px_rgba(21,154,156,.35)]" />
          <span className="relative text-sm font-bold text-white">F</span>
        </div>
        <div>
          <span className="text-base font-semibold text-white">FinanceOps</span>
          <p className="text-xs text-graphite-300">Controle financeiro pessoal</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavList />
      </div>
      <div className="relative m-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_16px_35px_-24px_rgba(0,0,0,.8)] backdrop-blur">
        <p className="text-xs font-medium uppercase text-aqua-500">Próximo passo</p>
        <p className="mt-1 text-sm text-graphite-200">
          Cadastre cartões e categorias para deixar o dashboard mais preciso.
        </p>
      </div>
    </aside>
  );
}
