import { Suspense } from "react";
import type { Metadata } from "next";
import { RedefinirSenhaForm } from "@/features/auth/components/RedefinirSenhaForm";

export const metadata: Metadata = {
  title: "Nova senha - FinanceOps",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RedefinirSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-base font-bold text-white">F</div>
          <h1 className="mt-4 text-2xl font-semibold text-graphite-900">FinanceOps</h1>
          <p className="mt-1 text-sm text-graphite-500">Escolha uma senha nova para sua conta.</p>
        </div>

        <div className="rounded-xl border border-graphite-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-aqua-600">Acesso à conta</p>
            <h2 className="mt-1 text-xl font-semibold text-graphite-900">Redefinir senha</h2>
          </div>
          <Suspense fallback={null}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
