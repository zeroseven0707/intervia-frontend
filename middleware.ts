import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES  = ['/login', '/register', '/']
const AUTH_ROUTES    = ['/login', '/register']
const ADMIN_ROUTES   = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('intervia_token')?.value

  const isRoot   = pathname === '/'
  const isAuth   = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isAdmin  = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r)

  // Root landing page — always accessible, but logged-in users get a "Go to dashboard" option (handled in page)
  if (isRoot) return NextResponse.next()

  // Logged-in users should not see login/register
  if (token && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protected routes require a token
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
