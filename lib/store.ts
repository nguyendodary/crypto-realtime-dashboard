import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CoinMarket, WatchlistItem } from "@/types";

interface AppState {
  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (coin: WatchlistItem) => void;
  removeFromWatchlist: (coinId: string) => void;
  isInWatchlist: (coinId: string) => boolean;

  // Live price updates
  livePrices: Record<string, number>;
  priceChanges: Record<string, "up" | "down" | null>;
  updateLivePrice: (coinId: string, price: number) => void;
  clearPriceChange: (coinId: string) => void;

  // Market data cache
  marketDataCache: CoinMarket[];
  setMarketDataCache: (data: CoinMarket[]) => void;

  // UI State
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // WebSocket connection status
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Sort preferences
  sortField: string;
  sortDirection: "asc" | "desc";
  setSorting: (field: string, direction: "asc" | "desc") => void;

  // Selected currency
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Watchlist
      watchlist: [],
      addToWatchlist: (coin) =>
        set((state) => {
          const exists = state.watchlist.some((item) => item.id === coin.id);
          if (!exists) {
            return { watchlist: [...state.watchlist, coin] };
          }
          return state;
        }),
      removeFromWatchlist: (coinId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== coinId),
        })),
      isInWatchlist: (coinId) => {
        return get().watchlist.some((item) => item.id === coinId);
      },

      // Live prices
      livePrices: {},
      priceChanges: {},
      updateLivePrice: (coinId, price) =>
        set((state) => {
          const prevPrice = state.livePrices[coinId];
          const newPriceChanges = { ...state.priceChanges };
          if (prevPrice !== undefined) {
            newPriceChanges[coinId] = price > prevPrice ? "up" : price < prevPrice ? "down" : null;
          }
          return {
            livePrices: { ...state.livePrices, [coinId]: price },
            priceChanges: newPriceChanges,
          };
        }),
      clearPriceChange: (coinId) =>
        set((state) => ({
          priceChanges: { ...state.priceChanges, [coinId]: null },
        })),

      // Market data cache
      marketDataCache: [],
      setMarketDataCache: (data) => set({ marketDataCache: data }),

      // UI State
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),

      // WebSocket
      wsConnected: false,
      setWsConnected: (connected) => set({ wsConnected: connected }),

      // Sort
      sortField: "market_cap_rank",
      sortDirection: "asc",
      setSorting: (field, direction) =>
        set({ sortField: field, sortDirection: direction }),

      // Currency
      currency: "usd",
      setCurrency: (currency) => set({ currency: currency }),
    }),
    {
      name: "cryptopulse-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        watchlist: state.watchlist,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        currency: state.currency,
      }),
    }
  )
);
