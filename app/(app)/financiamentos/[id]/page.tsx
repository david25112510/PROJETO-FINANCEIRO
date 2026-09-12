"use client";

import { use } from "react";
import { FinanciamentoDetalhe } from "@/features/financiamentos/components/FinanciamentoDetalhe";

export default function FinanciamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FinanciamentoDetalhe financiamentoId={id} />;
}
