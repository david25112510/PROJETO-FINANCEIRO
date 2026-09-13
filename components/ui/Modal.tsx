"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/ui/icons";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const larguraPorTamanho = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

/**
 * Modal de ação rápida — componente obrigatório do design system.
 * Usado para criação/edição rápida de lançamentos.
 */
export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-graphite-900/65 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className={`relative flex max-h-[calc(100dvh-0.75rem)] w-full flex-col overflow-hidden rounded-t-3xl border border-white/80 bg-white/95 shadow-[0_35px_100px_-25px_rgba(7,16,29,.75),0_0_0_1px_rgba(21,154,156,.08)] backdrop-blur-xl sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl ${larguraPorTamanho[size]}`}
      >
        <div className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-graphite-100 bg-[linear-gradient(120deg,#fbfcfe,#f2f7fb)] px-4 py-3.5 sm:px-6 sm:py-4">
          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-aqua-500 to-navy-500" />
          <h2 id="modal-titulo" className="text-base font-semibold text-graphite-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-graphite-400 hover:bg-graphite-100 hover:text-graphite-700"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">{children}</div>

        {footer && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-graphite-100 bg-panel px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
