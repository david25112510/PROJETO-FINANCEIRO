const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// timeZone: "UTC" é proposital — campos de data (sem hora) são armazenados e
// retornados como meia-noite UTC; formatar no fuso local do navegador causaria
// um "dia a menos" para fusos atrás de UTC (ex.: horário do Brasil).
const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

export function formatarData(data: string | Date): string {
  return formatadorData.format(new Date(data));
}

export function formatarPercentual(valor: number): string {
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toFixed(1)}%`;
}
