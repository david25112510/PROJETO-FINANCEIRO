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
    <section className="overflow-hidden rounded-2xl border border-navy-800 bg-ink text-white shadow-[0_18px_45px_-30px_rgba(7,16,29,.9)]">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aqua-500">Visão mensal</p>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <p className="text-xs text-graphite-300">{saudacao()}, {primeiroNome}</p>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Resumo de {mesAtual()}</h1>
          <p className="mt-2 text-sm text-graphite-300">Receitas, despesas, saldo e uso dos cartões consolidados no período.</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/receitas" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-aqua-500 px-4 py-2 text-sm font-semibold text-white hover:bg-aqua-600">
            <IconPlus className="size-4" />
            Novo lançamento
          </Link>
          <Link href="/cartoes" className="inline-flex min-h-10 items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">Cartões</Link>
        </div>
      </div>

      <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-3">
        {atalhos.map((atalho) => {
          const Icon = atalho.icon;
          return (
            <Link key={atalho.href} href={atalho.href} className="group flex items-center gap-3 border-b border-white/10 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.06] sm:border-b-0 sm:border-r sm:last:border-r-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-aqua-500">
                <Icon className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{atalho.label}</span>
                <span className="block truncate text-xs text-graphite-400">{atalho.descricao}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
