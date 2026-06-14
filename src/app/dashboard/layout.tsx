'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useT } from '@/i18n/LocaleProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { t } = useT()
  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>
  if (!session) redirect('/api/auth/signin')

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
