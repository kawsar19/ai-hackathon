"use client"

import { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react'

type Template = { id: string; name: string; subject: string; bodyHtml: string; createdAt: string }

export default function MailTemplatesPage() {
  const [list, setList] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form, setForm] = useState({ name: '', subject: '', bodyHtml: '' })
  const [saving, setSaving] = useState(false)

  const fetchList = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/mail-templates')
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json()
      setList(data.templates || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading templates')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchList() }, [])

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      if (editing) {
        const res = await fetch(`/api/admin/mail-templates/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Failed to update')
      } else {
        const res = await fetch('/api/admin/mail-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error('Failed to create')
      }
      setForm({ name: '', subject: '', bodyHtml: '' })
      setEditing(null)
      fetchList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this template?')) return
    const res = await fetch(`/api/admin/mail-templates/${id}`, { method: 'DELETE' })
    if (res.ok) fetchList()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mail Templates</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', subject: '', bodyHtml: '' }) }} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"><Plus className="h-4 w-4 inline mr-1"/> New Template</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-white border border-gray-200 rounded p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin"/> Loading...</div>
          ) : (
            <div className="space-y-3">
              {list.map(t => (
                <div key={t.id} className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-600">{t.subject}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(t); setForm({ name: t.name, subject: t.subject, bodyHtml: t.bodyHtml }) }} className="p-2 text-gray-600 hover:text-blue-600"><Pencil className="h-4 w-4"/></button>
                      <button onClick={() => del(t.id)} className="p-2 text-gray-600 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="text-sm text-gray-500">No templates yet.</div>}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{editing ? 'Edit Template' : 'Create Template'}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-700">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded" placeholder="Welcome Email"/>
            </div>
            <div>
              <label className="text-xs text-gray-700">Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded" placeholder="Welcome to the Hackathon"/>
            </div>
            <div>
              <label className="text-xs text-gray-700">Body (HTML)</label>
              <textarea value={form.bodyHtml} onChange={e => setForm({ ...form, bodyHtml: e.target.value })} rows={10} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded" placeholder="<p>Hello...</p>"/>
            </div>
            <div className="flex justify-end gap-2">
              {editing && <button onClick={() => { setEditing(null); setForm({ name: '', subject: '', bodyHtml: '' }) }} className="px-3 py-2 text-sm border rounded text-gray-700"><X className="h-4 w-4 inline mr-1"/> Cancel</button>}
              <button onClick={save} disabled={saving} className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"><Save className="h-4 w-4 inline mr-1"/> {saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


