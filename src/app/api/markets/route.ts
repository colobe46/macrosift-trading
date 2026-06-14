import { NextRequest, NextResponse } from 'next/server'
import { ALL_SYMBOLS, fetchQuote, getCategories } from '@/lib/market-data'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase()

  let filtered = ALL_SYMBOLS
  if (category) {
    const cat = getCategories().find(c => c.name.toLowerCase() === category.toLowerCase())
    if (cat) filtered = filtered.filter(s => cat.coins.includes(s.symbol))
  }
  if (search) {
    filtered = filtered.filter(s => s.symbol.toLowerCase().includes(search) || s.name.toLowerCase().includes(search))
  }

  const limited = filtered.slice(0, 30)
  const results = await Promise.allSettled(
    limited.map(async (s) => {
      const q = await fetchQuote(s.symbol)
      return { ...s, ...(q || { price: 0, change: 0, changePercent: 0 }) }
    })
  )
  const symbols = results.map(r => r.status === 'fulfilled' ? r.value : r.status)

  return NextResponse.json({ symbols, categories: getCategories() })
}
