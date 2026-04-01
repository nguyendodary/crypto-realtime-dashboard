# CryptoPulse

Real-time cryptocurrency analytics dashboard built with Next.js 14, CoinGecko API, and lightweight-charts.

## Features

- **Live market data** — Top 250 coins by market cap with sorting and pagination
- **Candlestick charts** — Interactive OHLC charts via TradingView's lightweight-charts
- **Price & volume charts** — Area and bar charts with Recharts
- **Real-time WebSocket** — Binance WebSocket for live price updates
- **Global search** — `Cmd/Ctrl + K` command palette with fuzzy search
- **Watchlist** — Save favorite coins (persisted in localStorage)
- **Dark/Light theme** — Toggle with system preference detection
- **Responsive** — Fully mobile-friendly layout
- **Rate-limited API proxy** — Server-side CoinGecko proxy with caching and throttling

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

## Prerequisites

- Node.js 18+
- npm or pnpm
- Docker & Docker Compose (optional)

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/nguyendodary/crypto-realtime-dashboard.git
cd crypto-realtime-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables (optional)

```bash
cp .env.example .env
```

Edit `.env` to add your CoinGecko API key if you have one (not required for the free tier):

```env
COINGECKO_API_KEY=your-key-here
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

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

### Option 2: Docker build directly

```bash
# Build the image
docker build -t cryptopulse .

# Run the container
docker run -d -p 3000:3000 --name cryptopulse cryptopulse
```

To stop and remove:

```bash
docker stop cryptopulse
docker rm cryptopulse
```

### With API key (Docker)

```bash
docker run -d -p 3000:3000 -e COINGECKO_API_KEY=your-key cryptopulse
```

Or in `docker-compose.yml`:

```yaml
environment:
  - COINGECKO_API_KEY=your-key
```

## Project Structure

```
├── app/
│   ├── api/                    # Next.js API routes (CoinGecko proxy)
│   │   ├── helper.ts           # Rate limiter + cache
│   │   ├── global/
│   │   ├── coins/
│   │   └── search/
│   ├── coin/[id]/page.tsx      # Coin detail page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Dashboard homepage
├── components/
│   ├── charts/                 # Price, Candlestick, Volume charts
│   ├── market/                 # MarketTable, GlobalStats, Watchlist
│   ├── layout/                 # Header, ThemeToggle
│   ├── search/                 # Command palette (Cmd+K)
│   └── ui/                     # Button, Card, Badge, Skeleton
├── hooks/                      # useCrypto, useWebSocket, useDebounce
├── lib/
│   ├── api.ts                  # API client
│   ├── store.ts                # Zustand store
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

### Docker / Any Host

The Docker image is self-contained and runs on any platform that supports Docker.

## API Rate Limiting

The free CoinGecko API allows ~10-30 requests/minute. This project handles it with:

- **Server-side throttle** — 1.2s minimum gap between outgoing requests
- **In-memory cache** — 60s TTL, stale responses returned on 429
- **Client-side dedup** — Identical in-flight requests share a single promise
- **React Query config** — Long stale times (2-10 min), no auto-refetch on focus

## License

MIT
