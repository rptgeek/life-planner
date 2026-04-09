import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Compass, Target, ListTodo, CalendarDays, BarChart2, Heart, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Life Planner — Plan Your Day. Achieve Your Goals. Live Your Mission.',
  description: 'A Franklin-inspired personal planner that connects your mission and values to daily action. Set goals, plan your day, and track what matters most.',
  keywords: ['life planner', 'daily planner', 'goal setting', 'mission statement', 'Franklin planner', 'productivity', 'task manager', 'personal development'],
  openGraph: {
    title: 'Life Planner — Plan with Purpose',
    description: 'Connect your mission and values to daily action. A Franklin-inspired planner for people who want to live intentionally.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Planner — Plan with Purpose',
    description: 'Connect your mission and values to daily action. A Franklin-inspired planner for people who want to live intentionally.',
  },
}

const FEATURES = [
  {
    icon: Compass,
    title: 'Mission & Values First',
    desc: 'Start with who you are. Your mission statement and core values become the foundation every goal and task flows from.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Target,
    title: 'Goal Hierarchy',
    desc: 'Set long-term goals (1–3 years), break them into short-term milestones (30–90 days), then connect daily tasks directly to your progress.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: ListTodo,
    title: 'A·B·C Priority System',
    desc: 'Inspired by the Franklin method — A tasks are must-dos, B tasks should-dos, C tasks could-dos. Drag to reorder within each priority.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: CalendarDays,
    title: 'Plan My Day Wizard',
    desc: 'A guided morning routine: set your intention, review your goals, carry forward incomplete tasks, and build your day in 2 minutes.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Heart,
    title: 'Daily Reflection',
    desc: 'End each day by logging wins, improvements, and notes. Build the habit of learning from your days, not just completing them.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: BarChart2,
    title: 'Life Categories & Roles',
    desc: 'Organize everything by area of life — Health, Family, Career, Finance. See where your time and energy actually goes.',
    color: 'bg-purple-100 text-purple-600',
  },
]

const PYRAMID = [
  { label: 'Mission Statement', sub: 'Your north star', width: 'w-48', color: 'bg-indigo-600' },
  { label: 'Core Values', sub: 'What guides you', width: 'w-64', color: 'bg-indigo-500' },
  { label: 'Long-term Goals', sub: '1–3 year vision', width: 'w-80', color: 'bg-indigo-400' },
  { label: 'Short-term Goals', sub: '30–90 day milestones', width: 'w-96', color: 'bg-indigo-300' },
  { label: 'Daily Tasks', sub: "What you do today", width: 'w-full max-w-sm', color: 'bg-indigo-200' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/icon-192.png" alt="Life Planner" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-slate-800">Life Planner</span>
          </div>
          <Link
            href="/login"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 text-sm text-indigo-300">
            <Compass size={14} />
            Franklin-inspired daily planning
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Plan your day.<br />Achieve your goals.<br />
            <span className="text-indigo-400">Live your mission.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Most planners track tasks. Life Planner connects every task you do today to the person you&apos;re becoming — starting with your mission and values.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              See How It Works
            </a>
          </div>
          <p className="text-xs text-slate-500">Free to use · Sign in with Google · Your data stays yours</p>
        </div>
      </section>

      {/* Productivity Pyramid */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Built on the Productivity Pyramid</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Inspired by the Franklin Planner system, every feature connects upward to your mission. Great days aren&apos;t accidental — they&apos;re designed.
          </p>
        </div>
        <div className="flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          {PYRAMID.map(({ label, sub, width, color }) => (
            <div key={label} className={`${width} ${color} rounded-lg py-3 px-4 text-center transition-all`}>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/70">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-slate-800">Everything you need. Nothing you don&apos;t.</h2>
            <p className="text-slate-500">Purpose-built for intentional living — not another todo app.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-slate-50 rounded-xl p-5 space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-3xl font-bold">Ready to plan with purpose?</h2>
          <p className="text-indigo-200">Start with your mission. Build your goals. Make today count.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-base"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/icon-192.png" alt="Life Planner" width={24} height={24} className="rounded-md" />
          <span className="text-sm font-semibold text-white">Life Planner</span>
        </div>
        <p className="text-xs text-slate-500">Plan your day. Achieve your goals. Live your mission.</p>
        <div className="flex justify-center gap-4 mt-3">
          <a href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
        </div>
      </footer>

    </div>
  )
}
