"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/services/auth/authService";

type AuthContextValue = {
  user: SafeUser;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Estado global de usuário autenticado — hidratado a partir do Server Component
 * (app/(app)/layout.tsx), que já validou a sessão contra o banco.
 */
export function AuthProvider({ user: initialUser, children }: { user: SafeUser; children: ReactNode }) {
  const [user] = useState(initialUser);
  const router = useRouter();

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }
  return ctx;
}
