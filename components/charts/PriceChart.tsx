"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
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
import { formatCurrency } from "@/lib/utils";
import type { TimeFrame } from "@/types";

interface PriceChartProps {
  coinId: string;
  days: TimeFrame;
  title?: string;
}

export function PriceChart({ coinId, days, title = "Price" }: PriceChartProps) {
  const { data, isLoading, error } = useMarketChart(coinId, days);

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.prices.map(([timestamp, price], index) => ({
      timestamp,
      date: new Date(timestamp),
      price,
      volume: data.total_volumes[index]?.[1] ?? 0,
    }));
  }, [data]);

  const priceColor = useMemo(() => {
    if (chartData.length < 2) return "#8884d8";
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    return lastPrice >= firstPrice ? "hsl(var(--bullish))" : "hsl(var(--bearish))";
  }, [chartData]);

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
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No data available — try again shortly
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`priceGradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={priceColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={priceColor} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              domain={["auto", "auto"]}
              tickFormatter={(value) => formatCurrency(value)}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
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
                      {formatCurrency(data.price)}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={priceColor}
              strokeWidth={2}
              fill={`url(#priceGradient-${coinId})`}
              dot={false}
              activeDot={{ r: 4, fill: priceColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
