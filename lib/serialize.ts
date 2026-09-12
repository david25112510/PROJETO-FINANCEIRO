import type { Prisma } from "@prisma/client";

/**
 * Converte campos Decimal do Prisma para number antes de a resposta virar JSON.
 * Sem isso, `NextResponse.json` serializaria o Decimal como string (via seu
 * `toJSON`), quebrando o contrato de tipos numéricos da API.
 */
export function serializarValor<T extends { valor: Prisma.Decimal }>(
  registro: T,
): Omit<T, "valor"> & { valor: number } {
  return { ...registro, valor: Number(registro.valor) };
}
