"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/lib/api-response";
import type { SafeUser } from "@/services/auth/authService";

export function CadastroForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmarSenha?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: typeof fieldErrors = {};
    if (name.trim().length < 2) errors.name = "Informe seu nome (mínimo de 2 caracteres).";
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    if (password !== confirmarSenha) errors.confirmarSenha = "As senhas não coincidem.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const body: ApiResponse<{ user: SafeUser }> = await response.json();

      if (!body.sucesso) {
        setFormError(body.erro?.mensagem ?? "Não foi possível criar sua conta. Tente novamente.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
          {formError}
        </p>
      )}

      <FormField label="Nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} disabled={loading} />
      <FormField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} disabled={loading} />
      <FormField
        label="Senha"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={loading}
        aria-describedby="regras-senha"
      />
      <p id="regras-senha" className="-mt-2 text-xs text-graphite-500">
        Use pelo menos 8 caracteres, com uma letra maiúscula, uma minúscula e um número.
      </p>
      <FormField
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        error={fieldErrors.confirmarSenha}
        disabled={loading}
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
