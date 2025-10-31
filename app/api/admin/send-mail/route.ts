import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { mailer } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { audience, emails, templateId, subject, bodyHtml } = await request.json()

    let recipients: string[] = []
    if (audience === 'USERS' || audience === 'ADMINS') {
      const role = audience === 'USERS' ? 'USER' : 'ADMIN'
      const users = await prisma.user.findMany({ where: { role, isActive: true }, select: { email: true } })
      recipients = users.map(u => u.email)
    } else if (audience === 'CUSTOM' && Array.isArray(emails)) {
      recipients = emails.filter((e: any) => typeof e === 'string' && e.includes('@'))
    }
    recipients = Array.from(new Set(recipients))

    let finalSubject = subject as string | undefined
    let finalHtml = bodyHtml as string | undefined
    if (templateId) {
      const tpl = await (prisma as any).mailTemplate.findUnique({ where: { id: templateId } })
      if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      finalSubject = tpl.subject
      finalHtml = tpl.bodyHtml
    }
    if (!finalSubject || !finalHtml) return NextResponse.json({ error: 'subject/body required or templateId' }, { status: 400 })

    // Personalization: fetch user details for recipients
    const userRecords = await prisma.user.findMany({
      where: { email: { in: recipients } },
      select: { email: true, firstName: true, lastName: true }
    })
    const emailToUser: Record<string, { firstName?: string; lastName?: string }> = {}
    for (const u of userRecords) emailToUser[u.email] = { firstName: u.firstName, lastName: u.lastName }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const replaceVars = (html: string, email: string) => {
      const u = emailToUser[email] || {}
      return html
        .replaceAll('{{firstName}}', u.firstName || '')
        .replaceAll('{{lastName}}', u.lastName || '')
        .replaceAll('{{email}}', email)
        .replaceAll('{{appUrl}}', appUrl)
    }

    // send sequentially to avoid rate-limits (simple approach)
    for (const to of recipients) {
      const personalizedHtml = replaceVars(finalHtml!, to)
      const personalizedSubject = replaceVars(finalSubject!, to)
      await mailer.sendMail({ to, from: process.env.MAIL_FROM || process.env.GMAIL_USER, subject: personalizedSubject, html: personalizedHtml })
    }

    return NextResponse.json({ sent: recipients.length })
  } catch (e) {
    console.error('Send mail error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


