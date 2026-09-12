"use client";

import { use } from "react";
import { CartaoDetalhe } from "@/features/cartoes/components/CartaoDetalhe";

export default function CartaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CartaoDetalhe cartaoId={id} />;
}
