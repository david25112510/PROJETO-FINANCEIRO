export function normalizarDestinoInterno(destino: string | null): string {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//") || destino.includes("\\")) {
    return "/dashboard";
  }
  return destino;
}
