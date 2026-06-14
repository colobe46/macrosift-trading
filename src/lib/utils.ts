import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, decimals?: number): string {
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  if (price < 100) return price.toFixed(2)
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatPercent(pct: number): string {
  return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%'
}

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K'
  return vol.toFixed(0)
}

const TIME_AGO: Record<string, { now: string; m: string; h: string; d: string }> = {
  en: { now: 'just now', m: 'm ago', h: 'h ago', d: 'd ago' },
  es: { now: 'ahora', m: 'm atrás', h: 'h atrás', d: 'd atrás' },
}

export function timeAgo(timestamp: number, locale = 'en'): string {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)
  const labels = TIME_AGO[locale] || TIME_AGO.en
  if (seconds < 60) return labels.now
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${labels.m}`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${labels.h}`
  return `${Math.floor(seconds / 86400)}${labels.d}`
}
