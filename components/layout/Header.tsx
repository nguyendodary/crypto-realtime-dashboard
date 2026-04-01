"use client";

import Link from "next/link";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { CommandSearch } from "@/components/search/CommandSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";

export function Header() {
  const { isConnected } = useWebSocket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg">CryptoPulse</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
              isConnected
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          <CommandSearch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
