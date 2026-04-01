"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";

export function Watchlist() {
  const { watchlist, removeFromWatchlist } = useAppStore();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-warning fill-warning" />
          Watchlist
          {watchlist.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {watchlist.length} coins
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Your watchlist is empty</p>
            <p className="text-xs mt-1">Click the star icon on any coin to add it</p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {watchlist.map((coin) => (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <Link
                      href={`/coin/${coin.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{coin.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground uppercase">
                            {coin.symbol}
                          </span>
                          <span className="font-mono text-sm">
                            {formatCurrency(coin.current_price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-mono",
                          (coin.price_change_percentage_24h ?? 0) >= 0
                            ? "text-bullish"
                            : "text-bearish"
                        )}
                      >
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </span>
                      <button
                        onClick={() => removeFromWatchlist(coin.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
