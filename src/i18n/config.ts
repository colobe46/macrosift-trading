export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  const cookie = document.cookie.split('; ').find(r => r.startsWith('NEXT_LOCALE='))
  if (cookie) {
    const val = cookie.split('=')[1] as Locale
    if (locales.includes(val)) return val
  }
  const browserLang = navigator.language.split('-')[0] as Locale
  if (locales.includes(browserLang)) return browserLang
  return defaultLocale
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`
}
