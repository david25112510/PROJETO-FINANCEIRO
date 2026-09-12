"use client";

import { IndicatorCard } from "@/components/ui/IndicatorCard";
import { useDashboardIndicadores } from "@/features/dashboard/hooks/useDashboardIndicadores";
import { formatarMoeda, formatarPercentual } from "@/lib/format";

export function IndicadoresGrid() {
  const { estado, dados } = useDashboardIndicadores();

  const saldoZerado =
    estado === "sucesso" && dados?.saldoMes === 0 && dados?.receitasMes === 0 && dados?.despesasMes === 0;
  const estadoCard = saldoZerado ? "vazio" : estado === "sucesso" ? "sucesso" : estado;
  const taxaPoupanca =
    dados && dados.receitasMes > 0 ? ((dados.receitasMes - dados.despesasMes) / dados.receitasMes) * 100 : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <IndicatorCard
        titulo="Saldo do mês"
        estado={estadoCard}
        valor={dados ? formatarMoeda(dados.saldoMes) : undefined}
        descricao={
          dados?.variacaoSaldoPercentual !== null && dados?.variacaoSaldoPercentual !== undefined
            ? `${formatarPercentual(dados.variacaoSaldoPercentual)} vs. mês anterior`
            : undefined
        }
        tom={dados && dados.saldoMes < 0 ? "critico" : dados && dados.saldoMes > 0 ? "sucesso" : "neutro"}
        mensagemVazio="Nenhum lançamento este mês ainda"
      />
      <IndicatorCard
        titulo="Receitas do mês"
        estado={estadoCard}
        valor={dados ? formatarMoeda(dados.receitasMes) : undefined}
        tom="sucesso"
        mensagemVazio="Nenhuma receita este mês ainda"
      />
      <IndicatorCard
        titulo="Despesas do mês"
        estado={estadoCard}
        valor={dados ? formatarMoeda(dados.despesasMes) : undefined}
        tom={dados && dados.despesasMes > 0 ? "atencao" : "neutro"}
        mensagemVazio="Nenhuma despesa este mês ainda"
      />
      <IndicatorCard
        titulo="Taxa de poupança"
        estado={estadoCard}
        valor={taxaPoupanca !== null ? formatarPercentual(taxaPoupanca) : undefined}
        descricao="Receitas menos despesas"
        tom={
          taxaPoupanca !== null && taxaPoupanca < 0
            ? "critico"
            : taxaPoupanca !== null && taxaPoupanca < 15
              ? "atencao"
              : "sucesso"
        }
        mensagemVazio="Sem base para cálculo ainda"
      />
    </div>
  );
}
