import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/mailer'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, employeeId, department } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if employeeId already exists (if provided)
    const cleanEmployeeId = employeeId && employeeId.trim() !== '' ? employeeId.trim() : null
    if (cleanEmployeeId) {
      const existingEmployee = await prisma.user.findFirst({
        where: { employeeId: cleanEmployeeId }
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user with unverified status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId: cleanEmployeeId,
        department: department || null,
        role: UserRole.USER, // Default role is USER
        emailVerified: false,
        otp,
        otpExpiresAt: expiresAt
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        employeeId: true,
        emailVerified: true,
      }
    })

    // Send OTP email
    try {
      await sendOTPEmail(email, otp)
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      // Don't fail the request if email fails (for development)
    }

    return NextResponse.json({
      user,
      message: 'Registration successful. Please verify your email with the OTP sent.'
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      } else if (error.meta?.target?.includes('employeeId')) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
