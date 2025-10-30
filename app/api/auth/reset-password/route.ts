import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const record = await (prisma as any).passwordResetToken.findUnique({ where: { token } })
    if (!record || record.used || new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      (prisma as any).passwordResetToken.update({ where: { token }, data: { used: true } }),
    ])

    return NextResponse.json({ message: 'Password has been reset successfully' })
  } catch (e) {
    console.error('Reset password error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


