"use client";

import { useEffect } from "react";

/** Registra o service worker (cache de assets + shell offline básico). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
