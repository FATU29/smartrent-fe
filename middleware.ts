import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// File extensions and paths to ignore in middleware
const IGNORE_PATHS = [
  /^\/api\//,
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/.*\.(png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|txt|woff2?)$/,
]

function isIgnoredPath(pathname: string) {
  return IGNORE_PATHS.some((re) => re.test(pathname))
}

function isPublicPath(pathname: string) {
  // Exact match for root
  if (pathname === '/') return true

  // Check if starts with /properties or /sellernet
  if (pathname.startsWith('/properties')) return true
  if (pathname.startsWith('/sellernet')) return true

  return false
}

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request
  const { pathname, searchParams } = nextUrl

  // Skip middleware for static assets and API
  if (isIgnoredPath(pathname)) return NextResponse.next()

  // Allow public routes
  if (isPublicPath(pathname)) return NextResponse.next()

  // If already flagged to show auth dialog, let it pass to avoid loops
  if (searchParams.get('auth') === 'login') return NextResponse.next()

  // Check auth cookie set by the app
  const accessToken = cookies.get('access_token')?.value

  const isAuthenticated = Boolean(accessToken)

  // Debug logging
  console.log('🔒 Middleware check:', {
    pathname,
    isAuthenticated,
    hasAuthFlag: searchParams.get('auth') === 'login',
    cookies: cookies.getAll().map((c) => c.name),
  })

  if (!isAuthenticated) {
    // Redirect to the SAME URL but with a flag that the client will use to open the login dialog
    const url = nextUrl.clone()
    url.searchParams.set('auth', 'login')
    console.log('🚫 Redirecting to:', url.toString())
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Run middleware on all routes by default
export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
