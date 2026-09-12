"use client";

import { LancamentosPage } from "@/features/lancamentos/components/LancamentosPage";

export default function ReceitasPage() {
  return (
    <LancamentosPage
      titulo="Receitas"
      descricao="Salários, rendimentos e outras entradas."
      recurso="receitas"
      tipoCategoria="RECEITA"
    />
  );
}
