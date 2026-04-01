import { coingeckoFetch } from "../../helper";

export async function GET() {
  return coingeckoFetch("/coins/categories", {
    order: "market_cap_desc",
  });
}
