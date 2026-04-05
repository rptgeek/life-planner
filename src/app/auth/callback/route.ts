import { type NextRequest, NextResponse } from 'next/server'

// Legacy redirect: old OAuth flows that still point to /auth/callback
export function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const origin = request.nextUrl.origin
  if (code) {
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`)
  }
  return NextResponse.redirect(`${origin}/login`)
}
