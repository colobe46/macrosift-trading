'use client'
import { useT } from '@/i18n/LocaleProvider'

const flags: Record<string, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
}

const labels: Record<string, string> = {
  en: 'English',
  es: 'Español',
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useT()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as 'en' | 'es')}
      className="bg-transparent border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      aria-label="Language"
    >
      {(['en', 'es'] as const).map((l) => (
        <option key={l} value={l} className="bg-background text-foreground">
          {flags[l]} {labels[l]}
        </option>
      ))}
    </select>
  )
}
