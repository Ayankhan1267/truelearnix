'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      const { user, accessToken, refreshToken } = res.data
      if (accessToken) {
        setAuth(user, accessToken, refreshToken)
        toast.success('Account created! Welcome to TruLance!')
        router.push('/dashboard')
      } else {
        toast.success('Account created! Please verify your email.')
        router.push('/login')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Registration failed')
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
          <h1 className="text-2xl font-black text-white">Join TruLance</h1>
          <p className="text-gray-500 text-sm mt-1">Start freelancing or post your first project</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Rahul Sharma" className="input" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" className="input" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210" className="input" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters" className="input pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-bold text-sm">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-400 hover:underline font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
