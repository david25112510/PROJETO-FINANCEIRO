"use client";

import { useEffect, useState } from "react";
import { ScoreSaudeCard } from "@/features/inteligencia/components/ScoreSaudeCard";
import { InsightsList } from "@/features/inteligencia/components/InsightsList";
import { SimuladorPanel } from "@/features/inteligencia/components/SimuladorPanel";
import { buscarInsights, buscarScoreSaude, type InsightDto, type ScoreSaudeDto } from "@/features/inteligencia/api";

export function InteligenciaPage() {
  const [score, setScore] = useState<ScoreSaudeDto | null>(null);
  const [insights, setInsights] = useState<InsightDto[]>([]);
  const [estado, setEstado] = useState<"carregando" | "erro" | "sucesso">("carregando");

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setEstado("carregando");
      try {
        const [respostaScore, respostaInsights] = await Promise.all([buscarScoreSaude(), buscarInsights()]);
        if (cancelado) return;

        if (!respostaScore.sucesso || !respostaScore.dados || !respostaInsights.sucesso || !respostaInsights.dados) {
          setEstado("erro");
          return;
        }

        setScore(respostaScore.dados);
        setInsights(respostaInsights.dados);
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-graphite-900">Inteligência</h1>
        <p className="mt-1 text-sm text-graphite-500">Score de saúde financeira, insights e simulação de cenários.</p>
      </div>

      {estado === "carregando" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
          <div className="h-72 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />
        </div>
      )}

      {estado === "erro" && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-10 text-center">
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível carregar as informações de inteligência financeira.
          </p>
        </div>
      )}

      {estado === "sucesso" && score && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScoreSaudeCard score={score} />
          <div>
            <h2 className="mb-3 text-sm font-semibold text-graphite-700">Insights automáticos</h2>
            <InsightsList insights={insights} />
          </div>
        </div>
      )}

      <SimuladorPanel />
    </div>
  );
}
