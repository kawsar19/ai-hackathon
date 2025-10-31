"use client"

import { useEffect, useState } from 'react'
import { Loader2, Send, FileText, Search } from 'lucide-react'

type Template = { id: string; name: string; subject: string; bodyHtml: string }
type UserRow = { id: string; email: string; firstName?: string; lastName?: string; role: 'USER'|'ADMIN' }

export default function SendMailPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [audience, setAudience] = useState<'USERS'|'ADMINS'|'CUSTOM'|'SELECT'>('USERS')
  const [emails, setEmails] = useState('')
  const [allUsers, setAllUsers] = useState<UserRow[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [templateId, setTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/mail-templates')
        if (res.ok) {
          const data = await res.json()
          setTemplates(data.templates || [])
        }
        const ures = await fetch('/api/admin/users')
        if (ures.ok) {
          const udata = await ures.json()
          const rows = (udata.users || []).map((u: any) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role }))
          setAllUsers(rows)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const tpl = templates.find(t => t.id === templateId)
    if (tpl) { setSubject(tpl.subject); setBodyHtml(tpl.bodyHtml) }
  }, [templateId, templates])

  const send = async () => {
    setSending(true); setMessage(null); setError(null)
    try {
      const payload: any = { audience }
      if (audience === 'CUSTOM') payload.emails = emails.split(/[,\s]+/).filter(Boolean)
      if (audience === 'SELECT') payload.emails = selectedEmails
      if (templateId) payload.templateId = templateId
      else { payload.subject = subject; payload.bodyHtml = bodyHtml }
      const res = await fetch('/api/admin/send-mail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send email')
      setMessage(`Sent to ${data.sent} recipients`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    } finally { setSending(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Send Email</h1>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-700">Audience</label>
          <select value={audience} onChange={e => setAudience(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded">
            <option value="USERS">All Users</option>
            <option value="ADMINS">All Admins</option>
            <option value="CUSTOM">Custom Emails</option>
            <option value="SELECT">Select People</option>
          </select>
        </div>

        {audience === 'CUSTOM' && (
          <div>
            <label className="text-xs text-gray-700">Emails (comma or space separated)</label>
            <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded" placeholder="user1@example.com, user2@example.com"/>
          </div>
        )}

        {audience === 'SELECT' && (
          <div className="border border-gray-200 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-gray-400"/>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email" className="flex-1 px-2 py-1 border border-gray-300 rounded"/>
            </div>
            <div className="max-h-64 overflow-auto divide-y divide-gray-100">
              {allUsers
                .filter(u => (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(userSearch.toLowerCase()))
                .map(u => (
                <label key={u.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{u.firstName} {u.lastName} <span className="text-xs text-gray-500">({u.role})</span></div>
                    <div className="text-xs text-gray-600">{u.email}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(u.email)}
                    onChange={e => {
                      setSelectedEmails(prev => e.target.checked ? Array.from(new Set([...prev, u.email])) : prev.filter(x => x !== u.email))
                    }}
                  />
                </label>
              ))}
              {allUsers.length === 0 && <div className="text-xs text-gray-500 py-2">No users found.</div>}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-700">Template</label>
          <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded">
            <option value="">— None (custom) —</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {!templateId && (
          <>
            <div>
              <label className="text-xs text-gray-700">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded" placeholder="Subject"/>
            </div>
            <div>
              <label className="text-xs text-gray-700">Body (HTML)</label>
              <textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)} rows={10} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded" placeholder="<p>Hello...</p>"/>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button onClick={send} disabled={sending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin inline mr-1"/> : <Send className="h-4 w-4 inline mr-1"/>}
            Send Email
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-600">
        <div className="font-semibold mb-2 flex items-center"><FileText className="h-3 w-3 mr-1"/> Suggested templates:</div>
        <ul className="list-disc ml-5 space-y-1">
          <li>Welcome to QSL AI Hackathon</li>
          <li>Project Approved</li>
          <li>Move to In Progress</li>
          <li>Project Completed Congratulations</li>
        </ul>
      </div>
    </div>
  )
}


