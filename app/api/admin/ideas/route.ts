import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get all ideas with user information (handle potential orphaned ideas defensively)
    let ideas: any[] = []
    try {
      ideas = await prisma.idea.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              employeeId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (e) {
      // Fallback: fetch ideas without join and enrich manually; skip ideas whose user is missing
      const rawIdeas = await prisma.idea.findMany({
        orderBy: { createdAt: 'desc' }
      })
      const result: any[] = []
      for (const idea of rawIdeas) {
        const user = await prisma.user.findUnique({
          where: { id: idea.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            employeeId: true,
          }
        })
        if (!user) {
          // skip orphan records to avoid downstream crashes
          continue
        }
        result.push({ ...idea, user })
      }
      ideas = result
    }

    return NextResponse.json({ ideas })

  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
