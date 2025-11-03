import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bot detection function
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  const botPatterns = [
    'whatsapp',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'slackbot',
    'telegrambot',
    'googlebot',
    'bingbot',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'applebot',
    'facebot',
  ]
  return botPatterns.some(bot => userAgent.toLowerCase().includes(bot))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent')

  // Skip middleware for bots (WhatsApp, Facebook, etc.)
  if (isBot(userAgent)) {
    return NextResponse.next()
  }

  // Extract token from cookies or Authorization header
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // Public routes (no auth needed)
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith('/reset-password/')

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token, redirect to login with redirect param
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role
    const currentTime = Math.floor(Date.now() / 1000)

    // Check token expiration
    if (payload.exp && payload.exp < currentTime) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based route protection
    const isAdminRoute = pathname.startsWith('/admin')
    const isUserRoute = pathname.startsWith('/dashboard')

    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isUserRoute && userRole !== 'USER') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // All checks passed → allow access
    return NextResponse.next()
  } catch (error) {
    // Invalid token → redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

// Only run middleware on protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    // Add other protected routes if needed, e.g.:
    // '/submit-idea',
    // '/profile',
  ],
}