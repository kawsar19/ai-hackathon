import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

export async function authenticateUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true }
  })

  if (!user || !user.isActive) {
    return null
  }

  return payload
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await authenticateUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user
    
    return handler(authenticatedReq)
  }
}

export function requireRole(role: UserRole) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      const user = await authenticateUser(req)
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (user.role !== role) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user
      
      return handler(authenticatedReq)
    }
  }
}

export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole(UserRole.ADMIN)(handler)
}

export function requireUser(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole(UserRole.USER)(handler)
}
