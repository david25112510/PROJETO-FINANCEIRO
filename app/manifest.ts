import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinanceOps — Gestão Financeira Executiva",
    short_name: "FinanceOps",
    description: "Receitas, despesas, cartões, dívidas, financiamentos, metas, relatórios e inteligência financeira.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f6f9",
    theme_color: "#16294f",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
