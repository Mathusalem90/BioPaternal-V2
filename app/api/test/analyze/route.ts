import { NextResponse } from 'next/server'
import {
  assessPaternity,
  MotherChildIncompatibilityError,
  type BloodPhenotype,
} from '../../../../lib/bloodCalc'
import { signEphemeralToken } from '../../../../lib/ephemeral-token'

function isPhenotype(v: unknown): v is BloodPhenotype {
  if (!v || typeof v !== 'object') return false
  const { abo, rh, kell } = v as Record<string, unknown>
  return (
    ['A', 'B', 'AB', 'O'].includes(abo as string) &&
    ['+', '-'].includes(rh as string) &&
    ['K+', 'K-'].includes(kell as string)
  )
}

/**
 * POST /api/test/analyze
 *
 * Public endpoint (no auth). Executes the paternity algorithm in RAM.
 * Anti-cheat: never returns the detailed result — only the visual state
 * and a signed ephemeral JWT (1 h TTL) that encodes the result type.
 * The JWT is required to create a payment and unlock the full report.
 *
 * Body: { mother: BloodPhenotype, father: BloodPhenotype, child: BloodPhenotype }
 * Response: { status: 'done', visual: 'EXCLUSION' | 'COMPATIBILITY', token: string }
 */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const { mother, father, child } = body as Record<string, unknown>

  if (!isPhenotype(mother) || !isPhenotype(father) || !isPhenotype(child)) {
    return NextResponse.json(
      {
        error: 'INVALID_INPUT',
        message:
          'Each phenotype requires: abo (A|B|AB|O), rh (+|-), kell (K+|K-).',
      },
      { status: 400 },
    )
  }

  const country = (req.headers.get('x-vercel-ip-country') ?? 'XX').toUpperCase()

  let resultType: 'EXCLUSION' | 'INCAPACITY_TO_EXCLUDE'
  try {
    resultType = assessPaternity(mother, father, child)
  } catch (err) {
    if (err instanceof MotherChildIncompatibilityError) {
      return NextResponse.json(
        { error: 'MOTHER_CHILD_INCOMPATIBLE', message: err.message },
        { status: 422 },
      )
    }
    throw err
  }

  const token = await signEphemeralToken({ resultType, country })
  const visual = resultType === 'EXCLUSION' ? 'EXCLUSION' : 'COMPATIBILITY'

  // Only the visual state is returned. The resultType is sealed inside the JWT.
  return NextResponse.json({ status: 'done', visual, token })
}
