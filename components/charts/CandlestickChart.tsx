"use client";

import { useRef, useEffect, useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOHLCData } from "@/hooks/useCrypto";
import type { TimeFrame, OHLCData } from "@/types";
import type { UTCTimestamp } from "lightweight-charts";

interface Props {
  coinId: string;
  days: TimeFrame;
}

function CandlestickChartInner({ coinId, days }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  const { data, isLoading, error } = useOHLCData(coinId, days);

  // Create chart once container is in DOM
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    let disposed = false;
    let ro: ResizeObserver | null = null;

    requestAnimationFrame(() => {
      if (disposed || !boxRef.current) return;

      import("lightweight-charts").then(({ createChart }) => {
        if (disposed) return;

        const chart = createChart(el, {
          width: el.clientWidth || 700,
          height: 400,
          layout: { background: { color: "transparent" }, textColor: "#9ca3af" },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.05)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
          timeScale: {
            borderColor: "rgba(255,255,255,0.1)",
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const series = chart.addCandlestickSeries({
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        });

        chartRef.current = chart;
        seriesRef.current = series;
        setChartReady(true);

        ro = new ResizeObserver(([entry]) => {
          if (entry && chartRef.current) {
            chartRef.current.applyOptions({ width: entry.contentRect.width });
          }
        });
        ro.observe(el);
      });
    });

    return () => {
      disposed = true;
      ro?.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  // Feed data when chart is ready AND data is available
  useEffect(() => {
    if (!chartReady || !seriesRef.current || !data || data.length === 0) return;

    const seen = new Set<number>();
    const bars: { time: UTCTimestamp; open: number; high: number; low: number; close: number }[] = [];

    for (const d of data) {
      const t = Math.floor(d.timestamp / 1000);
      if (seen.has(t)) continue;
      seen.add(t);
      bars.push({ time: t as UTCTimestamp, open: d.open, high: d.high, low: d.low, close: d.close });
    }

    seriesRef.current.setData(bars);
    chartRef.current?.timeScale().fitContent();
  }, [data, chartReady]);

  return (
    <Card>
      <CardHeader className="pb-0"><CardTitle className="text-base">Candlestick Chart</CardTitle></CardHeader>
      <CardContent className="pt-4">
        <div className="relative" style={{ height: 400 }}>
          {/* Overlay: loading */}
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-card flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          {/* Overlay: error / no data */}
          {(error || !data || data.length === 0) && !isLoading && (
            <div className="absolute inset-0 z-10 bg-card flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              {error ? "Failed to load chart data" : "No data available"}
            </div>
          )}
          {/* Container always rendered so ref is available */}
          <div ref={boxRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </CardContent>
    </Card>
  );
}

export const CandlestickChart = memo(CandlestickChartInner);
