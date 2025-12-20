import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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
  if (pathname === '/') return true

  if (pathname.startsWith('/properties')) return true
  if (pathname.startsWith('/sellernet')) return true
  if (pathname.startsWith('/listing-detail')) return true
  if (pathname.startsWith('/compare')) return true
  if (pathname.startsWith('/news')) return true
}

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request
  const { pathname, searchParams } = nextUrl

  if (isIgnoredPath(pathname)) return NextResponse.next()

  if (isPublicPath(pathname)) return NextResponse.next()

  if (searchParams.get('auth') === 'login') return NextResponse.next()

  const accessToken = cookies.get('access_token')?.value

  const isAuthenticated = Boolean(accessToken)

  if (!isAuthenticated) {
    const url = nextUrl.clone()
    url.searchParams.set('auth', 'login')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
