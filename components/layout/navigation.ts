import {
  IconCartoes,
  IconDashboard,
  IconDespesas,
  IconDividas,
  IconFinanciamentos,
  IconImportacao,
  IconInteligencia,
  IconMetas,
  IconReceitas,
  IconRelatorios,
  IconWhatsapp,
} from "@/components/ui/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof IconDashboard;
  disponivel: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard, disponivel: true },
  { label: "Receitas", href: "/receitas", icon: IconReceitas, disponivel: true },
  { label: "Despesas", href: "/despesas", icon: IconDespesas, disponivel: true },
  { label: "Cartões", href: "/cartoes", icon: IconCartoes, disponivel: true },
  { label: "Dívidas", href: "/dividas", icon: IconDividas, disponivel: true },
  { label: "Financiamentos", href: "/financiamentos", icon: IconFinanciamentos, disponivel: true },
  { label: "Metas", href: "/metas", icon: IconMetas, disponivel: true },
  { label: "Relatórios", href: "/relatorios", icon: IconRelatorios, disponivel: true },
  { label: "Inteligência", href: "/inteligencia", icon: IconInteligencia, disponivel: true },
  { label: "Importação", href: "/importacao", icon: IconImportacao, disponivel: true },
  { label: "WhatsApp", href: "/whatsapp", icon: IconWhatsapp, disponivel: true },
];
