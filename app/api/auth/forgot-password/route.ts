import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Password reset via email is disabled' }, { status: 501 })
}


