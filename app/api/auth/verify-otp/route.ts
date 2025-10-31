import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email already verified',
        verified: true
      })
    }

    // Bypass code for testing
    const isBypassCode = otp === '0000'

    // Verify OTP
    if (!isBypassCode) {
      if (!user.otp || user.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        )
      }

      if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        return NextResponse.json(
          { error: 'OTP has expired' },
          { status: 400 }
        )
      }
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otp: null,
        otpExpiresAt: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        employeeId: true,
        emailVerified: true
      }
    })

    // Generate token
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    })

    return NextResponse.json({
      user: updatedUser,
      token,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

