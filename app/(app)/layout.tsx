'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/dashboard',       label: 'Dashboard' },
  { href: '/interview/setup', label: 'New Interview' },
  { href: '/sessions',        label: 'History' },
  { href: '/learning',        label: 'Learning' },
]

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-black select-none">
      {initials}
    </div>
  )
}

function ProfileDropdown({ user, onClose }: { user: any; onClose: () => void }) {
  const logout  = useLogout()
  const ref     = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        {user.experience_level && (
          <span className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
            {user.experience_level}
          </span>
        )}
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">⚙</span>
          Settings
        </Link>
        <Link
          href="/sessions"
          onClick={onClose}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">◷</span>
          Interview History
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-50 py-1">
        <button
          onClick={() => { logout.mutate(); onClose() }}
          disabled={logout.isPending}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <span className="text-base">↩</span>
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user }      = useAuthStore()
  const pathname      = usePathname()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Profile button + dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className={cn(
                    'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all',
                    profileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  <Avatar name={user.name} />
                  <span className="hidden sm:block text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg
                    className={cn('w-3 h-3 text-gray-400 transition-transform', profileOpen && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-lg leading-none"
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
                  pathname === n.href ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                ⚙ Settings
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
