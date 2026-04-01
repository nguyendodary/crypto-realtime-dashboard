import type {
  CoinMarket,
  CoinDetail,
  GlobalData,
  TrendingData,
  Category,
  OHLCData,
  SearchData,
  MarketChartData,
  TimeFrame,
} from "@/types";

async function apiGet<T>(url: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const qs = params
    ? "?" + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const res = await fetch(`${url}${qs}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json();
}

class CoinGeckoClient {
  async getGlobalData(): Promise<GlobalData> {
    const data = await apiGet<any>("/api/global");
    return data.data ?? data;
  }

  async getMarketCoins(
    vsCurrency = "usd",
    page = 1,
    perPage = 50,
    order = "market_cap_desc",
    sparkline = true
  ): Promise<CoinMarket[]> {
    return apiGet("/api/coins/markets", {
      vs_currency: vsCurrency,
      order,
      per_page: perPage,
      page,
      sparkline,
      price_change_percentage: "24h,7d",
    });
  }

  async getCoinDetail(id: string): Promise<CoinDetail> {
    return apiGet(`/api/coins/${id}`);
  }

  async getOHLCData(
    id: string,
    vsCurrency = "usd",
    days: TimeFrame = "30"
  ): Promise<OHLCData[]> {
    const data = await apiGet<number[][]>(`/api/coins/${id}/ohlc`, {
      vs_currency: vsCurrency,
      days,
    });
    return data.map((item) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
    }));
  }

  async getMarketChart(
    id: string,
    vsCurrency = "usd",
    days: TimeFrame = "30"
  ): Promise<MarketChartData> {
    return apiGet(`/api/coins/${id}/market_chart`, {
      vs_currency: vsCurrency,
      days,
    });
  }

  async getTrending(): Promise<TrendingData> {
    return apiGet("/api/search/trending");
  }

  async getCategories(perPage = 10): Promise<Category[]> {
    const data = await apiGet<Category[]>("/api/coins/categories");
    return data.slice(0, perPage);
  }

  async search(query: string): Promise<SearchData> {
    if (!query || query.length < 2) {
      return { coins: [], exchanges: [], icos: [], categories: [], nfts: [] };
    }
    return apiGet("/api/search", { query });
  }
}

export const coinGecko = new CoinGeckoClient();
