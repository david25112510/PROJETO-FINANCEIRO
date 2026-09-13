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
      <section className="tech-noise relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#06101d_0%,#101d3a_55%,#192d59_100%)] px-5 py-7 text-white shadow-[0_34px_80px_-40px_rgba(7,16,29,.95)] sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-aqua-500/20 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_300px]">
          <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-aqua-500/30 bg-aqua-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-aqua-500">Análise inteligente</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Entenda sua situação e teste o próximo passo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-300">O diagnóstico combina poupança, crédito, dívidas e metas. As projeções usam a média real dos últimos três meses.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-navy-100">
            {['Fluxo de caixa', 'Crédito', 'Dívidas', 'Metas'].map((item) => <span key={item} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur">{item}</span>)}
          </div>
          </div>
          <div className="float-soft relative mx-auto hidden size-56 [perspective:800px] lg:block" aria-hidden="true">
            <div className="absolute inset-2 rounded-full border border-aqua-500/30 shadow-[0_0_55px_rgba(21,154,156,.22)] [transform:rotateX(68deg)_rotateZ(-12deg)]" />
            <div className="absolute inset-8 rounded-full border-2 border-violet-400/30 [transform:rotateX(58deg)_rotateZ(42deg)]" />
            <div className="absolute inset-14 rounded-full border border-white/25 [transform:rotateY(64deg)_rotateZ(24deg)]" />
            <div className="absolute inset-[4.5rem] rounded-3xl border border-aqua-300/50 bg-gradient-to-br from-aqua-500/70 to-violet-500/50 shadow-[0_0_45px_rgba(21,154,156,.65)] [transform:rotateX(18deg)_rotateY(-24deg)_rotateZ(45deg)]" />
            <div className="absolute left-5 top-20 size-2 rounded-full bg-aqua-300 shadow-[0_0_14px_#66ffff]" />
            <div className="absolute bottom-12 right-7 size-2 rounded-full bg-violet-300 shadow-[0_0_14px_#a78bfa]" />
          </div>
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
            <section className="depth-card rounded-3xl border border-white/80 bg-white/90 p-5 backdrop-blur sm:p-6">
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
