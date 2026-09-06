'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/dashboard',      label: 'Dashboard' },
  { href: '/interview/setup', label: 'New Interview' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const logout   = useLogout()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-base font-semibold text-indigo-600 tracking-tight">
              Intervia
            </Link>
            <nav className="flex gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith(n.href)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={() => logout.mutate()}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
