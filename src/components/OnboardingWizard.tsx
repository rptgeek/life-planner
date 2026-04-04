'use client'

import { useState } from 'react'
import { Compass, ChevronRight, ChevronLeft, Check, Sparkles, Heart, Target, ListTodo, Star } from 'lucide-react'
import { useProfile, useValues, useCategories } from '@/lib/hooks'

const TOTAL_STEPS = 6

const SUGGESTED_VALUES = [
  'Family First', 'Integrity', 'Faith', 'Health & Vitality', 'Lifelong Learning',
  'Generosity', 'Courage', 'Discipline', 'Gratitude', 'Leadership',
  'Creativity', 'Service', 'Financial Freedom', 'Adventure', 'Excellence',
]

const SUGGESTED_CATEGORIES = [
  { name: 'Health & Fitness', color: '#10b981' },
  { name: 'Family', color: '#ec4899' },
  { name: 'Career & Work', color: '#3b82f6' },
  { name: 'Finance', color: '#f59e0b' },
  { name: 'Personal Growth', color: '#8b5cf6' },
  { name: 'Faith & Spirituality', color: '#6366f1' },
  { name: 'Social & Friends', color: '#14b8a6' },
  { name: 'Home & Family Admin', color: '#f97316' },
]

interface Props {
  onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: Props) {
  const { profile, updateProfile } = useProfile()
  const { addValue } = useValues()
  const { addCategory } = useCategories()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 2
  const [displayName, setDisplayName] = useState(profile?.display_name || '')

  // Step 3
  const [mission, setMission] = useState(profile?.mission_statement || '')

  // Step 4
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set())
  const [customValue, setCustomValue] = useState('')
  const [customValues, setCustomValues] = useState<string[]>([])

  // Step 5
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(SUGGESTED_CATEGORIES.slice(0, 5).map(c => c.name))
  )

  const toggleValue = (v: string) => {
    setSelectedValues(prev => {
      const next = new Set(prev)
      next.has(v) ? next.delete(v) : next.add(v)
      return next
    })
  }

  const addCustomValue = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    setCustomValues(prev => [...prev, trimmed])
    setSelectedValues(prev => new Set([...prev, trimmed]))
    setCustomValue('')
  }

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleFinish = async () => {
    setSaving(true)

    const updates: Record<string, string | null> = {}
    if (displayName.trim()) updates.display_name = displayName.trim()
    if (mission.trim()) updates.mission_statement = mission.trim()
    if (Object.keys(updates).length > 0) await updateProfile(updates)

    const allValues = [...selectedValues]
    for (const v of allValues) {
      await addValue(v, '')
    }

    const allSuggested = SUGGESTED_CATEGORIES.filter(c => selectedCategories.has(c.name))
    for (const c of allSuggested) {
      await addCategory(c.name, c.color, 'folder')
    }

    localStorage.setItem('onboarding_complete', '1')
    setSaving(false)
    onComplete()
  }

  const canProceed = () => {
    if (step === 2 && !displayName.trim()) return false
    return true
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 px-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i + 1 === step
                  ? 'w-6 h-2 bg-indigo-600'
                  : i + 1 < step
                  ? 'w-2 h-2 bg-indigo-400'
                  : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Compass size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome to Life Planner</h1>
                <p className="text-slate-500 mt-2">Let&apos;s take 2 minutes to set up your foundation. This is where great days begin.</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-left space-y-4">
                <p className="text-sm font-semibold text-indigo-800">The Productivity Pyramid</p>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Inspired by the Franklin Planner system, Life Planner is built on a simple truth:
                  <strong> great days don&apos;t happen by accident</strong>. They flow from knowing who you are and what matters most.
                </p>
                <div className="space-y-2">
                  {[
                    { icon: Compass, label: 'Mission Statement', desc: 'Your north star. Who you are and why you\'re here.', color: 'text-indigo-600' },
                    { icon: Heart, label: 'Core Values', desc: 'The principles that guide every decision you make.', color: 'text-pink-500' },
                    { icon: Target, label: 'Goals', desc: 'Long-term vision broken into achievable milestones.', color: 'text-amber-500' },
                    { icon: ListTodo, label: 'Daily Tasks', desc: 'The actions you take TODAY that move the needle.', color: 'text-green-500' },
                  ].map(({ icon: Icon, label, desc, color }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={16} className={`${color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <span className="text-xs text-slate-500"> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400">You can skip any step and fill it in later from the Mission & Values page.</p>
            </div>
          )}

          {/* Step 2: Your Name */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">What should we call you?</h2>
                <p className="text-sm text-slate-500 mt-1">Your name appears in your daily greeting.</p>
              </div>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your first name or nickname"
                autoFocus
                className="w-full text-base border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-300"
              />
            </div>
          )}

          {/* Step 3: Mission Statement */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Write your mission statement</h2>
                <p className="text-sm text-slate-500 mt-1">This is the most important thing you&apos;ll do here. Take your time — you can always refine it.</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-800">What makes a great mission statement?</p>
                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                  <li>Describes the kind of person you want to be, not just what you want to do</li>
                  <li>Covers your most important roles — parent, spouse, professional, community member</li>
                  <li>Reflects your deepest values and what you want to be remembered for</li>
                  <li>Feels true to you when you read it — not aspirational fluff, but a real compass</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Example to get you started:</p>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;To be a present and loving father and husband, to lead with integrity in my work, to grow in faith and wisdom every day, and to leave the world a little better than I found it.&rdquo;
                </p>
              </div>

              <textarea
                value={mission}
                onChange={e => setMission(e.target.value)}
                placeholder="To be… / My mission is… / I am…"
                rows={5}
                autoFocus
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-300 resize-none leading-relaxed"
              />

              <button
                onClick={() => setStep(s => s + 1)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Skip for now — I&apos;ll write this later
              </button>
            </div>
          )}

          {/* Step 4: Core Values */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Choose your core values</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pick the 5–7 principles that define you. These will guide your goals and daily priorities.
                  You can always add more later.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...SUGGESTED_VALUES, ...customValues].map(v => {
                  const selected = selectedValues.has(v)
                  return (
                    <button
                      key={v}
                      onClick={() => toggleValue(v)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        selected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {selected && <Check size={11} className="inline mr-1" />}
                      {v}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomValue() }}
                  placeholder="Add your own value…"
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
                />
                <button
                  onClick={addCustomValue}
                  disabled={!customValue.trim()}
                  className="text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg disabled:opacity-40 hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>

              {selectedValues.size > 0 && (
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedValues.size} value{selectedValues.size !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Step 5: Life Categories */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Set up your life categories</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Categories help you organize tasks and goals by area of life — so you can see at a glance if you&apos;re balanced. Select the ones that apply to you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_CATEGORIES.map(cat => {
                  const selected = selectedCategories.has(cat.name)
                  return (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-slate-700 flex-1">{cat.name}</span>
                      {selected && <Check size={13} className="text-indigo-500 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-slate-400">You can add, edit, or remove categories anytime in Settings.</p>
            </div>
          )}

          {/* Step 6: All done */}
          {step === 6 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">You&apos;re all set{displayName ? `, ${displayName.trim()}` : ''}!</h2>
                <p className="text-slate-500 mt-2">Your foundation is in place. Now let&apos;s make today count.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-600 mb-3">Here&apos;s what to do next:</p>
                {[
                  'Head to Goals and create your first long-term goal',
                  'Break it into short-term goals (30–90 day milestones)',
                  'Use "Plan My Day" each morning to link tasks to your goals',
                  'End each day with a quick reflection on what went well',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Star size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : undefined}
            className={`flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => canProceed() && setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              {step === 1 ? "Let's go" : 'Next'}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : (
                <>
                  <Check size={16} />
                  Start Planning
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
