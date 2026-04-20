import { NextRequest, NextResponse } from 'next/server'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

const RISC_EVENT = {
  SESSIONS_REVOKED: 'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked',
  ACCOUNT_DISABLED:  'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
  ACCOUNT_PURGED:    'https://schemas.openid.net/secevent/risc/event-type/account-purged',
  TOKENS_REVOKED:    'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked',
  CREDENTIAL_COMPROMISE: 'https://schemas.openid.net/secevent/risc/event-type/credential-compromise',
}

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  if (!body) return NextResponse.json({ error: 'Empty body' }, { status: 400 })

  // Verify the Security Event Token (SET) signed by Google
  let payload: Record<string, unknown>
  try {
    const { payload: p } = await jwtVerify(body, GOOGLE_JWKS, {
      issuer: 'https://accounts.google.com',
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    })
    payload = p as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const events = payload.events as Record<string, { subject?: { sub?: string } }> | undefined
  if (!events) return NextResponse.json({ error: 'No events' }, { status: 400 })

  // Extract Google user sub from whichever event fired
  let googleSub: string | undefined
  let shouldDelete = false

  for (const [eventType, eventData] of Object.entries(events)) {
    googleSub = eventData?.subject?.sub
    if (eventType === RISC_EVENT.ACCOUNT_PURGED) shouldDelete = true
  }

  if (!googleSub) return new NextResponse(null, { status: 202 })

  // Look up the Supabase user by their Google identity
  const supabase = adminSupabase()
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u =>
    u.identities?.some(id => id.provider === 'google' && id.id === googleSub)
  )

  if (!user) return new NextResponse(null, { status: 202 })

  if (shouldDelete) {
    await supabase.auth.admin.deleteUser(user.id)
  } else {
    // Sign out all sessions for this user
    await supabase.auth.admin.signOut(user.id, 'global')
  }

  return new NextResponse(null, { status: 202 })
}
