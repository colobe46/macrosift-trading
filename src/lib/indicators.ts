export interface IndicatorInput {
  close: number[]
  high: number[]
  low: number[]
  volume: number[]
}

export interface IndicatorMeta {
  name: string
  label: string
  category: 'trend' | 'oscillator' | 'volatility' | 'volume'
  params: { key: string; label: string; default: number }[]
}

export const INDICATOR_LIST: IndicatorMeta[] = [
  { name: 'sma', label: 'Simple Moving Average', category: 'trend', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'ema', label: 'Exponential Moving Average', category: 'trend', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'wma', label: 'Weighted Moving Average', category: 'trend', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'hma', label: 'Hull Moving Average', category: 'trend', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'rsi', label: 'Relative Strength Index', category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 14 }] },
  { name: 'macd', label: 'MACD', category: 'oscillator', params: [{ key: 'fastPeriod', label: 'Fast', default: 12 }, { key: 'slowPeriod', label: 'Slow', default: 26 }, { key: 'signalPeriod', label: 'Signal', default: 9 }] },
  { name: 'bb', label: 'Bollinger Bands', category: 'volatility', params: [{ key: 'period', label: 'Period', default: 20 }, { key: 'stdDev', label: 'Std Dev', default: 2 }] },
  { name: 'atr', label: 'Average True Range', category: 'volatility', params: [{ key: 'period', label: 'Period', default: 14 }] },
  { name: 'stoch', label: 'Stochastic', category: 'oscillator', params: [{ key: 'kPeriod', label: '%K Period', default: 14 }, { key: 'dPeriod', label: '%D Period', default: 3 }] },
  { name: 'adx', label: 'Average Directional Index', category: 'trend', params: [{ key: 'period', label: 'Period', default: 14 }] },
  { name: 'obv', label: 'On Balance Volume', category: 'volume', params: [] },
  { name: 'mfi', label: 'Money Flow Index', category: 'volume', params: [{ key: 'period', label: 'Period', default: 14 }] },
  { name: 'cci', label: 'Commodity Channel Index', category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'williams_r', label: "Williams %R", category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 14 }] },
  { name: 'ichimoku', label: 'Ichimoku Cloud', category: 'trend', params: [{ key: 'conversionPeriod', label: 'Conversion', default: 9 }, { key: 'basePeriod', label: 'Base', default: 26 }, { key: 'spanPeriod', label: 'Span', default: 52 }] },
  { name: 'supertrend', label: 'Supertrend', category: 'trend', params: [{ key: 'period', label: 'Period', default: 10 }, { key: 'multiplier', label: 'Multiplier', default: 3 }] },
  { name: 'psar', label: 'Parabolic SAR', category: 'trend', params: [{ key: 'step', label: 'Step', default: 0.02 }, { key: 'maxStep', label: 'Max Step', default: 0.2 }] },
  { name: 'keltner', label: 'Keltner Channels', category: 'volatility', params: [{ key: 'period', label: 'Period', default: 20 }, { key: 'multiplier', label: 'ATR Multiplier', default: 2 }] },
  { name: 'donchian', label: 'Donchian Channels', category: 'volatility', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'vwap', label: 'VWAP', category: 'volume', params: [] },
  { name: 'roc', label: 'Rate of Change', category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 12 }] },
  { name: 'awesome', label: 'Awesome Oscillator', category: 'oscillator', params: [{ key: 'fastPeriod', label: 'Fast', default: 5 }, { key: 'slowPeriod', label: 'Slow', default: 34 }] },
  { name: 'bulls_power', label: "Bulls Power", category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 13 }] },
  { name: 'bears_power', label: "Bears Power", category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 13 }] },
  { name: 'cmf', label: 'Chaikin Money Flow', category: 'volume', params: [{ key: 'period', label: 'Period', default: 20 }] },
  { name: 'aroon', label: 'Aroon', category: 'trend', params: [{ key: 'period', label: 'Period', default: 25 }] },
  { name: 'trix', label: 'TRIX', category: 'oscillator', params: [{ key: 'period', label: 'Period', default: 18 }] },
]

