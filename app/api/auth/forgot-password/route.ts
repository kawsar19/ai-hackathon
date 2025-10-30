import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mailer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    // Always respond 200 to avoid email enumeration
    if (!user) return NextResponse.json({ message: 'If the email exists, a reset link was sent.' })

    // Invalidate existing tokens
    await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await (prisma as any).passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const resetUrl = `${baseUrl}/reset-password/${token}`
    await sendPasswordResetEmail(user.email, resetUrl)

    return NextResponse.json({ message: 'If the email exists, a reset link was sent.' })
  } catch (e) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


