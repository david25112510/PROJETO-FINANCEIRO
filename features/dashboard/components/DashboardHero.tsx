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
    <section className="overflow-hidden rounded-xl border border-graphite-200 bg-ink text-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_420px] lg:p-7">
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-aqua-500">
              {saudacao()}, {primeiroNome}
            </p>
            <h1 className="mt-2 max-w-2xl text-2xl font-semibold tracking-normal text-white sm:text-3xl">
              Seu painel financeiro de {mesAtual()}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-graphite-300">
              Acompanhe saldo, receitas, despesas e compras no cartão em uma visão única para decidir o próximo movimento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/receitas"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-aqua-500 px-4 py-2 text-sm font-medium text-white hover:bg-aqua-600"
            >
              <IconPlus className="size-4" />
              Lançar agora
            </Link>
            <Link
              href="/cartoes"
              className="inline-flex min-h-10 items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Ver cartões
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {atalhos.map((atalho) => {
            const Icon = atalho.icon;
            return (
              <Link
                key={atalho.href}
                href={atalho.href}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-aqua-500">
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
