"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Star, ArrowUpDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketCoins } from "@/hooks/useCrypto";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatPercentage, formatLargeNumber, cn } from "@/lib/utils";
import type { CoinMarket, SortField, SortDirection } from "@/types";

const FETCH_COUNT = 250; // Fetch 250 from API per request
const DISPLAY_PER_PAGE = 25; // Show 25 per page on client

export function MarketTable() {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("market_cap_rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { watchlist, addToWatchlist, removeFromWatchlist, livePrices, priceChanges } = useAppStore();

  // Fetch 250 coins once, paginate client-side
  const { data: allCoins, isLoading, error } = useMarketCoins(1, FETCH_COUNT);

  const sortedCoins = useMemo(() => {
    if (!allCoins) return [];

    const sorted = [...allCoins].sort((a, b) => {
      let aVal: string | number | null = a[sortField as keyof CoinMarket] as string | number | null;
      let bVal: string | number | null = b[sortField as keyof CoinMarket] as string | number | null;

      if (aVal === null) aVal = sortDirection === "asc" ? Infinity : -Infinity;
      if (bVal === null) bVal = sortDirection === "asc" ? Infinity : -Infinity;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [allCoins, sortField, sortDirection]);

  // Client-side pagination
  const totalPages = Math.ceil(sortedCoins.length / DISPLAY_PER_PAGE);
  const paginatedCoins = useMemo(() => {
    const start = (page - 1) * DISPLAY_PER_PAGE;
    return sortedCoins.slice(start, start + DISPLAY_PER_PAGE);
  }, [sortedCoins, page]);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(1);
  }, [sortField]);

  const toggleWatchlist = useCallback((e: React.MouseEvent, coin: CoinMarket) => {
    e.preventDefault();
    e.stopPropagation();

    const isWatchlisted = watchlist.some((item) => item.id === coin.id);
    if (isWatchlisted) {
      removeFromWatchlist(coin.id);
    } else {
      addToWatchlist({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_rank: coin.market_cap_rank,
        added_at: Date.now(),
      });
    }
  }, [watchlist, addToWatchlist, removeFromWatchlist]);

  // Page range for display (show max 7 page buttons)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">Failed to load market data. Please try again.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th className="p-4 text-left w-10">
                <Star className="h-4 w-4" />
              </th>
              <SortHeader label="#" field="market_cap_rank" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-left" />
              <SortHeader label="Coin" field="name" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-left" />
              <SortHeader label="Price" field="current_price" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-right" />
              <SortHeader label="24h %" field="price_change_percentage_24h" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-right" />
              <SortHeader label="Volume" field="total_volume" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-right hidden md:table-cell" />
              <SortHeader label="Market Cap" field="market_cap" currentField={sortField} direction={sortDirection} onSort={handleSort} className="text-right hidden lg:table-cell" />
              <th className="p-4 text-right hidden xl:table-cell text-muted-foreground text-sm font-medium">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {isLoading
                ? Array.from({ length: DISPLAY_PER_PAGE }).map((_, i) => <SkeletonRow key={`sk-${i}`} />)
                : paginatedCoins.map((coin, index) => (
                    <MarketRow
                      key={coin.id}
                      coin={coin}
                      index={index}
                      livePrice={livePrices[coin.id]}
                      priceChange={priceChanges[coin.id]}
                      isWatchlisted={watchlist.some((item) => item.id === coin.id)}
                      onToggleWatchlist={toggleWatchlist}
                    />
                  ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * DISPLAY_PER_PAGE + 1}–{Math.min(page * DISPLAY_PER_PAGE, sortedCoins.length)} of {sortedCoins.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "min-w-[32px] h-8 text-sm rounded-md transition-colors",
                    page === p
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentField === field;
  return (
    <th
      className={cn("p-4 cursor-pointer hover:text-foreground transition-colors select-none", isActive && "text-foreground", className)}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </div>
    </th>
  );
}

function MarketRow({
  coin,
  index,
  livePrice,
  priceChange,
  isWatchlisted,
  onToggleWatchlist,
}: {
  coin: CoinMarket;
  index: number;
  livePrice?: number;
  priceChange?: "up" | "down" | null;
  isWatchlisted: boolean;
  onToggleWatchlist: (e: React.MouseEvent, coin: CoinMarket) => void;
}) {
  const displayPrice = livePrice ?? coin.current_price;
  const priceChangeClass = priceChange === "up" ? "text-bullish" : priceChange === "down" ? "text-bearish" : "";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, delay: index * 0.015 }}
      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
    >
      <td className="p-4">
        <button onClick={(e) => onToggleWatchlist(e, coin)} className="text-muted-foreground hover:text-warning transition-colors">
          <Star className={cn("h-4 w-4", isWatchlisted && "fill-warning text-warning")} />
        </button>
      </td>
      <td className="p-4 text-muted-foreground text-sm">{coin.market_cap_rank}</td>
      <td className="p-4">
        <Link href={`/coin/${coin.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
          <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" />
          <div>
            <div className="font-medium">{coin.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
          </div>
        </Link>
      </td>
      <td className={cn("p-4 text-right font-mono", priceChangeClass)}>{formatCurrency(displayPrice)}</td>
      <td className={cn("p-4 text-right font-mono", (coin.price_change_percentage_24h ?? 0) >= 0 ? "text-bullish" : "text-bearish")}>
        {formatPercentage(coin.price_change_percentage_24h)}
      </td>
      <td className="p-4 text-right font-mono hidden md:table-cell">{formatLargeNumber(coin.total_volume)}</td>
      <td className="p-4 text-right font-mono hidden lg:table-cell">{formatLargeNumber(coin.market_cap)}</td>
      <td className="p-4 hidden xl:table-cell">
        <MiniSparkline data={coin.sparkline_in_7d?.price} positive={(coin.price_change_percentage_24h ?? 0) >= 0} />
      </td>
    </motion.tr>
  );
}

function MiniSparkline({ data, positive }: { data?: number[]; positive: boolean }) {
  if (!data || data.length === 0) return <div className="w-24 h-8" />;

  const width = 96;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .filter((_, i) => i % 4 === 0)
    .map((value, index, arr) => {
      const x = (index / (arr.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={positive ? "hsl(var(--bullish))" : "hsl(var(--bearish))"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      <td className="p-4"><Skeleton className="h-4 w-4" /></td>
      <td className="p-4"><Skeleton className="h-4 w-6" /></td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </td>
      <td className="p-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="p-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="p-4 text-right hidden md:table-cell"><Skeleton className="h-4 w-14 ml-auto" /></td>
      <td className="p-4 text-right hidden lg:table-cell"><Skeleton className="h-4 w-14 ml-auto" /></td>
      <td className="p-4 hidden xl:table-cell"><Skeleton className="h-8 w-24" /></td>
    </tr>
  );
}
