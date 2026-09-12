"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHero } from "@/features/dashboard/components/DashboardHero";
import { IndicadoresGrid } from "@/features/dashboard/components/IndicadoresGrid";
import { UltimosLancamentosLazy } from "@/features/dashboard/components/UltimosLancamentosLazy";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero user={user} />
      <IndicadoresGrid />
      <UltimosLancamentosLazy />
    </div>
  );
}
