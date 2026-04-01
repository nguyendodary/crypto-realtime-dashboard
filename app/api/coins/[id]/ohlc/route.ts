import { NextRequest } from "next/server";
import { coingeckoFetch } from "../../../helper";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { searchParams } = request.nextUrl;

  return coingeckoFetch(`/coins/${id}/ohlc`, {
    vs_currency: searchParams.get("vs_currency") ?? "usd",
    days: searchParams.get("days") ?? "30",
  });
}
