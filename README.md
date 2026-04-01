# CryptoPulse

Real-time cryptocurrency analytics dashboard built with Next.js 14, CoinGecko API, and TradingView's lightweight-charts.

## Features

- **Live market data** — Top 250 coins by market cap with client-side sorting and pagination
- **Candlestick charts** — Interactive OHLC charts via TradingView's lightweight-charts
- **Price & volume charts** — Area and bar charts with Recharts
- **Real-time WebSocket** — Binance WebSocket for live price updates
- **Global search** — `Cmd/Ctrl + K` command palette with fuzzy search
- **Watchlist** — Save favorite coins (persisted in localStorage)
- **Dark/Light theme** — Toggle with system preference detection
- **Responsive** — Fully mobile-friendly layout
- **API proxy** — Server-side CoinGecko proxy with caching and throttling

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Custom shadcn-style components |
| Charts | lightweight-charts, Recharts |
| Data fetching | TanStack Query (React Query) |
| State | Zustand |
| Real-time | Binance WebSocket |
| API | CoinGecko (via Next.js API routes) |

## Run Locally

### 1. Clone

```bash
git clone https://github.com/nguyendodary/crypto-realtime-dashboard.git
cd crypto-realtime-dashboard
```

### 2. Install

```bash
npm install
```

### 3. Environment (optional)

```bash
cp .env.example .env
```

Add your CoinGecko API key if you have one (not required for the free tier):

```env
COINGECKO_API_KEY=your-key-here
```

### 4. Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## Run with Docker

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

To stop:

```bash
docker compose down
```

### Option 2: Docker build

```bash
docker build -t cryptopulse .
docker run -d -p 3000:3000 --name cryptopulse cryptopulse
```

To stop and remove:

```bash
docker stop cryptopulse && docker rm cryptopulse
```

### With API key

```bash
docker run -d -p 3000:3000 -e COINGECKO_API_KEY=your-key cryptopulse
```

## Project Structure

```
├── app/
│   ├── api/                    # Next.js API routes (CoinGecko proxy)
│   │   ├── helper.ts           # Rate limiter + in-memory cache
│   │   ├── global/             # Global market stats
│   │   ├── coins/              # Markets, coin detail, OHLC, market chart
│   │   └── search/             # Search + trending
│   ├── coin/[id]/page.tsx      # Coin detail with charts and stats
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Dashboard homepage
├── components/
│   ├── charts/                 # PriceChart, CandlestickChart, VolumeChart, TimeframeSelector
│   ├── market/                 # MarketTable, GlobalStats, TrendingCoins, Categories, Watchlist
│   ├── layout/                 # Header, ThemeToggle, ClientLayout
│   ├── search/                 # CommandSearch (Cmd+K palette)
│   └── ui/                     # Button, Card, Badge, Skeleton, Input, Dialog, Tabs
├── hooks/                      # useCrypto, useWebSocket, useDebounce
├── lib/
│   ├── api.ts                  # API client (fetch-based)
│   ├── store.ts                # Zustand store (watchlist, live prices, UI state)
│   ├── websocket.ts            # Binance WebSocket manager
│   └── utils.ts                # Formatting utilities
└── types/                      # TypeScript type definitions
```

## Deployment

### Vercel

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add `COINGECKO_API_KEY` as an environment variable (optional)
4. Deploy

### Docker

The Docker image is self-contained and runs on any platform that supports Docker.

## API Rate Limiting

The free CoinGecko API allows ~10-30 requests/minute. This project handles it with:

- **Server-side throttle** — 1.2s minimum gap between outgoing requests
- **In-memory cache** — 60s TTL, stale responses returned on 429
- **Client-side dedup** — Identical in-flight requests share a single promise
- **React Query config** — Long stale times (2-10 min), no auto-refetch on focus

## License

MIT
