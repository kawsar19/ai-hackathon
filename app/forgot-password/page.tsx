"use client"

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send reset email')
      }
      setMessage('If the email exists, a reset link was sent.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Forgot Password</h1>
      <p className="text-sm text-gray-600 mb-4">Enter your account email to receive a password reset link.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}
    </div>
  )
}


