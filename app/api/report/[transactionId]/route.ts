import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../lib/prisma'
import { generateReportPdf, type ReportResultType } from '../../../../lib/pdf-report'

/**
 * GET /api/report/[transactionId]
 * Auth: required (NextAuth JWT session).
 *
 * Verifies the transaction is SUCCESSFUL and belongs to the authenticated user,
 * generates a PDF report in RAM, and returns it as a direct download.
 * The report contains the paternity result and all legal disclaimers.
 * Biological data is not persisted — only the resultType stored at payment-intent
 * creation is used here.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { transactionId: string } },
) {
  // 1. Auth check
  const authToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!authToken?.sub) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { transactionId } = params
  if (!transactionId) {
    return NextResponse.json({ error: 'MISSING_TRANSACTION_ID' }, { status: 400 })
  }

  // 2. Verify the transaction: must belong to the authenticated user AND be SUCCESSFUL
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: authToken.sub,
      status: 'SUCCESSFUL',
    },
    select: { resultType: true, createdAt: true },
  })

  if (!transaction) {
    return NextResponse.json({ error: 'TRANSACTION_NOT_FOUND_OR_UNPAID' }, { status: 404 })
  }

  if (!transaction.resultType) {
    // Data integrity issue — transaction is paid but has no result type stored
    return NextResponse.json({ error: 'RESULT_UNAVAILABLE' }, { status: 500 })
  }

  const validResultTypes: ReportResultType[] = ['EXCLUSION', 'INCAPACITY_TO_EXCLUDE']
  if (!validResultTypes.includes(transaction.resultType as ReportResultType)) {
    return NextResponse.json({ error: 'INVALID_RESULT_TYPE' }, { status: 500 })
  }

  // 3. Generate PDF entirely in RAM — no file system writes
  const pdfBuffer = await generateReportPdf(
    transaction.resultType as ReportResultType,
    transactionId,
    new Date(),
  )

  // 4. Stream the PDF to the client as a direct download
  const filename = `biopaternal-rapport-${transactionId.slice(0, 8)}.pdf`

  return new Response(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
