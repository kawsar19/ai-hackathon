import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const templates = await (prisma as any).mailTemplate.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ templates })
  } catch (e) {
    console.error('List templates error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, subject, bodyHtml } = await request.json()
    if (!name || !subject || !bodyHtml) return NextResponse.json({ error: 'name, subject, bodyHtml are required' }, { status: 400 })

    const tpl = await (prisma as any).mailTemplate.create({ data: { name, subject, bodyHtml, createdById: payload.userId } })
    return NextResponse.json({ template: tpl }, { status: 201 })
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.includes('Unique constraint') || msg.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'Template name must be unique' }, { status: 400 })
    }
    console.error('Create template error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


