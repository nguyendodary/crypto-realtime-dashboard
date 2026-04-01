import { NextResponse } from "next/server";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Simple response cache (in-memory, per server instance)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 60_000; // 60 seconds

// Rate limiter: track last request time
let lastRequestTime = 0;
const MIN_GAP = 1200; // 1.2s between requests = ~50/min max

function getCacheKey(url: string): string {
  return url;
}

function getCached(url: string): any | null {
  const entry = cache.get(url);
  if (entry && entry.expires > Date.now()) return entry.data;
  if (entry) cache.delete(url);
  return null;
}

function setCache(url: string, data: any): void {
  cache.set(url, { data, expires: Date.now() + CACHE_TTL });
}

async function throttle(): Promise<void> {
  const now = Date.now();
  const gap = now - lastRequestTime;
  if (gap < MIN_GAP) {
    await new Promise((r) => setTimeout(r, MIN_GAP - gap));
  }
  lastRequestTime = Date.now();
}

export async function coingeckoFetch(
  path: string,
  params?: Record<string, string>
): Promise<NextResponse> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  if (process.env.COINGECKO_API_KEY) {
    url.searchParams.set("x-cg-demo-api-key", process.env.COINGECKO_API_KEY);
  }

  const fullUrl = url.toString();

  // Return cached response if available
  const cached = getCached(fullUrl);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Throttle outgoing requests
  await throttle();

  try {
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 429) {
      // Return stale cache if we have it, otherwise 429
      const stale = cache.get(fullUrl);
      if (stale) return NextResponse.json(stale.data);
      return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    }

    if (!res.ok) {
      const stale = cache.get(fullUrl);
      if (stale) return NextResponse.json(stale.data);
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    setCache(fullUrl, data);
    return NextResponse.json(data);
  } catch (error: any) {
    const stale = cache.get(fullUrl);
    if (stale) return NextResponse.json(stale.data);
    console.error(`[CoinGecko] ${path}:`, error?.message);
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
