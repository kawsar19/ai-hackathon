import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt: expiresAt
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
      message: 'OTP sent successfully'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

