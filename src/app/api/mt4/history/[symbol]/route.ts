import { NextRequest, NextResponse } from "next/server"
import { getOHLCV } from "@/lib/mt4-history"

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  const interval = req.nextUrl.searchParams.get("interval") || "1h"
  const count = Number(req.nextUrl.searchParams.get("count")) || 200

  const data = getOHLCV(symbol, interval, count)
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No MT4 history for " + symbol }, { status: 404 })
  }
  return NextResponse.json(data)
}
