import Link from "next/link";
import { IconPlus } from "@/components/ui/icons";

export function FloatingActionButton() {
  return (
    <Link
      href="/receitas"
      title="Novo lançamento"
      aria-label="Novo lançamento"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-aqua-500 to-navy-600 text-white shadow-[0_16px_35px_-12px_rgba(21,154,156,.8)] transition-transform active:scale-95 lg:hidden"
    >
      <IconPlus className="h-6 w-6" />
    </Link>
  );
}
