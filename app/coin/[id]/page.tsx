"use client";

import { useState, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeframeSelector } from "@/components/charts/TimeframeSelector";
import { useCoinDetail } from "@/hooks/useCrypto";
import { useAppStore } from "@/lib/store";
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  cn,
} from "@/lib/utils";
import type { TimeFrame, WatchlistItem } from "@/types";

// Dynamic imports for charts - loaded lazily
const PriceChart = lazy(() =>
  import("@/components/charts/PriceChart").then((m) => ({ default: m.PriceChart }))
);
const CandlestickChart = lazy(() =>
  import("@/components/charts/CandlestickChart").then((m) => ({ default: m.CandlestickChart }))
);
const VolumeChart = lazy(() =>
  import("@/components/charts/VolumeChart").then((m) => ({ default: m.VolumeChart }))
);

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export default function CoinDetailPage() {
  const params = useParams();
  const coinId = params.id as string;
  const [timeframe, setTimeframe] = useState<TimeFrame>("30");

  const { data: coin, isLoading, error } = useCoinDetail(coinId);
  const { watchlist, addToWatchlist, removeFromWatchlist, livePrices } =
    useAppStore();

  const isWatchlisted = watchlist.some((item) => item.id === coinId);
  const livePrice = livePrices[coinId];

  const toggleWatchlist = () => {
    if (!coin) return;

    if (isWatchlisted) {
      removeFromWatchlist(coinId);
    } else {
      addToWatchlist({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image.small,
        current_price: coin.market_data.current_price.usd,
        price_change_percentage_24h:
          coin.market_data.price_change_percentage_24h,
        market_cap_rank: coin.market_cap_rank,
        added_at: Date.now(),
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">Failed to load coin data.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !coin) {
    return <CoinDetailSkeleton />;
  }

  const marketData = coin.market_data;
  const displayPrice = livePrice ?? marketData.current_price.usd;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={48}
              height={48}
              className="rounded-full"
              priority
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{coin.name}</h1>
                <Badge variant="secondary" className="uppercase">
                  {coin.symbol}
                </Badge>
                {coin.market_cap_rank && (
                  <Badge variant="outline">#{coin.market_cap_rank}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold font-mono">
                  {formatCurrency(displayPrice)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    (marketData.price_change_percentage_24h ?? 0) >= 0
                      ? "text-bullish"
                      : "text-bearish"
                  )}
                >
                  {(marketData.price_change_percentage_24h ?? 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatPercentage(marketData.price_change_percentage_24h)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleWatchlist}
              className={cn(isWatchlisted && "border-warning text-warning")}
            >
              <Star
                className={cn(
                  "h-4 w-4 mr-2",
                  isWatchlisted && "fill-warning"
                )}
              />
              {isWatchlisted ? "Watching" : "Watch"}
            </Button>
            {coin.links.homepage[0] && (
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Charts - lazy loaded */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Price Chart</h2>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<ChartSkeleton />}>
            <PriceChart coinId={coinId} days={timeframe} title="Price" />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <CandlestickChart coinId={coinId} days={timeframe} />
          </Suspense>
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          <VolumeChart coinId={coinId} days={timeframe} />
        </Suspense>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Market Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatRow label="Market Cap" value={formatLargeNumber(marketData.market_cap.usd)} />
            <StatRow label="24h Volume" value={formatLargeNumber(marketData.total_volume.usd)} />
            <StatRow label="Circulating Supply" value={formatLargeNumber(marketData.circulating_supply)} />
            <StatRow label="Total Supply" value={marketData.total_supply ? formatLargeNumber(marketData.total_supply) : "—"} />
            <StatRow label="Max Supply" value={marketData.max_supply ? formatLargeNumber(marketData.max_supply) : "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Price Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChangeRow label="24h" value={marketData.price_change_percentage_24h} />
            <ChangeRow label="7 days" value={marketData.price_change_percentage_7d} />
            <ChangeRow label="14 days" value={marketData.price_change_percentage_14d} />
            <ChangeRow label="30 days" value={marketData.price_change_percentage_30d} />
            <ChangeRow label="1 year" value={marketData.price_change_percentage_1y} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All-Time Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatRow label="All-Time High" value={formatCurrency(marketData.ath.usd)} />
            <ChangeRow label="From ATH" value={marketData.ath_change_percentage.usd} />
            <StatRow label="All-Time Low" value={formatCurrency(marketData.atl.usd)} />
            <ChangeRow label="From ATL" value={marketData.atl_change_percentage.usd} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Description */}
      {coin.description?.en && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    coin.description.en.split(". ").slice(0, 3).join(". ") + ".",
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function ChangeRow({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-medium",
          (value ?? 0) >= 0 ? "text-bullish" : "text-bearish"
        )}
      >
        {formatPercentage(value)}
      </span>
    </div>
  );
}

function CoinDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[260px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
