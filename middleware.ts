import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // /api/admin/* — 403 si pas ADMIN
  if (pathname.startsWith('/api/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    return NextResponse.next()
  }

  // /admin/* — redirect vers / si pas ADMIN
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // /app/* — redirect vers /login si non connecté
  if (pathname.startsWith('/app')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/app/:path*'],
}
