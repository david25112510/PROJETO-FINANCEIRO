"use client";

import { LancamentosPage } from "@/features/lancamentos/components/LancamentosPage";

export default function DespesasPage() {
  return (
    <LancamentosPage
      titulo="Despesas"
      descricao="Contas, compras e demais saídas."
      recurso="despesas"
      tipoCategoria="DESPESA"
    />
  );
}