function sum(arr: number[]): number { return arr.reduce((a, b) => a + b, 0) }
function avg(arr: number[]): number { return arr.length === 0 ? 0 : sum(arr) / arr.length }
function stdDev(arr: number[]): number {
  const m = avg(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}
function highest(arr: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - period + 1)
    result.push(Math.max(...arr.slice(start, i + 1)))
  }
  return result
}
function lowest(arr: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - period + 1)
    result.push(Math.min(...arr.slice(start, i + 1)))
  }
  return result
}

function ema(values: number[], period: number): number[] {
  const result: number[] = []
  const k = 2 / (period + 1)
  let prev = avg(values.slice(0, period))
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(0); continue }
    if (i === period - 1) { result.push(prev); continue }
    prev = values[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

function sma(values: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(0); continue }
    result.push(avg(values.slice(i - period + 1, i + 1)))
  }
  return result
}

function wma(values: number[], period: number): number[] {
  const result: number[] = []
  const weightSum = (period * (period + 1)) / 2
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(0); continue }
    let wsum = 0
    for (let j = 0; j < period; j++) wsum += values[i - period + 1 + j] * (j + 1)
    result.push(wsum / weightSum)
  }
  return result
}

function hma(values: number[], period: number): number[] {
  const half = Math.floor(period / 2)
  const sqrt = Math.floor(Math.sqrt(period))
  const wmaHalf = wma(values, half)
  const wmaFull = wma(values, period)
  const diff: number[] = []
  for (let i = 0; i < values.length; i++) diff.push(2 * wmaHalf[i] - wmaFull[i])
  return wma(diff, sqrt)
}

export function calcSMA(data: IndicatorInput, period: number) { return sma(data.close, period) }
export function calcEMA(data: IndicatorInput, period: number) { return ema(data.close, period) }
export function calcWMA(data: IndicatorInput, period: number) { return wma(data.close, period) }
export function calcHMA(data: IndicatorInput, period: number) { return hma(data.close, period) }

export function calcRSI(data: IndicatorInput, period: number = 14): number[] {
  const changes: number[] = []
  for (let i = 1; i < data.close.length; i++) changes.push(data.close[i] - data.close[i - 1])
  const gains = changes.map(c => c > 0 ? c : 0)
  const losses = changes.map(c => c < 0 ? -c : 0)
  const result: number[] = [0]
  let avgGain = avg(gains.slice(0, period))
  let avgLoss = avg(losses.slice(0, period))
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push(100 - 100 / (1 + rs))
  }
  while (result.length < data.close.length) result.unshift(0)
  return result
}

export function calcMACD(data: IndicatorInput, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fast = ema(data.close, fastPeriod)
  const slow = ema(data.close, slowPeriod)
  const macdLine: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (fast[i] === 0 || slow[i] === 0) { macdLine.push(0); continue }
    macdLine.push(fast[i] - slow[i])
  }
  const signal = ema(macdLine, signalPeriod)
  const histogram: number[] = []
  for (let i = 0; i < data.close.length; i++) histogram.push(macdLine[i] - signal[i])
  return { macdLine, signal, histogram }
}

export function calcBB(data: IndicatorInput, period = 20, stdDevMult = 2) {
  const middle = sma(data.close, period)
  const upper: number[] = []
  const lower: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period - 1) { upper.push(0); lower.push(0); continue }
    const sd = stdDev(data.close.slice(i - period + 1, i + 1))
    upper.push(middle[i] + sd * stdDevMult)
    lower.push(middle[i] - sd * stdDevMult)
  }
  return { upper, middle, lower }
}

