import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAINTENANCE_EXEMPT = ['/maintenance', '/_next', '/favicon', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (MAINTENANCE_EXEMPT.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  try {
    const internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:5000'
    const res = await fetch(`${internalApiUrl}/api/public/maintenance`, { cache: 'no-store' })
    const data = await res.json()

    if (data.trulanceMaintenance) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.rewrite(url)
    }
  } catch {
    // If API is down, don't block users
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
