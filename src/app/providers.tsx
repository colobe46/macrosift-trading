'use client'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { ThemeProvider, useTheme } from '@/components/ui/ThemeProvider'

function ToasterWithTheme() {
  const { theme } = useTheme()
  return <Toaster position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LocaleProvider>
          {children}
          <ToasterWithTheme />
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
