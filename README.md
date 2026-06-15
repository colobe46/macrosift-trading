# MacroSift Trading Platform

Real-time trading intelligence with MT4 integration, professional charts, and multi-source market data.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **lightweight-charts** (TradingView candlestick charts)
- **PostgreSQL** (Prisma ORM) + **Redis** (BullMQ)
- **Docker Compose** (postgres, redis, app, bot, tick-simulator)
- **Yahoo Finance**, Binance, Twelve Data, Alpha Vantage (market data)
- **MetaTrader 4** integration via EA (.ex4) + Wine (optional)

## Quick Start

```bash
git clone https://github.com/colobe46/macrosift-trading.git
cd macrosift-trading
cp .env.example .env
# Edit .env with your API keys
docker compose up -d
# Run DB migrations
docker compose exec app npx prisma migrate deploy
```

Open http://localhost:3000

## With MT4 History (optional)

If you have MetaTrader 4 installed with `.hst` history files:

```bash
# Set MT4_HOST_HISTORY in .env to your MT4 history path
docker compose --profile mt4 up -d
```

Symbols supported via MT4: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, NZDUSD, USDCAD, and crosses.

## Market Data Sources

| Source | Symbols | Requires API Key |
|--------|---------|-----------------|
| MT4 .hst files | Forex (4H+) | No |
| Yahoo Finance | Indices, Metals, Forex, Stocks | No |
| Binance | Crypto | No |
| Twelve Data | Forex, Metals, Indices | Yes (free 800/day) |
| Alpha Vantage | Stocks, ETFs | Yes (free 25/day) |

Data source priority: MT4 (if available) → Yahoo Finance → Binance (crypto) → Twelve Data → Alpha Vantage → PostgreSQL ticks.

## Services

```
docker compose up -d          # app, postgres, redis, bot, tick-simulator
docker compose --profile mt4 up -d  # + mt4-history-sync
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID/SECRET` — for OAuth login
- Market data keys (optional, Yahoo Finance works without keys)
