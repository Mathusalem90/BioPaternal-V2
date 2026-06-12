import { jwtVerify } from 'jose'

export type Session = {
  user?: {
    id: string
    role: 'USER' | 'ADMIN'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Extract and verify a JWT session token from Authorization header (Bearer)
 * or an HttpOnly cookie named `bp_session`.
 *
 * Requirements:
 * - Set `process.env.JWT_SECRET` to a strong secret (HS256).
 * - Token payload MUST include `sub` (user id) and `role` ('USER' or 'ADMIN').
 *
 * This function is safe-server-side only and never logs sensitive values.
 */
export async function getSessionFromRequest(req: any): Promise<Session | null> {
  // Get possible token from Authorization header
  let token: string | null = null

  try {
    const authHeader = req?.headers?.get ? req.headers.get('authorization') : req?.headers?.authorization
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }

    // Fallback to cookie named `bp_session`
    if (!token) {
      let cookieHeader: string | undefined
      if (req?.cookies?.get) {
        const c = req.cookies.get('bp_session')
        cookieHeader = c?.value
      } else if (req?.headers?.cookie) {
        cookieHeader = req.headers.cookie
      }
      if (cookieHeader) {
        const m = /(?:^|; )bp_session=([^;]+)/.exec(cookieHeader)
        if (m) token = decodeURIComponent(m[1])
      }
    }

    if (!token) return null

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET not configured in environment')

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))

    const sub = typeof payload.sub === 'string' ? payload.sub : null
    const role = payload.role === 'ADMIN' ? 'ADMIN' : 'USER'
    if (!sub) return null

    return { user: { id: sub, role } }
  } catch (err) {
    // On any error (invalid token, verification failed, etc.) treat as no session.
    return null
  }
}

export function requireAdmin(session: Session | null): void {
  if (!session || !session.user) throw new UnauthorizedError()
  if (session.user.role !== 'ADMIN') throw new ForbiddenError('Admin role required')
}

export default { getSessionFromRequest, requireAdmin }
