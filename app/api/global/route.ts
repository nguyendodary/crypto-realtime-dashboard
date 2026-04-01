import { coingeckoFetch } from "../helper";

export async function GET() {
  return coingeckoFetch("/global");
}
