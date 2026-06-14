'use client'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useT } from '@/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  const { data: session } = useSession()
  const { t } = useT()
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{t('dashboard.navbar.greeting')}</span>
        <span className="font-semibold">{session?.user?.name || t('common.trader')}</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded capitalize">
          {t('dashboard.navbar.plan', { plan: session?.user?.plan || 'free' })}
        </span>
        <Button variant="ghost" size="icon" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
