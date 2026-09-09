'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/admin',          label: 'Overview',   icon: '◎' },
  { href: '/admin/users',    label: 'Users',       icon: '◈' },
  { href: '/admin/positions',label: 'Positions',   icon: '⬡' },
  { href: '/admin/skills',   label: 'Skills',      icon: '△' },
  { href: '/admin/sources',  label: 'Sources',     icon: '↗' },
  { href: '/admin/ai',       label: 'AI Models',   icon: '✦' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const logout   = useLogout()

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
    >
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 h-14 flex items-center gap-2 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-black text-sm text-gray-900 tracking-tight">Intervia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </Link>
          <span className="ml-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const active = n.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(n.href)
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span className="text-base leading-none">{n.icon}</span>
                {n.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — user + back link */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <span className="text-base leading-none">←</span>
            Back to App
          </Link>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <span className="text-base leading-none">↩</span>
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            {NAV.find(n =>
              n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
            )?.label && (
              <h1 className="text-sm font-bold text-gray-900">
                {NAV.find(n =>
                  n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
                )?.label}
              </h1>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #ef4444, #3b82f6)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-700">{user.name.split(' ')[0]}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">Admin</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
