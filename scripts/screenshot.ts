import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

const BASE_URL = 'https://life-planner-five-pi.vercel.app'
const SUPABASE_URL = 'https://hcitxtrlqmsqtpnwwpss.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXR4dHJscW1zcXRwbnd3cHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjkwNTksImV4cCI6MjA5MDgwNTA1OX0.04VxXdMu7Wkj85nHWbTK7N9muoohBt_gI9fF_S_ezfc'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXR4dHJscW1zcXRwbnd3cHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIyOTA1OSwiZXhwIjoyMDkwODA1MDU5fQ.kbpcTciZHiI3xzP7b5XRjOBvfOuBUJK8B5m9jReKXjc'
const BOT_EMAIL = 'life.planner.bot@gmail.com'
const OUT_DIR = path.join(process.cwd(), 'public', 'screenshots')

async function getTokens() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: BOT_EMAIL,
  })
  if (error) throw new Error(`generateLink: ${error.message}`)

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  const { data: otpData, error: otpError } = await anon.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: 'email',
  })
  if (otpError) throw new Error(`verifyOtp: ${otpError.message}`)
  if (!otpData.session) throw new Error('No session from verifyOtp')
  return otpData.session
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log('Getting session tokens from Supabase...')
  const session = await getTokens()
  console.log('Got session for:', session.user.email)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  // Go to login page first to get the app loaded, then inject session via Supabase JS
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })

  // Use the app's own Supabase client (loaded by the page) to set the session
  const result = await page.evaluate(async ({ url, anonKey, accessToken, refreshToken }) => {
    try {
      // Use createBrowserClient so session is stored in cookies (same as the app)
      // @ts-ignore
      const { createBrowserClient } = await import('https://esm.sh/@supabase/ssr@0.6.1')
      const client = createBrowserClient(url, anonKey)
      const { data, error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      return { ok: !error, error: error?.message, user: data?.user?.email }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  }, {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  })

  console.log('setSession result:', result)

  // Give cookies a moment to propagate
  await page.waitForTimeout(2000)

  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  console.log('URL:', page.url())

  if (!page.url().includes('/dashboard')) {
    // Check what cookies were set
    const cookies = await context.cookies()
    console.log('Cookies set:', cookies.map(c => c.name))
    throw new Error(`Not logged in — at: ${page.url()}`)
  }

  await page.evaluate(() => localStorage.setItem('onboarding_complete', '1'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  console.log('\nCapturing screenshots...')

  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard.png') })
  console.log('✓ dashboard.png')

  const planBtn = page.locator('button:has-text("Plan My Day")')
  if (await planBtn.isVisible()) {
    await planBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(OUT_DIR, 'plan-my-day.png') })
    console.log('✓ plan-my-day.png')
    await page.keyboard.press('Escape')
  }

  await page.goto(`${BASE_URL}/mission`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(OUT_DIR, 'mission.png') })
  console.log('✓ mission.png')

  await page.goto(`${BASE_URL}/goals`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(OUT_DIR, 'goals.png') })
  console.log('✓ goals.png')

  await browser.close()
  console.log('\nDone! Screenshots saved to public/screenshots/')
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
