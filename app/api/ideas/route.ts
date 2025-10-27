import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify user token
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      problemStatement,
      solution,
      targetAudience,
      techStack,
      expectedOutcome,
      timeline,
      resources,
      attachments
    } = body

    // Validate required fields
    if (!title || !description || !category || !problemStatement || !solution) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, category, problemStatement, solution' 
      }, { status: 400 })
    }

    // Create the idea
    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        category,
        problemStatement,
        solution,
        targetAudience: targetAudience || '',
        techStack: techStack || [],
        expectedOutcome: expectedOutcome || '',
        timeline: timeline || '',
        resources: resources || '',
        attachments: attachments || [],
        userId: payload.userId,
        status: 'PENDING',
        progress: 0
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
      message: 'Idea submitted successfully',
      idea 
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user token
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's ideas
    const ideas = await prisma.idea.findMany({
      where: {
        userId: payload.userId
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ ideas })

  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
