"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/navigation";

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (!item.disponivel) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-graphite-500"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-graphite-300">
                Em breve
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-ink shadow-sm"
                : "text-graphite-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
