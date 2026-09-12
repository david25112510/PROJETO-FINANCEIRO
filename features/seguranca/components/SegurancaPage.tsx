"use client";

import { DoisFatoresPainel } from "@/features/seguranca/components/DoisFatoresPainel";
import { SessoesAtivasLista } from "@/features/seguranca/components/SessoesAtivasLista";
import { TrocarSenhaForm } from "@/features/seguranca/components/TrocarSenhaForm";

export function SegurancaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-graphite-900">Segurança</h1>
        <p className="mt-1 text-sm text-graphite-500">Senha, autenticação em duas etapas e dispositivos conectados.</p>
      </div>

      <TrocarSenhaForm />
      <DoisFatoresPainel />
      <SessoesAtivasLista />
    </div>
  );
}
