"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/lib/api-response";
import type { SafeUser } from "@/services/auth/authService";

type RespostaLogin = { requerTotp: true; loginPendenteId: string } | { requerTotp: false; user: SafeUser };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirecionarPara = searchParams.get("redirecionarPara") ?? "/dashboard";

  const [etapa, setEtapa] = useState<"credenciais" | "totp">("credenciais");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loginPendenteId, setLoginPendenteId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function irParaDestino() {
    router.push(redirecionarPara);
    router.refresh();
  }

  async function handleSubmitCredenciais(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Informe o e-mail.";
    if (!password) errors.password = "Informe a senha.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body: ApiResponse<RespostaLogin> = await response.json();

      if (!body.sucesso || !body.dados) {
        setFormError(body.erro?.mensagem ?? "Não foi possível entrar. Tente novamente.");
        return;
      }

      if (body.dados.requerTotp) {
        setLoginPendenteId(body.dados.loginPendenteId);
        setEtapa("totp");
        return;
      }

      irParaDestino();
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitTotp(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!codigo.trim()) {
      setFormError("Informe o código do aplicativo autenticador.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/verificar-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginPendenteId, codigo: codigo.trim() }),
      });
      const body: ApiResponse<SafeUser> = await response.json();

      if (!body.sucesso) {
        setFormError(body.erro?.mensagem ?? "Código inválido.");
        return;
      }

      irParaDestino();
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (etapa === "totp") {
    return (
      <form onSubmit={handleSubmitTotp} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-graphite-500">
          Digite o código de 6 dígitos do seu aplicativo autenticador (ou um código de backup).
        </p>

        {formError && (
          <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
            {formError}
          </p>
        )}

        <FormField
          label="Código de verificação"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Verificando..." : "Verificar"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setEtapa("credenciais");
            setCodigo("");
            setFormError(null);
          }}
          className="text-sm text-graphite-500 hover:underline"
        >
          Voltar
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmitCredenciais} noValidate className="flex flex-col gap-4">
      {formError && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3.5 py-2.5 text-sm text-danger-600">
          {formError}
        </p>
      )}

      <FormField
        label="E-mail"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={loading}
      />

      <FormField
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={loading}
      />

      <Button type="submit" loading={loading} className="mt-2 w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
