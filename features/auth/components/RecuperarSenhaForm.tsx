"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/lib/api-response";

export function RecuperarSenhaForm() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body: ApiResponse<{ message: string }> = await response.json();

      if (!body.sucesso) {
        setFormError(body.erro?.mensagem ?? "Não foi possível solicitar a recuperação. Tente novamente.");
        return;
      }

      setEnviado(true);
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="rounded-lg bg-success-50 px-3.5 py-3 text-sm text-success-600">
          Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. Verifique também a pasta de spam.
        </p>
        <Link href="/login" className="text-center text-sm font-medium text-navy-600 hover:underline">Voltar para entrar</Link>
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
      <p className="text-sm text-graphite-500">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
      <FormField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
      <Link href="/login" className="text-center text-sm text-graphite-500 hover:underline">Voltar para entrar</Link>
    </form>
  );
}
