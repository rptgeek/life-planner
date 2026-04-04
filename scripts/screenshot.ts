import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'

const BASE_URL = 'https://life-planner-five-pi.vercel.app'
const BOT_SECRET = 'screenshot-bot-2024-lp'
const OUT_DIR = path.join(process.cwd(), 'public', 'screenshots')

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  // Hit the bot-login route — sets session cookies server-side and redirects to /dashboard
  console.log('Logging in via bot-login route...')
  await page.goto(`${BASE_URL}/api/bot-login?secret=${BOT_SECRET}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  console.log('URL after login:', page.url())
  if (!page.url().includes('/dashboard')) {
    throw new Error(`Login failed — at: ${page.url()}`)
  }

  // Dismiss onboarding
  await page.evaluate(() => localStorage.setItem('onboarding_complete', '1'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  console.log('Logged in! Capturing screenshots...\n')

  // 1. Dashboard
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard.png') })
  console.log('✓ dashboard.png')

  // 2. Plan My Day wizard
  const planBtn = page.locator('button:has-text("Plan My Day")')
  if (await planBtn.isVisible()) {
    await planBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(OUT_DIR, 'plan-my-day.png') })
    console.log('✓ plan-my-day.png')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
  }

  // 3. Mission & Values
  await page.goto(`${BASE_URL}/mission`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(OUT_DIR, 'mission.png') })
  console.log('✓ mission.png')

  // 4. Goals
  await page.goto(`${BASE_URL}/goals`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(OUT_DIR, 'goals.png') })
  console.log('✓ goals.png')

  await browser.close()
  console.log(`\nDone! All screenshots saved to public/screenshots/`)
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
