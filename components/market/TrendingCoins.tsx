"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrending } from "@/hooks/useCrypto";

export function TrendingCoins() {
  const { data: trending, isLoading } = useTrending();

  if (isLoading) {
    return <TrendingSkeleton />;
  }

  if (!trending) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-warning" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trending.coins.slice(0, 7).map(({ item }, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Link
              href={`/coin/${item.id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">{index + 1}</span>
                <Image
                  src={item.small}
                  alt={item.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground uppercase">{item.symbol}</div>
                </div>
              </div>
              {item.market_cap_rank && (
                <span className="text-xs text-muted-foreground">
                  #{item.market_cap_rank}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
