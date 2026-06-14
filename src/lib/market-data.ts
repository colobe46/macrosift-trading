import { OHLCV, MarketSymbol } from '@/types'
import { prisma } from '@/lib/db'

const TWELVE_DATA_BASE = 'https://api.twelvedata.com'
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query'
const BINANCE_API = 'https://api.binance.com/api/v3'

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY || ''
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || ''

export const METAL_NAMES: Record<string, string> = {
  XAUUSD: 'Gold', XAGUSD: 'Silver', XPTUSD: 'Platinum', XPDUSD: 'Palladium',
}

export const CATEGORIES: { name: string; coins: string[] }[] = [
  { name: 'Metals', coins: ['XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD'] },
  { name: 'Indices', coins: ['SP500', 'DJ30', 'NAS100', 'RUS2000'] },
  { name: 'Commodities', coins: ['OIL', 'NGAS'] },
  { name: 'Major Crypto', coins: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX', 'LINK', 'DOT', 'AVAX', 'MATIC', 'LTC', 'BCH', 'XLM', 'ATOM', 'UNI'] },
  { name: 'Altcoins', coins: ['AAVE', 'MKR', 'CRV', 'COMP', 'SNX', 'YFI', 'SUSHI', 'CAKE', 'DYDX', 'PENDLE', 'INJ', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'FET', 'AGIX', 'RNDR', 'AR', 'HNT', 'APT', 'SUI', 'NEAR', 'ALGO', 'EGLD', 'KAS', 'FTM', 'OP', 'ARB', 'XMR', 'ZEC', 'ETC', 'VET'] },
]

export const ALL_COINS = CATEGORIES.flatMap(c => c.coins)

export const COIN_NAMES: Record<string, string> = {
  XAUUSD: 'Gold', XAGUSD: 'Silver', XPTUSD: 'Platinum', XPDUSD: 'Palladium',
  SP500: 'S&P 500', DJ30: 'Dow Jones', NAS100: 'Nasdaq 100', RUS2000: 'Russell 2000',
  OIL: 'Crude Oil', NGAS: 'Natural Gas',
  BTC: 'Bitcoin', ETH: 'Ethereum', BNB: 'BNB', SOL: 'Solana',
  XRP: 'Ripple', ADA: 'Cardano', DOGE: 'Dogecoin', TRX: 'TRON',
  LINK: 'Chainlink', DOT: 'Polkadot', AVAX: 'Avalanche',
  MATIC: 'Polygon', LTC: 'Litecoin', BCH: 'Bitcoin Cash',
  XLM: 'Stellar', ATOM: 'Cosmos', UNI: 'Uniswap',
  AAVE: 'Aave', MKR: 'Maker', CRV: 'Curve', COMP: 'Compound',
  SNX: 'Synthetix', YFI: 'Yearn.finance',
  SUSHI: 'SushiSwap', CAKE: 'PancakeSwap', DYDX: 'dYdX',
  PENDLE: 'Pendle', INJ: 'Injective',
  SHIB: 'Shiba Inu', PEPE: 'Pepe', FLOKI: 'Floki', BONK: 'Bonk', WIF: 'dogwifhat',
  FET: 'Fetch.ai', AGIX: 'SingularityNET',
  RNDR: 'Render', AR: 'Arweave', HNT: 'Helium',
  APT: 'Aptos', SUI: 'Sui', NEAR: 'NEAR Protocol',
  ALGO: 'Algorand', EGLD: 'MultiversX', KAS: 'Kaspa',
  FTM: 'Fantom', OP: 'Optimism', ARB: 'Arbitrum',
  XMR: 'Monero', ZEC: 'Zcash', ETC: 'Ethereum Classic', VET: 'VeChain',
}

const FOREX_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/JPY', 'GBP/JPY', 'EUR/GBP']
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ']
const INDEX_SYMBOLS = ['SPX', 'IXIC', 'DJI', 'DAX', 'FTSE', 'NKY']
export const NON_CRYPTO = new Set(['XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'SP500', 'DJ30', 'NAS100', 'RUS2000', 'OIL', 'NGAS'])

export const ALL_SYMBOLS: MarketSymbol[] = [
  ...CATEGORIES.flatMap(cat => cat.coins.map(s => ({
    symbol: s,
    name: COIN_NAMES[s] || s,
    type: (cat.name === 'Metals' || cat.name === 'Commodities' ? 'commodity' : cat.name === 'Indices' ? 'index' : 'crypto') as MarketSymbol['type'],
    exchange: cat.name === 'Metals' ? 'OTC' : cat.name === 'Indices' ? 'CBOE' : cat.name === 'Commodities' ? 'NYMEX' : 'BINANCE',
    price: 0, change: 0, changePercent: 0,
  }))),
  ...FOREX_SYMBOLS.map(s => ({ symbol: s, name: s, type: 'forex' as const, exchange: 'FX', price: 0, change: 0, changePercent: 0 })),
  ...STOCK_SYMBOLS.map(s => ({ symbol: s, name: s, type: 'stock' as const, exchange: 'NASDAQ', price: 0, change: 0, changePercent: 0 })),
]

let priceCache: Record<string, { price: number; change: number; changePercent: number; high: number; low: number; timestamp: number }> = {}
let pendingRequests = 0
const MAX_CONCURRENT = 5

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function getCoinName(symbol: string): string {
  return COIN_NAMES[symbol.toUpperCase()] || symbol
}

export function getCategoryFor(symbol: string): string | null {
  for (const cat of CATEGORIES) {
    if (cat.coins.includes(symbol.toUpperCase())) return cat.name
  }
  return null
}

async function fetchMetalSpot(): Promise<Record<string, { price: number; previous: number }>> {
  try {
    const res = await fetch('https://mintedmetal.com/api/prices.json', {
      headers: { 'User-Agent': 'MacroSift/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json()
    const result: Record<string, { price: number; previous: number }> = {}
    const map: Record<string, string> = { gold: 'XAUUSD', silver: 'XAGUSD', platinum: 'XPTUSD', palladium: 'XPDUSD' }
    for (const [key, sym] of Object.entries(map)) {
      if (data.metals?.[key]) {
        result[sym] = { price: Number(data.metals[key].price), previous: Number(data.metals[key].previousPrice) }
      }
    }
    return result
  } catch { return {} }
}

async function fetchCryptoPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number; high: number; low: number } | null> {
  if (NON_CRYPTO.has(symbol)) return null
  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}USDT`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (data.lastPrice) {
      return {
        price: Number(data.lastPrice),
        change: Number(data.priceChange || 0),
        changePercent: Number(data.priceChangePercent || 0),
        high: Number(data.highPrice || 0),
        low: Number(data.lowPrice || 0),
      }
    }
    return null
  } catch { return null }
}


async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  const yahooSym = toYahooSymbol(symbol.toUpperCase())
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=5d`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const quote = result.indicators?.quote?.[0]
    const closes = quote?.close?.filter((c: any) => c != null) || []
    if (closes.length < 2) return null
    const price = Number(closes[closes.length - 1])
    const prev = Number(closes[closes.length - 2])
    return { price, change: price - prev, changePercent: prev ? ((price - prev) / prev) * 100 : 0 }
  } catch { return null }
}

export async function fetchQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  const cached = priceCache[symbol]
  if (cached && Date.now() - cached.timestamp < 30000) {
    return { price: cached.price, change: cached.change, changePercent: cached.changePercent }
  }

  if (pendingRequests >= MAX_CONCURRENT) { await sleep(500); return fetchQuote(symbol) }
  pendingRequests++

  try {
    const sym = symbol.toUpperCase()

    if (NON_CRYPTO.has(sym)) {
      if (['XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD'].includes(sym)) {
        const metals = await fetchMetalSpot()
        const m = metals[sym]
        if (m) {
          const changePct = m.previous ? ((m.price - m.previous) / m.previous) * 100 : 0
          priceCache[sym] = { price: m.price, change: m.price - m.previous, changePercent: changePct, high: m.price, low: m.price, timestamp: Date.now() }
          return { price: m.price, change: m.price - m.previous, changePercent: changePct }
        }
      }
      // Try Yahoo Finance for indices/metals
      const yq = await fetchYahooQuote(sym)
      if (yq) {
        priceCache[sym] = { ...yq, high: yq.price, low: yq.price, timestamp: Date.now() }
        return yq
      }
      return null
    }

    if (ALL_COINS.includes(sym)) {
      const crypto = await fetchCryptoPrice(sym)
      if (crypto) {
        priceCache[sym] = { ...crypto, timestamp: Date.now() }
        return { price: crypto.price, change: crypto.change, changePercent: crypto.changePercent }
      }
    }

    if (symbol.includes('/')) {
      const [from, to] = symbol.split('/')
      const res = await fetch(`${TWELVE_DATA_BASE}/quote?symbol=${from}/${to}&apikey=${TWELVE_DATA_KEY}`, { signal: AbortSignal.timeout(8000) })
      const data = await res.json()
      if (data.price) {
        const p = { price: Number(data.price), change: Number(data.change || 0), changePercent: Number(data.percent_change || 0) }
        priceCache[symbol] = { ...p, high: 0, low: 0, timestamp: Date.now() }
        return p
      }
    }

    const alphaSym = symbol.replace('/USD', '').replace('/USDT', '').replace('/', '')
    const res = await fetch(`${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${alphaSym}&apikey=${ALPHA_VANTAGE_KEY}`, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    const q = data['Global Quote']
    if (q?.['05. price']) {
      const p = {
        price: Number(q['05. price']),
        change: Number(q['09. change'] || 0),
        changePercent: Number((q['10. change percent'] || '0%').replace('%', '')),
      }
      priceCache[symbol] = { ...p, high: 0, low: 0, timestamp: Date.now() }
      return p
    }
    return null
  } catch { return null }
  finally { pendingRequests-- }
}

const YAHOO_SYMBOLS: Record<string, string> = {
  'XAUUSD': 'GC=F', 'XAGUSD': 'SI=F', 'OIL': 'CL=F', 'NGAS': 'NG=F',
  'SP500': '^GSPC', 'DJ30': '^DJI', 'NAS100': '^NDX', 'RUS2000': '^RUT',
}

function toYahooSymbol(sym: string): string {
  if (YAHOO_SYMBOLS[sym]) return YAHOO_SYMBOLS[sym]
  if (sym.includes('/')) return sym.replace('/', '') + '=X'
  return sym
}

async function fetchYahooOHLCV(symbol: string, interval: string, count: number): Promise<OHLCV[]> {
  const yahooSym = toYahooSymbol(symbol.toUpperCase())
  const yahooInterval: Record<string, string> = { '15m': '15m', '30m': '30m', '1h': '60m', '4h': '60m', '1d': '1d', '1w': '1wk' }
  const yi = yahooInterval[interval] || '60m'
  const rangeMap: Record<string, string> = { '15m': '5d', '30m': '5d', '60m': '5d' }
  const range = rangeMap[yi] || (count <= 100 ? '3mo' : count <= 200 ? '6mo' : '1y')

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${yi}&range=${range}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    })
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result?.timestamp) return []
    const quote = result.indicators?.quote?.[0]
    if (!quote) return []
    const timestamps: number[] = result.timestamp
    const data: OHLCV[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = quote.open?.[i], h = quote.high?.[i], l = quote.low?.[i], c = quote.close?.[i]
      if (o == null || c == null) continue
      data.push({ time: timestamps[i], open: Number(o), high: Number(h ?? o), low: Number(l ?? o), close: Number(c), volume: Number(quote.volume?.[i] ?? 0) })
    }
    return data.slice(-count)
  } catch {
    return []
  }
}

