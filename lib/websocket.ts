import { useAppStore } from "./store";

// CoinGecko doesn't have a public WebSocket API
// We simulate real-time updates by polling and using Binance WebSocket for price data

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

type PriceCallback = (update: PriceUpdate) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private subscribers: Map<string, Set<PriceCallback>> = new Map();
  private subscribedSymbols: Set<string> = new Set();
  private isConnecting = false;

  /**
   * Connect to Binance WebSocket for real-time price updates
   * We use the combined streams endpoint for multiple symbols
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;

    // Only run on client side
    if (typeof window === "undefined") return;

    this.isConnecting = true;

    try {
      // Binance combined streams for mini ticker
      this.ws = new WebSocket("wss://stream.binance.com:9443/ws");

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        useAppStore.getState().setWsConnected(true);

        // Re-subscribe to all symbols
        if (this.subscribedSymbols.size > 0) {
          this.subscribeToSymbols(Array.from(this.subscribedSymbols));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === "24hrMiniTicker") {
            const symbol = data.s.toLowerCase();
            const price = parseFloat(data.c);
            const update: PriceUpdate = {
              symbol,
              price,
              timestamp: data.E,
            };

            // Update store
            const coinId = this.symbolToCoinId(symbol);
            if (coinId) {
              useAppStore.getState().updateLivePrice(coinId, price);
            }

            // Notify subscribers
            const callbacks = this.subscribers.get(symbol);
            if (callbacks) {
              callbacks.forEach((cb) => cb(update));
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnecting = false;
        useAppStore.getState().setWsConnected(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.isConnecting = false;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connect(), delay);
  }

  /**
   * Subscribe to price updates for given symbols
   */
  subscribeToSymbols(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Store symbols to subscribe when connected
      symbols.forEach((s) => this.subscribedSymbols.add(s.toLowerCase()));
      this.connect();
      return;
    }

    const streams = symbols.map(
      (s) => `${s.toLowerCase()}usdt@miniTicker`
    );

    const subscribeMsg = {
      method: "SUBSCRIBE",
      params: streams,
      id: Date.now(),
    };

    this.ws.send(JSON.stringify(subscribeMsg));
    symbols.forEach((s) => this.subscribedSymbols.add(s.toLowerCase()));
  }

  /**
   * Unsubscribe from price updates for given symbols
   */
  unsubscribeFromSymbols(symbols: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const streams = symbols.map(
      (s) => `${s.toLowerCase()}usdt@miniTicker`
    );

    const unsubscribeMsg = {
      method: "UNSUBSCRIBE",
      params: streams,
      id: Date.now(),
    };

    this.ws.send(JSON.stringify(unsubscribeMsg));
    symbols.forEach((s) => this.subscribedSymbols.delete(s.toLowerCase()));
  }

  /**
   * Subscribe to updates for a specific symbol
   */
  subscribe(symbol: string, callback: PriceCallback): () => void {
    const key = symbol.toLowerCase();
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Subscribe to the symbol if not already
    if (!this.subscribedSymbols.has(key)) {
      this.subscribeToSymbols([key]);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
      if (this.subscribers.get(key)?.size === 0) {
        this.subscribers.delete(key);
        this.unsubscribeFromSymbols([key]);
      }
    };
  }

  /**
   * Convert Binance symbol to CoinGecko coin ID
   */
  private symbolToCoinId(symbol: string): string | null {
    const symbolMap: Record<string, string> = {
      btcusdt: "bitcoin",
      ethusdt: "ethereum",
      bnbusdt: "binancecoin",
      xrpusdt: "ripple",
      adausdt: "cardano",
      solusdt: "solana",
      dogeusdt: "dogecoin",
      dotusdt: "polkadot",
      maticusdt: "matic-network",
      ltcusdt: "litecoin",
      avaxusdt: "avalanche-2",
      linkusdt: "chainlink",
      uniusdt: "uniswap",
      atomusdt: "cosmos",
      etcusdt: "ethereum-classic",
      xlmusdt: "stellar",
      bchusdt: "bitcoin-cash",
      algousdt: "algorand",
      vetusdt: "vechain",
      filusdt: "filecoin",
    };

    return symbolMap[symbol] || null;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.subscribedSymbols.clear();
    useAppStore.getState().setWsConnected(false);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
