"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useSearch } from "@/hooks/useCrypto";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CommandSearch() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  const { data: results, isLoading } = useSearch(debouncedQuery);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const coins = results?.coins ?? [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, coins.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (coins[selectedIndex]) {
            router.push(`/coin/${coins[selectedIndex].id}`);
            setSearchOpen(false);
          }
          break;
        case "Escape":
          setSearchOpen(false);
          break;
      }
    },
    [coins, selectedIndex, router, setSearchOpen]
  );

  const handleSelect = (coinId: string) => {
    router.push(`/coin/${coinId}`);
    setSearchOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search coins...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-background border border-border rounded">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <Dialog open={isSearchOpen} onOpenChange={setSearchOpen}>
        <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-xl translate-x-[-50%]">
          <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search cryptocurrencies..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              />
              <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading && debouncedQuery.length >= 2 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Searching...
                </div>
              )}

              {!isLoading && debouncedQuery.length >= 2 && coins.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No results found for "{debouncedQuery}"</p>
                </div>
              )}

              {debouncedQuery.length < 2 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">Type at least 2 characters to search</p>
                </div>
              )}

              {coins.length > 0 && (
                <div className="py-2">
                  {coins.slice(0, 10).map((coin, index) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelect(coin.id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        index === selectedIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                          {coin.market_cap_rank && ` · #${coin.market_cap_rank}`}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted border border-border rounded">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-muted border border-border rounded">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted border border-border rounded">↵</kbd>
                  to select
                </span>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
