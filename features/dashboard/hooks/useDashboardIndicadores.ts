"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/lib/api-response";
import type { IndicadoresDashboard } from "@/services/dashboard/dashboardService";

type Estado = "carregando" | "erro" | "sucesso";

export function useDashboardIndicadores() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [dados, setDados] = useState<IndicadoresDashboard | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const res = await fetch("/api/v1/dashboard");
        const body: ApiResponse<IndicadoresDashboard> = await res.json();
        if (cancelado) return;

        if (!body.sucesso || !body.dados) {
          setEstado("erro");
          return;
        }

        setDados(body.dados);
        setEstado("sucesso");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  return { estado, dados };
}
