import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SYMBOLS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex', exchange: 'FX' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex', exchange: 'FX' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex', exchange: 'FX' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex', exchange: 'FX' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex', exchange: 'FX' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex', exchange: 'FX' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex', exchange: 'FX' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', type: 'crypto', exchange: 'BINANCE' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', type: 'crypto', exchange: 'BINANCE' },
  { symbol: 'SPX', name: 'S&P 500 Index', type: 'index', exchange: 'CBOE' },
  { symbol: 'IXIC', name: 'Nasdaq Composite', type: 'index', exchange: 'NASDAQ' },
  { symbol: 'DJI', name: 'Dow Jones Industrial Average', type: 'index', exchange: 'CBOE' },
]

async function main() {
  console.log('Seeding database...')

  for (const s of DEFAULT_SYMBOLS) {
    console.log(`  ${s.symbol} (${s.name})`)
  }

  const existingUsers = await prisma.user.count()
  console.log(`\nExisting users: ${existingUsers}`)
  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
