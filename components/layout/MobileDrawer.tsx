"use client";

import { useEffect } from "react";
import { IconClose } from "@/components/ui/icons";
import { NavList } from "@/components/layout/NavList";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-graphite-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-900 shadow-xl"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-base font-semibold text-white">FinanceOps</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-md p-1.5 text-graphite-300 hover:bg-navy-800 hover:text-white"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavList onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
