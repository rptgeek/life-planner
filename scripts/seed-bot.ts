import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hcitxtrlqmsqtpnwwpss.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXR4dHJscW1zcXRwbnd3cHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIyOTA1OSwiZXhwIjoyMDkwODA1MDU5fQ.kbpcTciZHiI3xzP7b5XRjOBvfOuBUJK8B5m9jReKXjc'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaXR4dHJscW1zcXRwbnd3cHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjkwNTksImV4cCI6MjA5MDgwNTA1OX0.04VxXdMu7Wkj85nHWbTK7N9muoohBt_gI9fF_S_ezfc'
const BOT_EMAIL = 'life.planner.bot@gmail.com'

async function run() {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Get bot user session
  const { data: linkData } = await admin.auth.admin.generateLink({ type: 'magiclink', email: BOT_EMAIL })
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: otpData } = await anon.auth.verifyOtp({ token_hash: linkData!.properties.hashed_token, type: 'email' })
  const session = otpData.session!
  const userId = session.user.id
  console.log('Bot user ID:', userId)

  // Use authed client
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${session.access_token}` } }
  })

  // Profile
  await db.from('profiles').upsert({ id: userId, display_name: 'Alex', mission_statement: 'To be a present and intentional father, lead with integrity in my work, grow in faith and wisdom every day, and leave a legacy worth passing on.' })
  console.log('✓ profile')

  // Values
  await db.from('values').delete().eq('user_id', userId)
  await db.from('values').insert([
    { user_id: userId, title: 'Family First', description: 'My family is my greatest priority and joy.', sort_order: 0 },
    { user_id: userId, title: 'Integrity', description: 'Do the right thing even when no one is watching.', sort_order: 1 },
    { user_id: userId, title: 'Lifelong Learning', description: 'Always be growing and improving.', sort_order: 2 },
    { user_id: userId, title: 'Health & Vitality', description: 'Take care of my body and mind.', sort_order: 3 },
    { user_id: userId, title: 'Faith', description: 'Lead a life grounded in faith and purpose.', sort_order: 4 },
  ])
  console.log('✓ values')

  // Categories
  await db.from('categories').delete().eq('user_id', userId)
  const { data: cats } = await db.from('categories').insert([
    { user_id: userId, name: 'Family', color: '#ec4899', icon: 'folder', sort_order: 0 },
    { user_id: userId, name: 'Career & Work', color: '#3b82f6', icon: 'folder', sort_order: 1 },
    { user_id: userId, name: 'Health & Fitness', color: '#10b981', icon: 'folder', sort_order: 2 },
    { user_id: userId, name: 'Personal Growth', color: '#8b5cf6', icon: 'folder', sort_order: 3 },
    { user_id: userId, name: 'Finance', color: '#f59e0b', icon: 'folder', sort_order: 4 },
  ]).select()
  const catMap = Object.fromEntries((cats || []).map(c => [c.name, c.id]))
  console.log('✓ categories')

  // Goals
  await db.from('goals').delete().eq('user_id', userId)
  const { data: goals } = await db.from('goals').insert([
    { user_id: userId, title: 'Run a half marathon', goal_type: 'long_term', status: 'active', category_id: catMap['Health & Fitness'], description: 'Complete a half marathon by end of year.' },
    { user_id: userId, title: 'Complete leadership certification', goal_type: 'long_term', status: 'active', category_id: catMap['Career & Work'], description: 'Finish the 6-month leadership program.' },
    { user_id: userId, title: 'Train 4x per week for 90 days', goal_type: 'short_term', status: 'active', category_id: catMap['Health & Fitness'] },
    { user_id: userId, title: 'Finish Module 3 of leadership course', goal_type: 'short_term', status: 'active', category_id: catMap['Career & Work'] },
    { user_id: userId, title: 'Read 1 book per month', goal_type: 'short_term', status: 'active', category_id: catMap['Personal Growth'] },
  ]).select()
  const goalMap = Object.fromEntries((goals || []).map(g => [g.title, g.id]))
  console.log('✓ goals')

  // Tasks for today
  const today = new Date().toISOString().split('T')[0]
  await db.from('tasks').delete().eq('user_id', userId).eq('scheduled_date', today)
  await db.from('tasks').insert([
    { user_id: userId, title: 'Morning run — 5km', priority: 'A', scheduled_date: today, completed: false, category_id: catMap['Health & Fitness'], goal_id: goalMap['Train 4x per week for 90 days'], sort_order: 0 },
    { user_id: userId, title: 'Prepare slides for team presentation', priority: 'A', scheduled_date: today, completed: false, category_id: catMap['Career & Work'], sort_order: 1 },
    { user_id: userId, title: 'Read chapter 4 of leadership book', priority: 'B', scheduled_date: today, completed: false, category_id: catMap['Personal Growth'], goal_id: goalMap['Read 1 book per month'], sort_order: 0 },
    { user_id: userId, title: 'Family dinner — be home by 6pm', priority: 'B', scheduled_date: today, completed: false, category_id: catMap['Family'], sort_order: 1 },
    { user_id: userId, title: 'Review monthly budget', priority: 'C', scheduled_date: today, completed: false, category_id: catMap['Finance'], sort_order: 0 },
    { user_id: userId, title: 'Schedule dentist appointment', priority: 'C', scheduled_date: today, completed: false, sort_order: 1 },
  ])
  console.log('✓ tasks')

  console.log('\nSeed complete! Run the screenshot script now.')
}

run().catch(err => { console.error(err.message); process.exit(1) })
