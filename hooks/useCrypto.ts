"use client";

import { useQuery } from "@tanstack/react-query";
import { coinGecko } from "@/lib/api";
import type { TimeFrame } from "@/types";

export function useGlobalData() {
  return useQuery({
    queryKey: ["globalData"],
    queryFn: () => coinGecko.getGlobalData(),
    staleTime: 5 * 60_000,
  });
}

export function useMarketCoins(
  page = 1,
  perPage = 50,
  order = "market_cap_desc"
) {
  return useQuery({
    queryKey: ["marketCoins", page, perPage, order],
    queryFn: () => coinGecko.getMarketCoins("usd", page, perPage, order, true),
    staleTime: 2 * 60_000,
  });
}

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: ["coinDetail", id],
    queryFn: () => coinGecko.getCoinDetail(id),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}

export function useOHLCData(id: string, days: TimeFrame = "30") {
  return useQuery({
    queryKey: ["ohlcData", id, days],
    queryFn: () => coinGecko.getOHLCData(id, "usd", days),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}

export function useMarketChart(id: string, days: TimeFrame = "30") {
  return useQuery({
    queryKey: ["marketChart", id, days],
    queryFn: () => coinGecko.getMarketChart(id, "usd", days),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: () => coinGecko.getTrending(),
    staleTime: 10 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => coinGecko.getCategories(10),
    staleTime: 10 * 60_000,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => coinGecko.search(query),
    staleTime: 60_000,
    enabled: query.length >= 2,
  });
}
