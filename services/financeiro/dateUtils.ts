export function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

export function criarDataComDiaLimitado(ano: number, mes: number, dia: number): Date {
  return new Date(ano, mes, Math.min(dia, ultimoDiaDoMes(ano, mes)));
}

export function adicionarMesesPreservandoDia(data: Date, meses: number): Date {
  const totalMeses = data.getFullYear() * 12 + data.getMonth() + meses;
  const ano = Math.floor(totalMeses / 12);
  const mes = totalMeses % 12;
  return criarDataComDiaLimitado(ano, mes, data.getDate());
}
