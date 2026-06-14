import type { Locale } from './config'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

type Messages = { [key: string]: any }

const messages: Record<Locale, Messages> = { en, es }

function getNested(obj: Messages, path: string[]): any {
  let current: any = obj
  for (const key of path) {
    if (current == null || typeof current === 'string') return undefined
    current = current[key]
  }
  return current
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): any {
  const path = key.split('.')
  let value = getNested(messages[locale], path)
  if (value == null) value = getNested(messages.en, path)
  if (value == null) return key
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }
  return value
}
