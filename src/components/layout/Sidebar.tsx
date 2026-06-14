'use client'
import { LayoutDashboard, TrendingUp, Bell, Search, CreditCard, Zap, Settings, History } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/LocaleProvider'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useT()

  const links = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard.sidebar.dashboard') },
    { href: '/dashboard/screener', icon: Search, label: t('dashboard.sidebar.screener') },
    { href: '/dashboard/watchlist', icon: TrendingUp, label: t('dashboard.sidebar.watchlist') },
    { href: '/dashboard/alerts', icon: Bell, label: t('dashboard.sidebar.alerts') },
    { href: '/dashboard/history', icon: History, label: t('dashboard.sidebar.history') },
    { href: '/dashboard/settings', icon: Settings, label: t('dashboard.sidebar.settings') },
    { href: '/pricing', icon: CreditCard, label: t('dashboard.sidebar.pricing') },
  ]

  return (
    <aside className="w-56 border-r border-border bg-sidebar flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Image src="/logo.webp" alt="MacroSift" width={120} height={65} className="h-7 w-auto" />
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">{t('dashboard.sidebar.version')}</p>
      </div>
    </aside>
  )
}
