import { prisma } from './db'
import { fetchQuote, fetchOHLCV } from './market-data'
import { computeIndicator, calcRSI, calcMACD, computeMultiOutputIndicator } from './indicators'
import { IndicatorInput } from './indicators'
import { sendTelegramAlert } from './telegram'
import redis from './redis'

async function getPriceFromRedis(symbol: string): Promise<number | null> {
  try {
    const raw = await redis.get(`tick:${symbol.replace(/\//g, '')}`)
    if (raw) {
      const { bid, ask } = JSON.parse(raw)
      return (bid + ask) / 2
    }
  } catch {}
  return null
}

export async function evaluateAlerts(): Promise<void> {
  const alerts = await prisma.alert.findMany({
    where: { enabled: true },
    include: { user: true }
  })

  for (const alert of alerts) {
    try {
      const condition = alert.condition as any
      let triggered = false
      let message = ''

      switch (condition.type) {
        case 'price': {
          let val = await getPriceFromRedis(alert.symbol)
          if (val === null) {
            const quote = await fetchQuote(alert.symbol)
            if (!quote) continue
            val = quote.price
          }
          triggered = condition.operator === 'above' ? val > condition.value
            : condition.operator === 'below' ? val < condition.value
            : condition.operator === 'equals' ? Math.abs(val - condition.value) / condition.value < 0.001
            : false
          if (triggered) message = `${alert.symbol} at ${val.toFixed(2)} ${condition.operator} ${condition.value}`
          break
        }
        case 'percent_change': {
          const quote = await fetchQuote(alert.symbol)
          if (!quote) continue
          const val = quote.changePercent
          triggered = condition.operator === 'above' ? val > condition.value
            : condition.operator === 'below' ? val < condition.value : false
          if (triggered) message = `${alert.symbol} change ${val.toFixed(2)}% ${condition.operator} ${condition.value}%`
          break
        }
        case 'volume': {
          const ohlcv = await fetchOHLCV(alert.symbol, '1h', 50)
          if (ohlcv.length < 10) continue
          const avgVol = ohlcv.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
          const currentVol = ohlcv[ohlcv.length - 1].volume
          const ratio = currentVol / avgVol
          triggered = condition.operator === 'above' ? ratio > condition.value
            : condition.operator === 'below' ? ratio < condition.value : false
          if (triggered) message = `${alert.symbol} volume ${currentVol.toFixed(0)} (${ratio.toFixed(1)}x avg) ${condition.operator} ${condition.value}x`
          break
        }
        case 'indicator': {
          const ohlcv = await fetchOHLCV(alert.symbol, condition.timeframe || '1h', 100)
          if (ohlcv.length < 30) continue
          const input: IndicatorInput = {
            close: ohlcv.map(c => c.close),
            high: ohlcv.map(c => c.high),
            low: ohlcv.map(c => c.low),
            volume: ohlcv.map(c => c.volume),
          }
          const indName = condition.indicator || 'rsi'
          let values: number[]
          if (['macd', 'bb', 'stoch'].includes(indName)) {
            values = computeMultiOutputIndicator(indName, input, {})[indName === 'macd' ? 'macdLine' : indName === 'bb' ? 'middle' : 'k'] || []
          } else {
            values = computeIndicator(indName, input, {})
          }
          if (values.length < 2) continue
          const val = values[values.length - 1]
          triggered = condition.operator === 'above' ? val > condition.value
            : condition.operator === 'below' ? val < condition.value
            : condition.operator === 'crosses_above' ? (values[values.length - 2] <= condition.value && val > condition.value)
            : condition.operator === 'crosses_below' ? (values[values.length - 2] >= condition.value && val < condition.value)
            : false
          const indLabel = condition.indicator?.toUpperCase() || 'RSI'
          if (triggered) message = `${alert.symbol} ${indLabel} at ${val.toFixed(2)} ${condition.operator} ${condition.value} (${condition.timeframe || '1h'})`
          break
        }
      }

      if (triggered && message) {
        const channel = alert.channel
        if (channel === 'telegram' || channel === 'both') {
          await sendTelegramAlert(alert.user.telegramChatId, message)
        }
        await prisma.alertLog.create({
          data: { alertId: alert.id, symbol: alert.symbol, message, sentAt: new Date() }
        })
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() }
        })
      }
    } catch (e) {
      console.error(`Alert ${alert.id} error:`, e)
    }
  }
}

export async function checkUserLimits(userId: string): Promise<{ alertsUsed: number; alertsLimit: number }> {
  const sub = await prisma.subscription.findUnique({ where: { userId } })
  const limit = sub?.alertsLimit || 5
  const count = await prisma.alert.count({ where: { userId } })
  return { alertsUsed: count, alertsLimit: limit }
}
