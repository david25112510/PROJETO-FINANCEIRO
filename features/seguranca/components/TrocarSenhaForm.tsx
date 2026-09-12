"use client";

import { FormEvent, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { trocarSenha } from "@/features/seguranca/api";

export function TrocarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSucesso(false);

    if (novaSenha !== confirmacao) {
      setErro("A confirmação não corresponde à nova senha.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await trocarSenha(senhaAtual, novaSenha);
      if (!resposta.sucesso) {
        setErro(resposta.erro?.mensagem ?? "Não foi possível trocar a senha.");
        return;
      }
      setSucesso(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-xl border border-graphite-200 bg-surface p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-graphite-700">Senha</h2>
      <p className="mt-1 text-xs text-graphite-400">
        Ao trocar a senha, suas sessões em outros dispositivos são encerradas.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        {erro && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {erro}
          </p>
        )}
        {sucesso && (
          <p role="status" className="rounded-lg bg-success-50 px-3.5 py-2.5 text-sm text-success-600">
            Senha alterada com sucesso.
          </p>
        )}

        <FormField
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          disabled={salvando}
        />
        <FormField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          disabled={salvando}
        />
        <FormField
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          disabled={salvando}
        />
        <p className="text-xs text-graphite-400">
          Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
        </p>

        <Button type="submit" loading={salvando} className="self-start">
          Trocar senha
        </Button>
      </form>
    </div>
  );
}
