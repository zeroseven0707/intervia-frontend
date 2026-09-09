'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'

const ADMIN_PREFIX = '/admin'
const APP_ROUTES = ['/dashboard', '/sessions', '/interview', '/learning', '/profile']

function defaultHomeForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/dashboard'
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()

  // ── 1. Unauthorized global listener (dari axios 401) ─────────
  useEffect(() => {
    function onUnauthorized() {
      const isAuthPage = pathname === '/login' || pathname === '/register'
      if (!isAuthPage) router.replace('/login')
    }
    window.addEventListener('intervia:unauthorized', onUnauthorized)
    return () => window.removeEventListener('intervia:unauthorized', onUnauthorized)
  }, [router, pathname])

  // ── 2. Client-side Auth Guard (soft redirect, LOOP-SAFE!) ────
  //    HANYA redirect jika:
  //    - TIDAK SESUAI rule BERDASARKAN PATH saat ini
  //    - Role & auth SUDAH PASTI (tidak undefined / rehydrating)
  useEffect(() => {
    // Skip sementara kalo masih SSR hydrate store (token kosong + user null + isAuthenticated false)
    // Kita kasih 30ms debounce & hanya jalan ketika semua variabel terdefinisi.
    const isLogin     = pathname === '/login' || pathname === '/register'
    const isLanding   = pathname === '/'
    const isAdminZone = pathname.startsWith(ADMIN_PREFIX)
    const isAppZone   = APP_ROUTES.some(r => pathname.startsWith(r))

    // Case A: Sudah login → buka /login atau /register → pindah ke role home
    if (isAuthenticated && isLogin) {
      const target = defaultHomeForRole(user?.role ?? 'user')
      router.replace(target)
      return
    }

    // Case B: Belum login + access non-public area → ke login (bawa redirect)
    if (!isAuthenticated && (isAdminZone || isAppZone)) {
      const loginUrl = new URL('/login', window.location.origin)
      loginUrl.searchParams.set('redirect', pathname)
      router.replace(loginUrl.toString())
      return
    }

    // Case C: Sudah login + BUKAN admin + coba akses /admin/* → pindah ke /dashboard
    if (isAuthenticated && user?.role && user.role !== 'admin' && isAdminZone) {
      router.replace('/dashboard')
      return
    }

    // Case D: Sudah login + ADMIN + coba akses dashboard / user routes → pindah ke /admin
    if (isAuthenticated && user?.role === 'admin' && isAppZone) {
      router.replace('/admin')
      return
    }

    // Case E: Sudah login + buka landing '/' → redirect ke home role
    if (isAuthenticated && user?.role && isLanding) {
      router.replace(defaultHomeForRole(user.role))
      return
    }
  }, [isAuthenticated, user?.role, pathname, router])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
