'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { user, accessToken, refreshToken } = res.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`)
      const redirect = searchParams.get('redirect')
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 8px 32px rgba(13,148,136,0.35)' }}>
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome to TruLance</h1>
          <p className="text-gray-500 text-sm mt-1">Use your TruLearnix account credentials</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" className="input" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" className="input pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-bold text-sm">
              {loading ? 'Logging in...' : 'Login to TruLance'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            No account?{' '}
            <Link href="/register" className="text-teal-400 hover:underline font-semibold">Create one free</Link>
          </p>
          <p className="text-center text-xs text-gray-700 mt-2">
            Same as <a href="https://peptly.in" className="text-teal-400 hover:underline">peptly.in</a> credentials
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}
