import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { ideaId } = await params
    const { progress } = await request.json()
    const p = Math.max(0, Math.min(100, parseInt(String(progress))))

    const existing = await prisma.idea.findFirst({ where: { id: ideaId, userId: payload.userId } })
    if (!existing) return NextResponse.json({ error: 'Idea not found or access denied' }, { status: 404 })

    const updated = await prisma.idea.update({
      where: { id: ideaId },
      data: { progress: p },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, department: true },
        },
      },
    })

    return NextResponse.json({ message: 'Progress updated', idea: updated })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


