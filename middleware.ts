import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  
  // User dashboard routes
  const isUserRoute = pathname.startsWith('/dashboard')

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected routes, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role
    const currentTime = Math.floor(Date.now() / 1000)

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    if (isAdminRoute && userRole !== 'ADMIN') {
      // Redirect non-admin users trying to access admin routes
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isUserRoute && userRole !== 'USER' && userRole !== 'ADMIN') {
      // Redirect users without proper role
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Allow access
    return NextResponse.next()

  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
