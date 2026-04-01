"use client";

import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { GlobalStats } from "@/components/market/GlobalStats";
import { MarketTable } from "@/components/market/MarketTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Lazy load sidebar widgets
const TrendingCoins = lazy(() =>
  import("@/components/market/TrendingCoins").then((m) => ({ default: m.TrendingCoins }))
);
const Categories = lazy(() =>
  import("@/components/market/Categories").then((m) => ({ default: m.Categories }))
);
const Watchlist = lazy(() =>
  import("@/components/market/Watchlist").then((m) => ({ default: m.Watchlist }))
);

function SidebarCardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track cryptocurrency prices and market trends in real-time
        </p>
      </motion.div>

      {/* Global Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-7 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <GlobalStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Market Table - stays eager loaded */}
        <div className="xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Top Cryptocurrencies</h2>
            <MarketTable />
          </motion.div>
        </div>

        {/* Sidebar - lazy loaded */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Suspense fallback={<SidebarCardSkeleton title="Watchlist" />}>
              <Watchlist />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <Suspense fallback={<SidebarCardSkeleton title="Trending" />}>
              <TrendingCoins />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
          >
            <Suspense fallback={<SidebarCardSkeleton title="Categories" />}>
              <Categories />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
