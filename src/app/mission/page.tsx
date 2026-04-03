'use client'

import { useState } from 'react'
import { Compass, Plus, Trash2, Save, Edit3 } from 'lucide-react'
import { useProfile, useValues } from '@/lib/hooks'

export default function MissionPage() {
  const { profile, updateProfile } = useProfile()
  const { values, addValue, updateValue, deleteValue } = useValues()
  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState('')
  const [newValueTitle, setNewValueTitle] = useState('')
  const [newValueDesc, setNewValueDesc] = useState('')
  const [showValueForm, setShowValueForm] = useState(false)

  const startEditMission = () => {
    setMissionDraft(profile?.mission_statement || '')
    setEditingMission(true)
  }

  const saveMission = async () => {
    await updateProfile({ mission_statement: missionDraft.trim() || null })
    setEditingMission(false)
  }

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newValueTitle.trim()) return
    await addValue(newValueTitle.trim(), newValueDesc.trim())
    setNewValueTitle('')
    setNewValueDesc('')
    setShowValueForm(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mission & Values</h1>
        <p className="text-sm text-slate-500 mt-1">
          The foundation of your Life Planner. Everything flows from here.
        </p>
      </div>

      {/* Productivity Pyramid context */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-start gap-3">
          <Compass size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold">Your Personal Mission Statement</h2>
            <p className="text-sm text-indigo-100 mt-1">
              This is the base of your productivity pyramid. Your values drive your long-term goals,
              which break into short-term goals, which become your daily tasks. Start here.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Mission Statement</h3>
          {!editingMission && (
            <button
              onClick={startEditMission}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
            >
              <Edit3 size={12} />
              Edit
            </button>
          )}
        </div>

        {editingMission ? (
          <div className="space-y-3">
            <textarea
              value={missionDraft}
              onChange={e => setMissionDraft(e.target.value)}
              placeholder="What is your life's purpose? What kind of person do you want to be? What legacy do you want to leave?"
              rows={6}
              className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-300 resize-none leading-relaxed"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={saveMission} className="flex items-center gap-1 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                <Save size={14} />
                Save
              </button>
              <button onClick={() => setEditingMission(false)} className="text-sm text-slate-500 px-4 py-2">
                Cancel
              </button>
            </div>
          </div>
        ) : profile?.mission_statement ? (
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">
              &ldquo;{profile.mission_statement}&rdquo;
            </p>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <Compass size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 mb-3">You haven&apos;t written your mission statement yet.</p>
            <button
              onClick={startEditMission}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Write your mission statement
            </button>
          </div>
        )}
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Core Values</h3>
            <p className="text-xs text-slate-400 mt-0.5">The principles that guide your decisions</p>
          </div>
          <button
            onClick={() => setShowValueForm(!showValueForm)}
            className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={12} />
            Add Value
          </button>
        </div>

        {showValueForm && (
          <form onSubmit={handleAddValue} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              value={newValueTitle}
              onChange={e => setNewValueTitle(e.target.value)}
              placeholder="Value name (e.g., Integrity, Family First, Lifelong Learning)"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
              autoFocus
            />
            <textarea
              value={newValueDesc}
              onChange={e => setNewValueDesc(e.target.value)}
              placeholder="What does this value mean to you?"
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg">Add</button>
              <button type="button" onClick={() => setShowValueForm(false)} className="text-xs text-slate-500 px-3 py-1.5">Cancel</button>
            </div>
          </form>
        )}

        {values.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-400">No values defined yet. What matters most to you?</p>
          </div>
        ) : (
          <div className="space-y-3">
            {values.map((value, index) => (
              <div key={value.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group">
                <span className="text-lg font-bold text-indigo-300 mt-0.5">{index + 1}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-700">{value.title}</h4>
                  {value.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{value.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteValue(value.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it connects */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">How This Works</h3>
        <div className="text-xs text-amber-700 space-y-1">
          <p><strong>Mission Statement</strong> &rarr; defines your purpose and direction</p>
          <p><strong>Core Values</strong> &rarr; guide your daily decisions and priorities</p>
          <p><strong>Long-term Goals</strong> &rarr; specific achievements aligned with your values (1-3 years)</p>
          <p><strong>Short-term Goals</strong> &rarr; stepping stones to your long-term goals (30-90 days)</p>
          <p><strong>Daily Tasks</strong> &rarr; the actions you take TODAY to move forward</p>
        </div>
      </div>
    </div>
  )
}
