"use client";

import { IconMenu } from "@/components/ui/icons";
import { UserMenu } from "@/components/layout/UserMenu";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";

function mesAtual(): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-20 shrink-0 items-center gap-3 border-b border-graphite-200/70 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-graphite-600 hover:bg-graphite-100 lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase text-graphite-400">Período ativo</p>
        <p className="truncate text-sm font-semibold capitalize text-graphite-900">{mesAtual()}</p>
      </div>

      <div className="hidden rounded-full border border-success-500/20 bg-success-50 px-3 py-1 text-xs font-medium text-success-600 sm:block">
        Sessão segura
      </div>

      <PwaInstallButton />

      <div>
        <UserMenu />
      </div>
    </header>
  );
}
