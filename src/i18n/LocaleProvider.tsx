'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Locale } from './config'
import { detectLocale, setLocaleCookie, defaultLocale } from './config'
import { t as translate } from './messages'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => any
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    setLocaleCookie(l)
  }, [])

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>): any => translate(locale, key, params),
    [locale]
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useT() {
  return useContext(LocaleContext)
}
