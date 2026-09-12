"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  buscarStatusWhatsapp,
  desvincularWhatsapp,
  iniciarVinculoWhatsapp,
  type IniciarVinculoDto,
  type StatusWhatsappDto,
} from "@/features/whatsapp/api";

export function WhatsAppPage() {
  const [status, setStatus] = useState<StatusWhatsappDto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [numero, setNumero] = useState("");
  const [vinculo, setVinculo] = useState<IniciarVinculoDto | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      const resposta = await buscarStatusWhatsapp();
      if (!cancelado && resposta.sucesso && resposta.dados) setStatus(resposta.dados);
      if (!cancelado) setCarregando(false);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [refreshKey]);

  async function handleVincular(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await iniciarVinculoWhatsapp(numero);
      if (!resposta.sucesso || !resposta.dados) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível iniciar o vínculo.");
        return;
      }
      setVinculo(resposta.dados);
      setRefreshKey((k) => k + 1);
    } finally {
      setEnviando(false);
    }
  }

  async function handleDesvincular() {
    setEnviando(true);
    try {
      await desvincularWhatsapp();
      setVinculo(null);
      setRefreshKey((k) => k + 1);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-graphite-900">WhatsApp</h1>
        <p className="mt-1 text-sm text-graphite-500">
          Registre receitas e despesas mandando mensagem, sem abrir o app.
        </p>
      </div>

      <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700">
        Nenhum provedor de WhatsApp Business API está conectado neste ambiente ainda. O vínculo e o histórico já
        funcionam de ponta a ponta; falta apenas conectar um provedor real (Meta Cloud API, Twilio etc.) para o bot
        enviar e receber mensagens de verdade.
      </div>

      {carregando && <div className="h-40 animate-pulse rounded-xl border border-graphite-200 bg-graphite-50" />}

      {!carregando && status && (
        <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
          {erro && (
            <p role="alert" className="mb-4 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
              {erro}
            </p>
          )}

          {status.verificado && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-graphite-800">Número vinculado</p>
                  <p className="text-sm text-graphite-500">{status.numero}</p>
                </div>
                <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-[11px] font-medium text-success-600">
                  Verificado
                </span>
              </div>
              <Button type="button" variant="danger" onClick={handleDesvincular} loading={enviando} className="self-start">
                Desvincular
              </Button>

              <div className="rounded-lg bg-graphite-50 p-4 text-sm text-graphite-600">
                <p className="mb-2 font-medium text-graphite-800">Comandos disponíveis</p>
                <ul className="flex flex-col gap-1">
                  <li>&ldquo;gastei 50 no mercado&rdquo; — registra uma despesa</li>
                  <li>&ldquo;recebi 1000 de salário&rdquo; — registra uma receita</li>
                  <li>&ldquo;saldo&rdquo; — consulta o saldo do mês</li>
                  <li>&ldquo;ajuda&rdquo; — lista os comandos</li>
                </ul>
              </div>
            </div>
          )}

          {!status.verificado && status.vinculado && vinculo && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-graphite-600">
                Envie a seguinte mensagem pelo WhatsApp a partir do número <strong>{vinculo.numero}</strong> para
                confirmar o vínculo:
              </p>
              <p className="numero-destaque rounded-lg bg-navy-50 px-4 py-3 text-center text-lg font-semibold text-navy-700">
                {vinculo.codigo}
              </p>
              <p className="text-xs text-graphite-400">
                Válido até {new Date(vinculo.expiraEm).toLocaleTimeString("pt-BR")}. Isso só funcionará depois que um
                provedor de WhatsApp estiver conectado a este ambiente.
              </p>
            </div>
          )}

          {!status.vinculado && (
            <form onSubmit={handleVincular} noValidate className="flex flex-col gap-3">
              <FormField
                label="Número de WhatsApp"
                type="tel"
                placeholder="+55 11 99999-9999"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={enviando}
              />
              <Button type="submit" loading={enviando} className="self-start">
                Vincular número
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
