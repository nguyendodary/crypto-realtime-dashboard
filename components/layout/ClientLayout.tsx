"use client";

import { QueryProvider } from "@/lib/providers";
import { Header } from "@/components/layout/Header";
import { useWebSocket } from "@/hooks/useWebSocket";

function WebSocketInitializer() {
  useWebSocket();
  return null;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <WebSocketInitializer />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </QueryProvider>
  );
}
