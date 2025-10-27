import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user counts
    const [totalUsers, totalAdmins] = await Promise.all([
      prisma.user.count({
        where: { role: 'USER' }
      }),
      prisma.user.count({
        where: { role: 'ADMIN' }
      })
    ])

    // Get idea counts by status
    const [
      totalIdeas,
      pendingIdeas,
      approvedIdeas,
      inProgressIdeas,
      completedIdeas,
      rejectedIdeas
    ] = await Promise.all([
      prisma.idea.count(),
      prisma.idea.count({
        where: { status: 'PENDING' }
      }),
      prisma.idea.count({
        where: { status: 'APPROVED' }
      }),
      prisma.idea.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.idea.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.idea.count({
        where: { status: 'REJECTED' }
      })
    ])

    const stats = {
      totalUsers,
      totalAdmins,
      totalIdeas,
      pendingIdeas,
      approvedIdeas,
      inProgressIdeas,
      completedIdeas,
      rejectedIdeas,
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
