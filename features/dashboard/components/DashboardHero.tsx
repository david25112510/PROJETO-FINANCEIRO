"use client";

import Link from "next/link";
import { IconCartoes, IconDespesas, IconPlus, IconReceitas } from "@/components/ui/icons";
import type { SafeUser } from "@/services/auth/authService";

const atalhos = [
  { href: "/receitas", label: "Nova receita", descricao: "Registrar entrada", icon: IconReceitas },
  { href: "/despesas", label: "Nova despesa", descricao: "Registrar saída", icon: IconDespesas },
  { href: "/cartoes", label: "Cartão", descricao: "Compra ou fatura", icon: IconCartoes },
];

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function mesAtual(): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());
}

export function DashboardHero({ user }: { user: SafeUser }) {
  const primeiroNome = user.name.split(" ")[0];

  return (
    <section className="tech-noise relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#07101d_0%,#101d3a_52%,#16294f_100%)] text-white shadow-[0_32px_75px_-38px_rgba(7,16,29,.9)]">
      <div className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full border border-aqua-500/20 bg-aqua-500/10 shadow-[0_0_80px_rgba(21,154,156,.22)]" />
      <div className="pointer-events-none absolute right-28 top-10 size-28 rotate-45 rounded-[2rem] border border-white/10 bg-white/[0.025]" />
      <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_420px] lg:p-8">
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-aqua-500/20 bg-aqua-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-aqua-500">
              <span className="size-1.5 rounded-full bg-aqua-500 shadow-[0_0_10px_#159a9c]" />
              {saudacao()}, {primeiroNome}
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Seu painel financeiro de {mesAtual()}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-graphite-300">
              Acompanhe saldo, receitas, despesas e compras no cartão em uma visão única para decidir o próximo movimento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/receitas"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-aqua-500 to-aqua-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(21,154,156,.8)] transition-transform hover:-translate-y-0.5"
            >
              <IconPlus className="size-4" />
              Lançar agora
            </Link>
            <Link
              href="/cartoes"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/10"
            >
              Ver cartões
            </Link>
          </div>
        </div>

        <div className="grid gap-3 [perspective:900px] sm:grid-cols-3 lg:grid-cols-1">
          {atalhos.map((atalho) => {
            const Icon = atalho.icon;
            return (
              <Link
                key={atalho.href}
                href={atalho.href}
                className="depth-card group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur transition-transform hover:translate-x-1 hover:bg-white/10"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-aqua-500/20 bg-aqua-500/10 text-aqua-500 shadow-[0_10px_22px_-14px_rgba(21,154,156,.8)] transition-transform group-hover:rotate-3 group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">{atalho.label}</span>
                  <span className="block truncate text-xs text-graphite-300">{atalho.descricao}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
