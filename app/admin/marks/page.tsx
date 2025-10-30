"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle, Loader2, X, User, ExternalLink } from "lucide-react"

type Idea = {
  id: string
  title: string
  status: string
  user: { firstName: string; lastName: string; email: string }
}

type Admin = { id: string; firstName?: string; lastName?: string; email: string }

type IdeaScore = {
  id: string
  ideaId: string
  adminId: string
  innovation: number
  aiIntegration: number
  designUx: number
  problemSolving: number
  codeQuality: number
  performance: number
  scalability: number
  documentation: number
  presentation: number
  completeness: number
  score?: number
  admin: Admin
}

const categories: { key: keyof Omit<IdeaScore, 'id'|'ideaId'|'adminId'|'score'|'admin'>; label: string }[] = [
  { key: 'innovation', label: 'Innovation' },
  { key: 'aiIntegration', label: 'AI Integration' },
  { key: 'designUx', label: 'Design & UX' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'codeQuality', label: 'Code Quality' },
  { key: 'performance', label: 'Performance' },
  { key: 'scalability', label: 'Scalability' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'completeness', label: 'Completeness' },
]

export default function AdminMarksPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [scores, setScores] = useState<IdeaScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [markingIdea, setMarkingIdea] = useState<Idea | null>(null)
  const [form, setForm] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [ideasRes, usersRes, scoresRes, meRes] = await Promise.all([
          fetch('/api/admin/ideas', { credentials: 'include' }),
          fetch('/api/admin/users', { credentials: 'include' }),
          fetch('/api/admin/scores', { credentials: 'include' }),
          fetch('/api/auth/profile', { credentials: 'include' }),
        ])
        if (!ideasRes.ok || !usersRes.ok || !scoresRes.ok || !meRes.ok) throw new Error('Failed to load data')
        const ideasJson = await ideasRes.json()
        const usersJson = await usersRes.json()
        const scoresJson = await scoresRes.json()
        const meJson = await meRes.json()
        setIdeas((ideasJson.ideas || []).filter((i: Idea) => i.status === 'COMPLETED'))
        setAdmins((usersJson.users || []).filter((u: any) => u.role === 'ADMIN'))
        setScores(scoresJson.scores || [])
        setCurrentAdmin(meJson.user)
      } catch (e: any) {
        console.error(e)
        setError('Failed to load marking data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const ideaIdToAdminIdToScore = useMemo(() => {
    const map: Record<string, Record<string, IdeaScore>> = {}
    for (const s of scores) {
      if (!map[s.ideaId]) map[s.ideaId] = {}
      map[s.ideaId][s.adminId] = s
    }
    return map
  }, [scores])

  const totalOf = (s?: Partial<IdeaScore>): number => {
    if (!s) return 0
    return categories.reduce((sum, c) => sum + (Number((s as any)[c.key]) || 0), 0)
  }

  const openMark = (idea: Idea) => {
    setMarkingIdea(idea)
    const existing = ideaIdToAdminIdToScore[idea.id]?.[currentAdmin?.id || '']
    const initial: Record<string, number> = {}
    for (const c of categories) {
      initial[c.key] = (existing as any)?.[c.key] ?? 0
    }
    setForm(initial)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!markingIdea) return
    try {
      setSaving(true)
      const res = await fetch('/api/admin/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: markingIdea.id, ...form }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save score')
      }
      const data = await res.json()
      // Update local cache
      setScores(prev => {
        const others = prev.filter(s => !(s.ideaId === data.score.ideaId && s.adminId === data.score.adminId))
        return [...others, data.score]
      })
      setSaveSuccess(true)
      setTimeout(() => setMarkingIdea(null), 800)
    } catch (e) {
      console.error(e)
      alert('Failed to save score')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-red-800">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Marking</h1>
          <p className="text-gray-600 text-sm">Completed projects as rows; admins as columns; totals out of 100.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              {admins.map(a => (
                <th key={a.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {(a.firstName || a.lastName) ? `${a.firstName || ''} ${a.lastName || ''}`.trim() : a.email}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideas.map(idea => {
              const adminTotals = admins.map(a => totalOf(ideaIdToAdminIdToScore[idea.id]?.[a.id]))
              const avg = adminTotals.length ? Math.round((adminTotals.reduce((s, n) => s + n, 0) / adminTotals.length) * 10) / 10 : 0
              return (
                <tr key={idea.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{idea.title}</div>
                    <div className="text-xs text-gray-500">by {idea.user.firstName} {idea.user.lastName}</div>
                  </td>
                  {admins.map(a => {
                    const t = adminTotals[admins.findIndex(x => x.id === a.id)]
                    const isMe = a.id === currentAdmin?.id
                    return (
                      <td key={a.id} className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${t ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                          {t || 0}/100 {isMe && t ? '✓' : ''}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{avg}/100</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => openMark(idea)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mark
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {markingIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="relative top-10 mx-auto w-11/12 md:w-3/4 lg:w-2/3 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mark: {markingIdea.title}</h3>
                <p className="text-xs text-gray-500">Enter 0–10 per category (total 100)</p>
              </div>
              <button onClick={() => setMarkingIdea(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(c => (
                <div key={c.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{c.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={form[c.key as string] ?? 0}
                    onChange={(e) => setForm({ ...form, [c.key]: Math.max(0, Math.min(10, parseInt(e.target.value || '0'))) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="px-5 pb-3 text-right text-sm text-gray-700">Total: {categories.reduce((s, c) => s + (form[c.key as string] || 0), 0)}/100</div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-200">
              <button onClick={() => setMarkingIdea(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Save
              </button>
            </div>
            {saveSuccess && (
              <div className="px-5 pb-5 -mt-3 text-green-600 text-sm">Saved!</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


