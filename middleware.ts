import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/']
const AUTH_ROUTES   = ['/login', '/register']
const ADMIN_ROUTES  = ['/admin']
const APP_ROUTES    = ['/dashboard', '/sessions', '/interview', '/learning', '/profile']

function roleKnown(role: string | undefined): role is string {
  return typeof role === 'string' && role.length > 0
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('intervia_token')?.value
  const role  = request.cookies.get('intervia_role')?.value

  const isRoot   = pathname === '/'
  const isAuth   = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isAdmin  = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isApp    = APP_ROUTES.some((r) => pathname.startsWith(r))
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r)

  // ── 1. ROOT LANDING PAGE: redirect logged-in users to role home ──────
  if (isRoot && token && roleKnown(role)) {
    const target = role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }
  if (isRoot) return NextResponse.next()

  // ── 2. Logged-in users accessing login/register → go to role home ────
  //    (HANYA jika role SUDAH DIKETAHUI, untuk hindari loop)
  if (token && roleKnown(role) && isAuth) {
    const target = role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // ── 3. Non-logged users: all non-public → send to login ──────────────
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 4. USER (non-admin) trying to access /admin/* → block to /dashboard
  //    (hanya enforce JIKA role SUDAH PASTI bukan admin)
  if (isAdmin && token && roleKnown(role) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── 5. ADMIN trying to access user routes → force back to /admin ─────
  //    (hanya enforce JIKA role SUDAH PASTI admin)
  if (isApp && token && roleKnown(role) && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