export function calcATR(data: IndicatorInput, period = 14): number[] {
  const tr: number[] = [0]
  for (let i = 1; i < data.high.length; i++) {
    const hl = data.high[i] - data.low[i]
    const hc = Math.abs(data.high[i] - data.close[i - 1])
    const lc = Math.abs(data.low[i] - data.close[i - 1])
    tr.push(Math.max(hl, hc, lc))
  }
  const result: number[] = [avg(tr.slice(0, period))]
  for (let i = period + 1; i < tr.length; i++) result.push((result[result.length - 1] * (period - 1) + tr[i]) / period)
  while (result.length < data.close.length) result.unshift(0)
  return result
}

export function calcStoch(data: IndicatorInput, kPeriod = 14, dPeriod = 3) {
  const k: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < kPeriod - 1) { k.push(50); continue }
    const hh = Math.max(...data.high.slice(i - kPeriod + 1, i + 1))
    const ll = Math.min(...data.low.slice(i - kPeriod + 1, i + 1))
    k.push(hh === ll ? 50 : ((data.close[i] - ll) / (hh - ll)) * 100)
  }
  return { k, d: sma(k, dPeriod) }
}

export function calcADX(data: IndicatorInput, period = 14): number[] {
  const tr = [0]; const up = [0]; const down = [0]
  for (let i = 1; i < data.high.length; i++) {
    const hl = data.high[i] - data.low[i]
    const hc = Math.abs(data.high[i] - data.close[i - 1])
    const lc = Math.abs(data.low[i] - data.close[i - 1])
    tr.push(Math.max(hl, hc, lc))
    up.push(data.high[i] - data.high[i - 1])
    down.push(data.low[i - 1] - data.low[i])
  }
  const atr_ = sma(tr, period)
  const result: number[] = [0]
  for (let i = period; i < tr.length; i++) {
    const pDi = (up[i] > down[i] && up[i] > 0) ? (up[i] / atr_[i]) * 100 : 0
    const nDi = (down[i] > up[i] && down[i] > 0) ? (down[i] / atr_[i]) * 100 : 0
    const dx = (pDi + nDi === 0) ? 0 : Math.abs(pDi - nDi) / (pDi + nDi) * 100
    result.push(dx)
  }
  const adx = sma(result, period)
  while (adx.length < data.close.length) adx.unshift(0)
  return adx
}

export function calcOBV(data: IndicatorInput): number[] {
  const result: number[] = [0]
  for (let i = 1; i < data.close.length; i++) {
    if (data.close[i] > data.close[i - 1]) result.push(result[i - 1] + data.volume[i])
    else if (data.close[i] < data.close[i - 1]) result.push(result[i - 1] - data.volume[i])
    else result.push(result[i - 1])
  }
  return result
}

export function calcMFI(data: IndicatorInput, period = 14): number[] {
  const result: number[] = []
  const typicalPrice: number[] = []
  const rawMoney: number[] = []
  for (let i = 0; i < data.high.length; i++) {
    const tp = (data.high[i] + data.low[i] + data.close[i]) / 3
    typicalPrice.push(tp)
    rawMoney.push(tp * data.volume[i])
  }
  for (let i = 0; i < data.close.length; i++) {
    if (i < period) { result.push(50); continue }
    let posFlow = 0; let negFlow = 0
    for (let j = i - period + 1; j <= i; j++) {
      if (j === i - period + 1) continue
      if (typicalPrice[j] > typicalPrice[j - 1]) posFlow += rawMoney[j]
      else negFlow += rawMoney[j]
    }
    const mfr = negFlow === 0 ? 100 : posFlow / negFlow
    result.push(100 - 100 / (1 + mfr))
  }
  return result
}

