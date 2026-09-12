"use client";

import dynamic from "next/dynamic";

const UltimosLancamentos = dynamic(
  () => import("@/features/dashboard/components/UltimosLancamentos").then((m) => m.UltimosLancamentos),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-3">
        <div className="h-4 w-40 animate-pulse rounded bg-graphite-100" />
        <div className="h-48 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
      </div>
    ),
  },
);

export function UltimosLancamentosLazy() {
  return <UltimosLancamentos />;
}