export async function fetchOHLCV(symbol: string, interval: string = '1h', count: number = 200): Promise<OHLCV[]> {
  try {
    const sym = symbol.toUpperCase()

    // Try Yahoo Finance first (free, no API key needed)
    if (!ALL_COINS.includes(sym) || NON_CRYPTO.has(sym)) {
      const yahooData = await fetchYahooOHLCV(symbol, interval, count)
      if (yahooData.length > 0) return yahooData
    }

    if (NON_CRYPTO.has(sym) && TWELVE_DATA_KEY) {
      const tdSymbol = METAL_NAMES[sym] ? `${sym.slice(0, 3)}/${sym.slice(3)}` : sym
      const res = await fetch(`${TWELVE_DATA_BASE}/time_series?symbol=${tdSymbol}&interval=${interval}&outputsize=${count}&apikey=${TWELVE_DATA_KEY}`, {
        signal: AbortSignal.timeout(10000),
      })
      const td = await res.json()
      if (td.values) {
        return td.values.map((v: any) => ({
          time: new Date(v.datetime).getTime() / 1000,
          open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close), volume: Number(v.volume || 0),
        })).reverse()
      }
    }

    if (!NON_CRYPTO.has(sym) && ALL_COINS.includes(sym)) {
      const binanceInterval = interval === '1h' ? '1h' : interval === '4h' ? '4h' : interval === '1d' ? '1d' : interval === '15m' ? '15m' : '1h'
      const res = await fetch(`${BINANCE_API}/klines?symbol=${sym}USDT&interval=${binanceInterval}&limit=${count}`, {
        signal: AbortSignal.timeout(10000),
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((k: any[]) => ({
          time: Math.floor(k[0] / 1000),
          open: Number(k[1]), high: Number(k[2]), low: Number(k[3]), close: Number(k[4]), volume: Number(k[5]),
        }))
      }
    }

    if (symbol.includes('/')) {
      const [from, to] = symbol.split('/')
      const res = await fetch(`${TWELVE_DATA_BASE}/time_series?symbol=${from}/${to}&interval=${interval}&outputsize=${count}&apikey=${TWELVE_DATA_KEY}`, { signal: AbortSignal.timeout(10000) })
      const data = await res.json()
      if (data.values) {
        return data.values.map((v: any) => ({
          time: new Date(v.datetime).getTime() / 1000,
          open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close), volume: Number(v.volume || 0),
        })).reverse()
      }
    }

    const alphaInterval = interval === '1h' ? '60min' : interval === '1d' ? 'daily' : interval === '1w' ? 'weekly' : '60min'
    const fn = alphaInterval === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY'
    const extra = alphaInterval === '60min' ? '&interval=60min' : ''
    const res = await fetch(`${ALPHA_VANTAGE_BASE}?function=${fn}&symbol=${symbol.replace('/', '')}${extra}&outputsize=compact&apikey=${ALPHA_VANTAGE_KEY}`, { signal: AbortSignal.timeout(10000) })
    const data = await res.json()
    const series = data[`Time Series (${alphaInterval === '60min' ? '60min' : 'Daily'})`]
    if (series) {
      return Object.entries(series).slice(0, count).map(([time, v]: [string, any]) => ({
        time: new Date(time).getTime() / 1000,
        open: Number(v['1. open']), high: Number(v['2. high']), low: Number(v['3. low']), close: Number(v['4. close']), volume: Number(v['5. volume'] || 0),
      })).reverse()
    }
    const dbSymbol = symbol.includes("/") ? symbol.replace("/", "").toUpperCase() : symbol.toUpperCase()
    const intervalSeconds: Record<string, number> = { "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400, "1w": 604800 }
    const chunkSec = intervalSeconds[interval] || 3600
    const since = Math.floor(Date.now() / 1000) - chunkSec * count

    const ticks = await prisma.tick.findMany({
      where: { symbol: dbSymbol, createdAt: { gte: new Date(since * 1000) } },
      orderBy: { createdAt: "asc" },
      select: { bid: true, createdAt: true },
    })
    if (!ticks.length) return []

    const buckets = new Map<number, { open: number; high: number; low: number; close: number; time: number; volume: number }>()
    for (const t of ticks) {
      const ts = Math.floor(t.createdAt.getTime() / 1000)
      const start = Math.floor(ts / chunkSec) * chunkSec
      const bid = Number(t.bid)
      if (!buckets.has(start)) buckets.set(start, { open: bid, high: bid, low: bid, close: bid, time: start, volume: 0 })
      else { const c = buckets.get(start)!; c.high = Math.max(c.high, bid); c.low = Math.min(c.low, bid); c.close = bid; c.volume++ }
    }
    return Array.from(buckets.values()).sort((a, b) => a.time - b.time)
  } catch { return [] }
}

export async function updateAllPrices(): Promise<MarketSymbol[]> {
  const results: MarketSymbol[] = []
  for (const s of ALL_SYMBOLS) {
    const quote = await fetchQuote(s.symbol)
    if (quote) results.push({ ...s, ...quote })
    else results.push(s)
    await sleep(200)
  }
  return results
}

export function getCategories(): { name: string; coins: string[] }[] {
  return CATEGORIES
}
