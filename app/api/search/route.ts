import { NextRequest } from "next/server";
import { coingeckoFetch } from "../helper";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query") ?? "";

  if (query.length < 2) {
    return Response.json({ coins: [], exchanges: [], icos: [], categories: [], nfts: [] });
  }

  return coingeckoFetch("/search", { query });
}
