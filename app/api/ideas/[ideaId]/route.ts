import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
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

    const { ideaId } = await params

    // Check if user owns this idea
    const existingIdea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: payload.userId
      }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Idea not found or access denied' }, { status: 404 })
    }

    // Delete the idea
    await prisma.idea.delete({
      where: { id: ideaId }
    })

    return NextResponse.json({ 
      message: 'Idea deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
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

    const { ideaId } = await params
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
      attachments,
      githubUrl,
      demoUrl,
      progress,
      status
    } = body

    // For project updates (when only updating project details), we don't need all required fields
    const isProjectUpdate = githubUrl !== undefined || demoUrl !== undefined || progress !== undefined || status !== undefined
    
    if (!isProjectUpdate) {
      // Validate required fields for full idea updates
      if (!title || !description || !category || !problemStatement || !solution) {
        return NextResponse.json({ 
          error: 'Missing required fields: title, description, category, problemStatement, solution' 
        }, { status: 400 })
      }
    }

    // Check if user owns this idea
    const existingIdea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: payload.userId
      }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Idea not found or access denied' }, { status: 404 })
    }

    // Update the idea
    const updateData: any = {}
    
    if (isProjectUpdate) {
      // Only update project-specific fields
      if (githubUrl !== undefined) updateData.githubUrl = githubUrl
      if (demoUrl !== undefined) updateData.demoUrl = demoUrl
      if (progress !== undefined) updateData.progress = progress
      if (status !== undefined) updateData.status = status
    } else {
      // Update all idea fields
      updateData.title = title
      updateData.description = description
      updateData.category = category
      updateData.problemStatement = problemStatement
      updateData.solution = solution
      updateData.targetAudience = targetAudience || ''
      updateData.techStack = techStack || []
      updateData.expectedOutcome = expectedOutcome || ''
      updateData.timeline = timeline || ''
      updateData.resources = resources || ''
      updateData.attachments = attachments || existingIdea.attachments
      updateData.githubUrl = githubUrl || ''
      updateData.demoUrl = demoUrl || ''
    }

    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data: updateData,
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
      message: 'Idea updated successfully',
      idea: updatedIdea 
    })

  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
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

    const { ideaId } = await params

    // Get the idea
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
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
      }
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    return NextResponse.json({ idea })

  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
