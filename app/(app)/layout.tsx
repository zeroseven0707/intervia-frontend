'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',        label: 'Dashboard' },
  { href: '/interview/setup',  label: 'New Interview' },
  { href: '/sessions',         label: 'History' },
  { href: '/learning',         label: 'Learning' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const logout   = useLogout()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0">
            <span className="font-black text-base text-gray-900 tracking-tight">Intervia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  pathname === n.href || pathname.startsWith(n.href + '/')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400">{user?.name}</span>
            <button
              onClick={() => logout.mutate()}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign out
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  pathname === n.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
