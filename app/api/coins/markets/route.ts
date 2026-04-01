import { NextRequest } from "next/server";
import { coingeckoFetch } from "../../helper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const params: Record<string, string> = {
    vs_currency: searchParams.get("vs_currency") ?? "usd",
    order: searchParams.get("order") ?? "market_cap_desc",
    per_page: searchParams.get("per_page") ?? "50",
    page: searchParams.get("page") ?? "1",
    sparkline: searchParams.get("sparkline") ?? "true",
    price_change_percentage: searchParams.get("price_change_percentage") ?? "24h,7d",
  };

  return coingeckoFetch("/coins/markets", params);
}
