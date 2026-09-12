"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  confirmarAtivacaoTotp,
  desativarTotp,
  iniciarAtivacaoTotp,
  type IniciarTotpDto,
} from "@/features/seguranca/api";

export function DoisFatoresPainel() {
  const { user } = useAuth();
  const router = useRouter();
  const [ativado, setAtivado] = useState(user.totpAtivado);

  const [modalAtivarAberto, setModalAtivarAberto] = useState(false);
  const [dadosAtivacao, setDadosAtivacao] = useState<IniciarTotpDto | null>(null);
  const [codigo, setCodigo] = useState("");
  const [codigosBackup, setCodigosBackup] = useState<string[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [modalDesativarAberto, setModalDesativarAberto] = useState(false);
  const [senhaDesativar, setSenhaDesativar] = useState("");

  async function handleAbrirAtivacao() {
    setErro(null);
    setCodigosBackup(null);
    setCodigo("");
    setModalAtivarAberto(true);
    setCarregando(true);
    try {
      const resposta = await iniciarAtivacaoTotp();
      if (resposta.sucesso && resposta.dados) {
        setDadosAtivacao(resposta.dados);
      } else {
        setErro(resposta.erro?.mensagem ?? "Não foi possível iniciar a ativação.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleConfirmarAtivacao() {
    setErro(null);
    setCarregando(true);
    try {
      const resposta = await confirmarAtivacaoTotp(codigo.trim());
      if (!resposta.sucesso || !resposta.dados) {
        setErro(resposta.erro?.mensagem ?? "Código inválido.");
        return;
      }
      setCodigosBackup(resposta.dados.codigosBackup);
      setAtivado(true);
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  async function handleDesativar() {
    setErro(null);
    setCarregando(true);
    try {
      const resposta = await desativarTotp(senhaDesativar);
      if (!resposta.sucesso) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível desativar.");
        return;
      }
      setAtivado(false);
      setModalDesativarAberto(false);
      setSenhaDesativar("");
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-graphite-700">Autenticação em duas etapas</h2>
          <p className="mt-1 text-xs text-graphite-400">
            Exige um código do seu aplicativo autenticador (Google Authenticator, Authy etc.) além da senha.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            ativado ? "bg-success-50 text-success-600" : "bg-graphite-100 text-graphite-600"
          }`}
        >
          {ativado ? "Ativada" : "Desativada"}
        </span>
      </div>

      <div className="mt-4">
        {ativado ? (
          <Button type="button" variant="danger" onClick={() => setModalDesativarAberto(true)}>
            Desativar
          </Button>
        ) : (
          <Button type="button" onClick={handleAbrirAtivacao}>
            Ativar autenticação em duas etapas
          </Button>
        )}
      </div>

      <Modal
        open={modalAtivarAberto}
        onClose={() => setModalAtivarAberto(false)}
        title="Ativar autenticação em duas etapas"
        footer={
          !codigosBackup && (
            <>
              <Button type="button" variant="secondary" onClick={() => setModalAtivarAberto(false)} disabled={carregando}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmarAtivacao} loading={carregando} disabled={!codigo.trim()}>
                Confirmar
              </Button>
            </>
          )
        }
      >
        {erro && (
          <p role="alert" className="mb-3 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}

        {!codigosBackup && dadosAtivacao && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-graphite-600">
              Escaneie o QR code com seu aplicativo autenticador e digite o código gerado para confirmar.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI local, não precisa de otimização do Next/Image */}
            <img
              src={dadosAtivacao.qrCodeDataUrl}
              alt="QR code para configurar a autenticação em duas etapas"
              className="mx-auto h-48 w-48"
            />
            <p className="text-center text-xs text-graphite-400">
              Não consegue escanear? Digite manualmente: <code className="font-mono">{dadosAtivacao.secret}</code>
            </p>
            <FormField
              label="Código de 6 dígitos"
              inputMode="numeric"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={carregando}
            />
          </div>
        )}

        {codigosBackup && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-graphite-600">
              Guarde estes códigos de backup em um lugar seguro. Cada um só pode ser usado uma vez, caso você perca
              acesso ao aplicativo autenticador.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-graphite-50 p-4 font-mono text-sm">
              {codigosBackup.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <Button type="button" onClick={() => setModalAtivarAberto(false)}>
              Concluído
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={modalDesativarAberto}
        onClose={() => setModalDesativarAberto(false)}
        title="Desativar autenticação em duas etapas"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setModalDesativarAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={handleDesativar} loading={carregando}>
              Desativar
            </Button>
          </>
        }
      >
        {erro && (
          <p role="alert" className="mb-3 rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}
        <FormField
          label="Confirme sua senha"
          type="password"
          value={senhaDesativar}
          onChange={(e) => setSenhaDesativar(e.target.value)}
          disabled={carregando}
        />
      </Modal>
    </div>
  );
}