export function calcCCI(data: IndicatorInput, period = 20): number[] {
  const tp: number[] = []
  for (let i = 0; i < data.high.length; i++) tp.push((data.high[i] + data.low[i] + data.close[i]) / 3)
  const tpSma = sma(tp, period)
  const result: number[] = []
  for (let i = 0; i < tp.length; i++) {
    if (i < period - 1) { result.push(0); continue }
    const md = avg(data.high.slice(i - period + 1, i + 1).map((_, j) => Math.abs(tp[i - period + 1 + j] - tpSma[i])))
    result.push(md === 0 ? 0 : (tp[i] - tpSma[i]) / (0.015 * md))
  }
  return result
}

export function calcWilliamsR(data: IndicatorInput, period = 14): number[] {
  const result: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period - 1) { result.push(-50); continue }
    const hh = Math.max(...data.high.slice(i - period + 1, i + 1))
    const ll = Math.min(...data.low.slice(i - period + 1, i + 1))
    result.push(hh === ll ? -50 : ((hh - data.close[i]) / (hh - ll)) * -100)
  }
  return result
}

export function calcSupertrend(data: IndicatorInput, period = 10, multiplier = 3): { trend: number[]; direction: number[] } {
  const atr_ = calcATR(data, period)
  const hlAvg: number[] = []
  for (let i = 0; i < data.high.length; i++) hlAvg.push((data.high[i] + data.low[i]) / 2)
  const upper: number[] = []; const lower: number[] = []; const trend: number[] = []; const direction: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period - 1) { upper.push(0); lower.push(0); trend.push(0); direction.push(1); continue }
    const u = hlAvg[i] + multiplier * atr_[i]
    const l = hlAvg[i] - multiplier * atr_[i]
    upper.push(i === period - 1 ? u : (data.close[i - 1] <= upper[i - 1] ? Math.min(u, upper[i - 1]) : u))
    lower.push(i === period - 1 ? l : (data.close[i - 1] >= lower[i - 1] ? Math.max(l, lower[i - 1]) : l))
    const dir = i === period - 1 ? 1 : (data.close[i] > upper[i] ? 1 : (data.close[i] < lower[i] ? -1 : direction[i - 1]))
    direction.push(dir)
    trend.push(dir === 1 ? lower[i] : upper[i])
  }
  return { trend, direction }
}

export function calcPSAR(data: IndicatorInput, step = 0.02, maxStep = 0.2): number[] {
  const result: number[] = [data.low[0]]
  let af = step; let isLong = data.close[0] <= data.close[1] ? false : true
  let ep = isLong ? data.high[0] : data.low[0]
  let sar = isLong ? data.low[0] : data.high[0]
  for (let i = 1; i < data.close.length; i++) {
    const prevSar = sar
    if (isLong) {
      sar = prevSar + af * (ep - prevSar)
      if (sar > data.low[i]) sar = data.low[i]
      if (data.high[i] > ep) { ep = data.high[i]; af = Math.min(af + step, maxStep) }
      if (sar > data.low[i]) { isLong = false; sar = ep; af = step; ep = data.low[i] }
    } else {
      sar = prevSar + af * (ep - prevSar)
      if (sar < data.high[i]) sar = data.high[i]
      if (data.low[i] < ep) { ep = data.low[i]; af = Math.min(af + step, maxStep) }
      if (sar < data.high[i]) { isLong = true; sar = ep; af = step; ep = data.high[i] }
    }
    result.push(sar)
  }
  return result
}

export function calcVWAP(data: IndicatorInput): number[] {
  const result: number[] = []
  let cumPV = 0; let cumVol = 0
  for (let i = 0; i < data.close.length; i++) {
    const tp = (data.high[i] + data.low[i] + data.close[i]) / 3
    cumPV += tp * data.volume[i]
    cumVol += data.volume[i]
    result.push(cumVol === 0 ? data.close[i] : cumPV / cumVol)
  }
  return result
}

export function calcROC(data: IndicatorInput, period = 12): number[] {
  const result: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period) { result.push(0); continue }
    result.push(data.close[i - period] === 0 ? 0 : ((data.close[i] - data.close[i - period]) / data.close[i - period]) * 100)
  }
  return result
}

