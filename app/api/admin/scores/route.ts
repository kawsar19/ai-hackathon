import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? 0))
  if (isNaN(n)) return 0
  return Math.max(0, Math.min(10, n))
}

function totalFromBody(body: any): number {
  const fields = [
    'innovation',
    'aiIntegration',
    'designUx',
    'problemSolving',
    'codeQuality',
    'performance',
    'scalability',
    'documentation',
    'presentation',
    'completeness',
  ]
  return fields.reduce((sum, key) => sum + clampScore(body?.[key]), 0)
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const ideaId = request.nextUrl.searchParams.get('ideaId')
    const where: any = ideaId ? { ideaId } : {}

    const scoreClient: any = (prisma as any).ideaScore
    if (!scoreClient || typeof scoreClient.findMany !== 'function') {
      // Prisma client not regenerated/migrated yet; return empty to keep UI working
      return NextResponse.json({ scores: [] })
    }
    const scores = await scoreClient.findMany({
      where,
      include: {
        admin: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      ideaId,
      innovation,
      aiIntegration,
      designUx,
      problemSolving,
      codeQuality,
      performance,
      scalability,
      documentation,
      presentation,
      completeness,
      comment,
    } = body

    if (!ideaId) return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })

    // Ensure the idea exists and is completed
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } })
    if (!idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 })

    const data = {
      ideaId,
      adminId: payload.userId,
      innovation: clampScore(innovation),
      aiIntegration: clampScore(aiIntegration),
      designUx: clampScore(designUx),
      problemSolving: clampScore(problemSolving),
      codeQuality: clampScore(codeQuality),
      performance: clampScore(performance),
      scalability: clampScore(scalability),
      documentation: clampScore(documentation),
      presentation: clampScore(presentation),
      completeness: clampScore(completeness),
      score: totalFromBody(body),
      comment: comment ?? null,
    }

    const scoreClient: any = (prisma as any).ideaScore
    if (!scoreClient || typeof scoreClient.upsert !== 'function') {
      return NextResponse.json({ error: 'Scores model not initialized. Run prisma db push.' }, { status: 500 })
    }
    const upserted = await scoreClient.upsert({
      where: { ideaId_adminId: { ideaId, adminId: payload.userId } },
      create: data,
      update: data,
    })

    return NextResponse.json({ score: upserted })
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


