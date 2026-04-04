import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const BOT_SECRET = 'screenshot-bot-2024-lp'
const BOT_EMAIL = 'life.planner.bot@gmail.com'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)

    if (searchParams.get('secret') !== BOT_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return new NextResponse(`Missing env vars: url=${!!supabaseUrl} service=${!!serviceKey} anon=${!!anonKey}`, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: BOT_EMAIL,
    })
    if (linkError) return new NextResponse(`generateLink failed: ${linkError.message}`, { status: 500 })

    const tokenHash = linkData.properties.hashed_token

    const response = NextResponse.redirect(`${origin}/dashboard`)

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() { return [] },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    })
    if (otpError) return new NextResponse(`verifyOtp failed: ${otpError.message}`, { status: 500 })

    return response
  } catch (err) {
    return new NextResponse(`Error: ${err instanceof Error ? err.message : String(err)}`, { status: 500 })
  }
}