export function calcAwesome(data: IndicatorInput, fastPeriod = 5, slowPeriod = 34): number[] {
  const medians: number[] = []
  for (let i = 0; i < data.high.length; i++) medians.push((data.high[i] + data.low[i]) / 2)
  const fast = sma(medians, fastPeriod)
  const slow = sma(medians, slowPeriod)
  const result: number[] = []
  for (let i = 0; i < medians.length; i++) {
    if (fast[i] === 0 || slow[i] === 0) { result.push(0); continue }
    result.push(fast[i] - slow[i])
  }
  return result
}

export function calcBullsPower(data: IndicatorInput, period = 13): number[] {
  const ema_ = ema(data.close, period)
  const result: number[] = []
  for (let i = 0; i < data.close.length; i++) result.push(ema_[i] === 0 ? 0 : data.high[i] - ema_[i])
  return result
}

export function calcBearsPower(data: IndicatorInput, period = 13): number[] {
  const ema_ = ema(data.close, period)
  const result: number[] = []
  for (let i = 0; i < data.close.length; i++) result.push(ema_[i] === 0 ? 0 : data.low[i] - ema_[i])
  return result
}

export function calcCMF(data: IndicatorInput, period = 20): number[] {
  const result: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period - 1) { result.push(0); continue }
    const slice = data.close.slice(i - period + 1, i + 1)
    let sumMFV = 0; let sumVol = 0
    for (let j = 0; j < period; j++) {
      const idx = i - period + 1 + j
      const tp = (data.high[idx] + data.low[idx] + data.close[idx]) / 3
      const mf = idx > 0 && data.close[idx] > data.close[idx - 1] ? 1 : (idx > 0 && data.close[idx] < data.close[idx - 1] ? -1 : 0)
      sumMFV += mf * data.volume[idx] * tp
      sumVol += data.volume[idx]
    }
    result.push(sumVol === 0 ? 0 : sumMFV / sumVol)
  }
  return result
}

export function calcAroon(data: IndicatorInput, period = 25) {
  const aroonUp: number[] = []; const aroonDown: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    if (i < period) { aroonUp.push(50); aroonDown.push(50); continue }
    const slice = data.high.slice(i - period, i + 1)
    const highIdx = slice.indexOf(Math.max(...slice))
    const lowIdx = slice.indexOf(Math.min(...data.low.slice(i - period, i + 1)))
    aroonUp.push(((period - highIdx) / period) * 100)
    aroonDown.push(((period - lowIdx) / period) * 100)
  }
  return { aroonUp, aroonDown }
}

export function calcIchimoku(data: IndicatorInput, conversionPeriod = 9, basePeriod = 26, spanPeriod = 52) {
  const conversion: number[] = []; const base: number[] = []; const spanA: number[] = []; const spanB: number[] = []; const lag: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    const hh9 = Math.max(...data.high.slice(Math.max(0, i - conversionPeriod + 1), i + 1))
    const ll9 = Math.min(...data.low.slice(Math.max(0, i - conversionPeriod + 1), i + 1))
    conversion.push((hh9 + ll9) / 2)
    const hh26 = Math.max(...data.high.slice(Math.max(0, i - basePeriod + 1), i + 1))
    const ll26 = Math.min(...data.low.slice(Math.max(0, i - basePeriod + 1), i + 1))
    base.push((hh26 + ll26) / 2)
    spanA.push(i < basePeriod - 1 ? 0 : (conversion[i] + base[i]) / 2)
    const hh52 = Math.max(...data.high.slice(Math.max(0, i - spanPeriod + 1), i + 1))
    const ll52 = Math.min(...data.low.slice(Math.max(0, i - spanPeriod + 1), i + 1))
    spanB.push((hh52 + ll52) / 2)
    lag.push(i < basePeriod ? 0 : data.close[i - basePeriod + 1])
  }
  return { conversion, base, spanA, spanB, lag }
}

