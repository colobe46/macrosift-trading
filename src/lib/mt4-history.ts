import fs from 'fs'
import path from 'path'

const HST_DIR = process.env.MT4_HISTORY_DIR || '/mt4-history'

interface HSTRecord {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface HSTHeader {
  version: number
  symbol: string
  period: number
  digits: number
}

interface HSTResult {
  header: HSTHeader
  records: HSTRecord[]
}

function parseHST(filePath: string): HSTResult {
  const buf = fs.readFileSync(filePath)

  const version = buf.readInt32LE(0)
  const symbol = buf.toString('latin1', 68, 80).replace(/\0/g, '').trim()
  const period = buf.readInt32LE(80)
  const digits = buf.readInt32LE(84)

  const records: HSTRecord[] = []
  const recSize = 60
  const headerSize = 148

  for (let offset = headerSize; offset + recSize <= buf.length; offset += recSize) {
    const rawTime = buf.readBigUInt64LE(offset)
    const time = Number(rawTime)
    const open = buf.readDoubleLE(offset + 8)
    const high = buf.readDoubleLE(offset + 16)
    const low = buf.readDoubleLE(offset + 24)
    const close = buf.readDoubleLE(offset + 32)
    const volume = Number(buf.readBigUInt64LE(offset + 40))
    records.push({ time, open, high, low, close, volume })
  }

  return { header: { version, symbol, period, digits }, records }
}

function findHistoryDirs(): string[] {
  if (!fs.existsSync(HST_DIR)) return []
  return fs.readdirSync(HST_DIR).filter((d: string) => {
    const p = path.join(HST_DIR, d)
    return fs.statSync(p).isDirectory() && d !== 'deleted' && d !== 'downloads' && d !== 'mailbox'
  })
}

export function getOHLCV(
  symbol: string,
  interval: string,
  count: number,
): HSTRecord[] | null {
  const sym = symbol.toUpperCase().replace(/\//g, '')

  for (const dir of findHistoryDirs()) {
    const dirPath = path.join(HST_DIR, dir)
    for (const f of fs.readdirSync(dirPath)) {
      const upperF = f.toUpperCase()
      if (upperF === sym + '240.HST' || upperF.startsWith(sym)) {
        const filePath = path.join(dirPath, f)
        try {
          const { header, records } = parseHST(filePath)
          if (header.symbol.toUpperCase() !== sym) continue

          const intervalMinutes: Record<string, number> = {
            '15m': 15, '30m': 30, '1h': 60, '2h': 120, '4h': 240,
            '8h': 480, '12h': 720, '1d': 1440, '1w': 10080,
          }
          const targetMin = intervalMinutes[interval] || 240

          let bars: HSTRecord[]
          if (targetMin === header.period) {
            bars = records
          } else if (targetMin > header.period) {
            const factor = targetMin / header.period
            const aggregated: HSTRecord[] = []
            for (let i = 0; i < records.length; i += factor) {
              const chunk = records.slice(i, i + factor)
              if (chunk.length === 0) continue
              aggregated.push({
                time: chunk[0].time,
                open: chunk[0].open,
                high: Math.max(...chunk.map((r: HSTRecord) => r.high)),
                low: Math.min(...chunk.map((r: HSTRecord) => r.low)),
                close: chunk[chunk.length - 1].close,
                volume: chunk.reduce((s: number, r: HSTRecord) => s + r.volume, 0),
              })
            }
            bars = aggregated
          } else {
            bars = records
          }

          return bars.slice(-count)
        } catch {
          return null
        }
      }
    }
  }
  return null
}
