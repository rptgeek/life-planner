import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BOT_SECRET = 'screenshot-bot-2024-lp'
const BOT_EMAIL = 'life.planner.bot@gmail.com'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  if (searchParams.get('secret') !== BOT_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Admin client generates a magic link token
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: BOT_EMAIL,
    })
    if (linkError) throw new Error(`generateLink: ${linkError.message}`)

    const tokenHash = linkData.properties.hashed_token

    // Build the redirect response first so we can set cookies on it
    const response = NextResponse.redirect(`${origin}/dashboard`)

    // Server client that sets cookies on the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })
    if (otpError) throw new Error(`verifyOtp: ${otpError.message}`)

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new NextResponse(`Bot login failed: ${message}`, { status: 500 })
  }
}
