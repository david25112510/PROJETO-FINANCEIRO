"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="tech-canvas flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>

      <FloatingActionButton />
    </div>
  );
}
