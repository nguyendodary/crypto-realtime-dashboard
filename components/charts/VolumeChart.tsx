"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketChart } from "@/hooks/useCrypto";
import { formatLargeNumber } from "@/lib/utils";
import type { TimeFrame } from "@/types";

interface VolumeChartProps {
  coinId: string;
  days: TimeFrame;
}

export function VolumeChart({ coinId, days }: VolumeChartProps) {
  const { data, isLoading, error } = useMarketChart(coinId, days);

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.total_volumes.map(([timestamp, volume], index) => {
      const price = data.prices[index]?.[1] ?? 0;
      const prevPrice = data.prices[index - 1]?.[1] ?? price;
      return {
        timestamp,
        volume,
        isUp: price >= prevPrice,
      };
    });
  }, [data]);

  const formatDateTick = (timestamp: number) => {
    const date = new Date(timestamp);
    if (days === "1") return format(date, "HH:mm");
    if (days === "7" || days === "14") return format(date, "EEE");
    if (days === "30" || days === "90") return format(date, "MMM dd");
    return format(date, "MMM yy");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Volume</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No data available — try again shortly
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Volume</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDateTick}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatLargeNumber(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      {format(new Date(data.timestamp), "PPpp")}
                    </div>
                    <div className="font-bold font-mono">
                      {formatLargeNumber(data.volume)}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="volume"
              fill="hsl(var(--primary))"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
