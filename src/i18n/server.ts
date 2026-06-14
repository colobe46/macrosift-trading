import { cookies, headers } from 'next/headers'
import type { Locale } from './config'
import { locales, defaultLocale } from './config'
import { t as translate } from './messages'

export function getServerLocale(): Locale {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value as Locale
  if (locales.includes(cookieLocale)) return cookieLocale

  const acceptLang = headers().get('accept-language') || ''
  const browserLang = acceptLang.split(',')[0]?.split('-')[0] as Locale
  if (locales.includes(browserLang)) return browserLang

  return defaultLocale
}

export function tServer(key: string, params?: Record<string, string | number>): string {
  return translate(getServerLocale(), key, params)
}
