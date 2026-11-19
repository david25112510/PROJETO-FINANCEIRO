import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CadastroForm } from "@/features/auth/components/CadastroForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Criar conta - FinanceOps",
};

export default async function CadastroPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-base font-bold text-white">F</div>
          <h1 className="mt-4 text-2xl font-semibold text-graphite-900">FinanceOps</h1>
          <p className="mt-1 text-sm text-graphite-500">Crie sua conta para organizar suas finanças.</p>
        </div>

        <div className="rounded-xl border border-graphite-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-aqua-600">Comece agora</p>
            <h2 className="mt-1 text-xl font-semibold text-graphite-900">Criar nova conta</h2>
          </div>

          <CadastroForm />

          <p className="mt-6 text-center text-sm text-graphite-500">
            Já tem uma conta? <Link href="/login" className="font-medium text-navy-600 hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
