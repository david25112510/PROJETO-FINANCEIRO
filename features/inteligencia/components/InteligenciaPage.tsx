"use client";

import { useEffect, useState } from "react";
import { ScoreSaudeCard } from "@/features/inteligencia/components/ScoreSaudeCard";
import { InsightsList } from "@/features/inteligencia/components/InsightsList";
import { SimuladorPanel } from "@/features/inteligencia/components/SimuladorPanel";
import { IntelligenceSummary } from "@/features/inteligencia/components/IntelligenceSummary";
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
    <div className="flex flex-col gap-6 pb-6">
      <section className="relative overflow-hidden rounded-2xl border border-navy-700 bg-ink px-5 py-6 text-white shadow-sm sm:px-7 sm:py-8">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-aqua-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-aqua-500/30 bg-aqua-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-aqua-500">Análise inteligente</span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Entenda sua situação e teste o próximo passo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-300">O diagnóstico combina poupança, crédito, dívidas e metas. As projeções usam a média real dos últimos três meses.</p>
        </div>
      </section>

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
        <>
          <IntelligenceSummary score={score} insights={insights} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
            <ScoreSaudeCard score={score} />
            <section className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-graphite-400">Monitoramento</p>
                  <h2 className="mt-1 text-lg font-semibold text-graphite-900">Insights automáticos</h2>
                </div>
                <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">{insights.length} {insights.length === 1 ? "análise" : "análises"}</span>
              </div>
              <InsightsList insights={insights} />
            </section>
          </div>
        </>
      )}

      <SimuladorPanel />
    </div>
  );
}
