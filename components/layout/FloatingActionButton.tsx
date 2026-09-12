import Link from "next/link";
import { IconPlus } from "@/components/ui/icons";

export function FloatingActionButton() {
  return (
    <Link
      href="/receitas"
      title="Novo lançamento"
      aria-label="Novo lançamento"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-aqua-500 text-white shadow-lg shadow-aqua-500/30 lg:hidden"
    >
      <IconPlus className="h-6 w-6" />
    </Link>
  );
}
