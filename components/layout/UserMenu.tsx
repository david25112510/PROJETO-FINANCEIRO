"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconEscudo, IconLogout } from "@/components/ui/icons";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-graphite-200 py-1 pl-1 pr-3 hover:bg-graphite-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-sm font-medium text-graphite-800 sm:inline">{user.name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-graphite-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-graphite-100 px-3.5 py-2.5">
            <p className="text-sm font-medium text-graphite-900">{user.name}</p>
            <p className="truncate text-xs text-graphite-500">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            href="/seguranca"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-graphite-700 hover:bg-graphite-50"
          >
            <IconEscudo className="h-4 w-4" />
            Segurança
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-graphite-700 hover:bg-graphite-50 disabled:opacity-60"
          >
            <IconLogout className="h-4 w-4" />
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
