import { SignJWT, jwtVerify } from 'jose'
import type { PaternityResult } from './bloodCalc'

export type EphemeralPayload = {
  resultType: PaternityResult
  country: string
}

function getSecret(): Uint8Array {
  const s = process.env.EPHEMERAL_JWT_SECRET
  if (!s) throw new Error('EPHEMERAL_JWT_SECRET not configured')
  return new TextEncoder().encode(s)
}

/** Signs a 1-hour ephemeral token encoding the paternity result. */
export async function signEphemeralToken(payload: EphemeralPayload): Promise<string> {
  return new SignJWT({ resultType: payload.resultType, country: payload.country })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret())
}

/** Verifies and decodes an ephemeral token. Throws on invalid/expired token. */
export async function verifyEphemeralToken(token: string): Promise<EphemeralPayload> {
  const { payload } = await jwtVerify(token, getSecret())

  const { resultType, country } = payload as Record<string, unknown>

  if (resultType !== 'EXCLUSION' && resultType !== 'INCAPACITY_TO_EXCLUDE') {
    throw new Error('Invalid ephemeral token: unknown resultType')
  }
  if (typeof country !== 'string') {
    throw new Error('Invalid ephemeral token: missing country')
  }

  return { resultType, country }
}
