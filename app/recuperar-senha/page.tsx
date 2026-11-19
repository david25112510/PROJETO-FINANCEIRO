import type { Metadata } from "next";
import Link from "next/link";
import { RecuperarSenhaForm } from "@/features/auth/components/RecuperarSenhaForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Recuperar senha - FinanceOps",
  robots: { index: false, follow: false },
};

export default async function RecuperarSenhaPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-base font-bold text-white">F</div>
          <h1 className="mt-4 text-2xl font-semibold text-graphite-900">FinanceOps</h1>
          <p className="mt-1 text-sm text-graphite-500">Vamos ajudar você a recuperar o acesso.</p>
        </div>

        <div className="rounded-xl border border-graphite-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-aqua-600">Acesso à conta</p>
            <h2 className="mt-1 text-xl font-semibold text-graphite-900">Recuperar senha</h2>
          </div>
          <RecuperarSenhaForm />
          <p className="mt-6 text-center text-sm text-graphite-500">
            <Link href="/criar-conta" className="font-medium text-navy-600 hover:underline">Criar uma nova conta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
