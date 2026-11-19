"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/lib/api-response";

export function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setErroSenha(undefined);

    if (!token) {
      setFormError("Este link está inválido. Solicite uma nova recuperação de senha.");
      return;
    }
    if (password !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/recuperar-senha/redefinir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body: ApiResponse<null> = await response.json();

      if (!body.sucesso) {
        setFormError(body.erro?.mensagem ?? "Não foi possível redefinir a senha. Solicite um novo link.");
        return;
      }

      router.replace("/login?senhaRedefinida=1");
      router.refresh();
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-3 text-sm text-danger-600">
          Este link está inválido ou incompleto. Solicite uma nova recuperação.
        </p>
        <Link href="/recuperar-senha" className="text-center text-sm font-medium text-navy-600 hover:underline">Solicitar outro link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
          {formError}
        </p>
      )}
      <FormField
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        aria-describedby="regras-senha"
      />
      <p id="regras-senha" className="-mt-2 text-xs text-graphite-500">
        Use pelo menos 8 caracteres, com uma letra maiúscula, uma minúscula e um número.
      </p>
      <FormField
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        error={erroSenha}
        disabled={loading}
      />
      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
