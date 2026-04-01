import { NextRequest } from "next/server";
import { coingeckoFetch } from "../../helper";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  return coingeckoFetch(`/coins/${id}`, {
    localization: "false",
    tickers: "false",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "false",
  });
}
