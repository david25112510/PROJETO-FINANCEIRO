import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Entrar - FinanceOps",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden flex-col justify-between bg-ink p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-aqua-500 text-base font-bold shadow-lg shadow-aqua-500/20">
            F
          </div>
          <div>
            <p className="text-base font-semibold">FinanceOps</p>
            <p className="text-xs text-graphite-300">Gestão financeira com clareza</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium text-aqua-500">Painel executivo pessoal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Entenda seu dinheiro antes que o mês decida por você.
          </h1>
          <p className="mt-4 text-sm leading-6 text-graphite-300">
            Receitas, despesas, cartões e faturas em uma experiência única, organizada para decisões rápidas.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["Saldo mensal", "Cartões", "Faturas"].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-graphite-300">{item}</p>
              <div className="mt-4 h-1.5 rounded-full bg-aqua-500" />
            </div>
          ))}
        </div>
      </section>

      <main className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-base font-bold text-white">
              F
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-graphite-900">FinanceOps</h1>
            <p className="mt-1 text-sm text-graphite-500">Entre para acessar sua gestão financeira.</p>
          </div>

          <div className="rounded-xl border border-graphite-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-aqua-600">Acesso seguro</p>
              <h2 className="mt-1 text-xl font-semibold text-graphite-900">Entrar na conta</h2>
            </div>

            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
