"use client";

import { useEffect, useRef, useCallback } from "react";
import { wsManager } from "@/lib/websocket";
import { useAppStore } from "@/lib/store";

/**
 * Hook to initialize WebSocket connection
 */
export function useWebSocket() {
  const { wsConnected } = useAppStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && typeof window !== "undefined") {
      wsManager.connect();
      initialized.current = true;
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { isConnected: wsConnected };
}

/**
 * Hook to subscribe to price updates for specific symbols
 */
export function usePriceSubscription(symbols: string[]) {
  const { livePrices, priceChanges } = useAppStore();

  useEffect(() => {
    if (symbols.length === 0) return;

    wsManager.subscribeToSymbols(symbols);

    return () => {
      // Cleanup handled by wsManager
    };
  }, [symbols.join(",")]);

  return { livePrices, priceChanges };
}

/**
 * Hook to subscribe to a single coin's price
 */
export function useCoinPrice(coinId: string, symbol: string) {
  const { livePrices, priceChanges } = useAppStore();

  useEffect(() => {
    if (!symbol) return;

    const unsubscribe = wsManager.subscribe(symbol, () => {
      // Price is automatically updated in the store
    });

    return unsubscribe;
  }, [symbol]);

  return {
    livePrice: livePrices[coinId],
    priceChange: priceChanges[coinId],
  };
}
