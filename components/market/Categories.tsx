"use client";

import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCrypto";
import { formatLargeNumber, formatPercentage, cn } from "@/lib/utils";

export function Categories() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  if (!categories) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5 text-primary" />
          Top Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.slice(0, 8).map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{category.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatLargeNumber(category.market_cap)} market cap
              </div>
            </div>
            <Badge
              variant={
                (category.market_cap_change_24h ?? 0) >= 0 ? "success" : "destructive"
              }
              className="text-xs"
            >
              {formatPercentage(category.market_cap_change_24h)}
            </Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function CategoriesSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div>
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
