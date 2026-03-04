import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/login'
  const isDashboardPage =
    request.nextUrl.pathname.startsWith('/(dashboard)') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/projects') ||
    request.nextUrl.pathname.startsWith('/komodo') ||
    request.nextUrl.pathname.startsWith('/api')

  // Redirect logged-in users away from login page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  // Redirect unauthenticated users to login
  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