export function calcTRIX(data: IndicatorInput, period = 18): number[] {
  const e1 = ema(data.close, period)
  const e2 = ema(e1, period)
  const e3 = ema(e2, period)
  const result: number[] = []
  for (let i = 0; i < e3.length; i++) {
    if (i < 1 || e3[i - 1] === 0) { result.push(0); continue }
    result.push(((e3[i] - e3[i - 1]) / e3[i - 1]) * 100)
  }
  return result
}

export function calcKeltner(data: IndicatorInput, period = 20, multiplier = 2) {
  const middle = ema(data.close, period)
  const atr_ = calcATR(data, period)
  const upper: number[] = []; const lower: number[] = []
  for (let i = 0; i < data.close.length; i++) {
    upper.push(middle[i] + atr_[i] * multiplier)
    lower.push(middle[i] - atr_[i] * multiplier)
  }
  return { upper, middle, lower }
}

export function calcDonchian(data: IndicatorInput, period = 20) {
  const upper = highest(data.high, period)
  const lower = lowest(data.low, period)
  const middle: number[] = []
  for (let i = 0; i < data.close.length; i++) middle.push((upper[i] + lower[i]) / 2)
  return { upper, middle, lower }
}

export function computeIndicator(name: string, data: IndicatorInput, params: Record<string, number>): number[] {
  const defaults: Record<string, number> = {}
  INDICATOR_LIST.find(i => i.name === name)?.params.forEach(p => { defaults[p.key] = p.default })
  const p = { ...defaults, ...params }
  switch (name) {
    case 'sma': return calcSMA(data, p.period)
    case 'ema': return calcEMA(data, p.period)
    case 'wma': return calcWMA(data, p.period)
    case 'hma': return calcHMA(data, p.period)
    case 'rsi': return calcRSI(data, p.period)
    case 'atr': return calcATR(data, p.period)
    case 'obv': return calcOBV(data)
    case 'mfi': return calcMFI(data, p.period)
    case 'cci': return calcCCI(data, p.period)
    case 'williams_r': return calcWilliamsR(data, p.period)
    case 'vwap': return calcVWAP(data)
    case 'roc': return calcROC(data, p.period)
    case 'awesome': return calcAwesome(data, p.fastPeriod, p.slowPeriod)
    case 'bulls_power': return calcBullsPower(data, p.period)
    case 'bears_power': return calcBearsPower(data, p.period)
    case 'cmf': return calcCMF(data, p.period)
    case 'trix': return calcTRIX(data, p.period)
    case 'adx': return calcADX(data, p.period)
    case 'supertrend': return calcSupertrend(data, p.period, p.multiplier).trend
    case 'psar': return calcPSAR(data, p.step, p.maxStep)
    case 'aroon': return calcAroon(data, p.period).aroonUp
    default: return []
  }
}

export function computeMultiOutputIndicator(name: string, data: IndicatorInput, params: Record<string, number>): Record<string, number[]> {
  const defaults: Record<string, number> = {}
  INDICATOR_LIST.find(i => i.name === name)?.params.forEach(p => { defaults[p.key] = p.default })
  const p = { ...defaults, ...params }
  switch (name) {
    case 'macd': return calcMACD(data, p.fastPeriod, p.slowPeriod, p.signalPeriod)
    case 'bb': return calcBB(data, p.period, p.stdDev)
    case 'stoch': return calcStoch(data, p.kPeriod, p.dPeriod)
    case 'keltner': return calcKeltner(data, p.period, p.multiplier)
    case 'donchian': return calcDonchian(data, p.period)
    case 'ichimoku': return calcIchimoku(data, p.conversionPeriod, p.basePeriod, p.spanPeriod)
    case 'aroon': return calcAroon(data, p.period)
    case 'supertrend': return calcSupertrend(data, p.period, p.multiplier)
    default: return {}
  }
}
