import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    // Verify admin token
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { ideaId } = await params
    const { status, feedback, score } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Update the idea
    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status,
        feedback: feedback || null,
        score: score || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Idea status updated successfully',
      idea: updatedIdea 
    })

  } catch (error) {
    console.error('Error updating idea status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
