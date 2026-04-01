"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalData } from "@/hooks/useCrypto";
import { formatLargeNumber, formatPercentage, cn } from "@/lib/utils";

export function GlobalStats() {
  const { data: global, isLoading } = useGlobalData();

  if (isLoading) {
    return <GlobalStatsSkeleton />;
  }

  if (!global) return null;

  const totalMarketCap = global.total_market_cap?.usd ?? 0;
  const totalVolume = global.total_volume?.usd ?? 0;
  const btcDominance = global.market_cap_percentage?.btc ?? 0;
  const ethDominance = global.market_cap_percentage?.eth ?? 0;
  const marketCapChange = global.market_cap_change_percentage_24h_usd ?? 0;

  const stats = [
    {
      label: "Total Market Cap",
      value: formatLargeNumber(totalMarketCap),
      change: marketCapChange,
      icon: DollarSign,
    },
    {
      label: "24h Trading Volume",
      value: formatLargeNumber(totalVolume),
      icon: BarChart3,
    },
    {
      label: "BTC Dominance",
      value: `${btcDominance.toFixed(1)}%`,
      icon: Activity,
    },
    {
      label: "ETH Dominance",
      value: `${ethDominance.toFixed(1)}%`,
      icon: Globe,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-xl lg:text-2xl font-bold font-mono">{stat.value}</p>
                {stat.change !== undefined && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-md",
                      stat.change >= 0
                        ? "text-bullish bg-bullish/10"
                        : "text-bearish bg-bearish/10"
                    )}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercentage(stat.change)}
                  </div>
                )}
                {!stat.change && stat.icon && (
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function GlobalStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-3 w-24 mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
