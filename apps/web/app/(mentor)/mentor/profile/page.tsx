'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Save, Loader2 } from 'lucide-react'

export default function MentorProfile() {
  const { updateUser } = useAuthStore()
  const qc = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', bio: '', expertise: '', socialLinks: { twitter: '', linkedin: '', youtube: '' } })
  const [initialized, setInitialized] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => userAPI.me().then(r => r.data.user),
  })

  if (user && !initialized) {
    setForm({
      name: user.name || '', phone: user.phone || '', bio: user.bio || '',
      expertise: Array.isArray(user.expertise) ? user.expertise.join(', ') : (user.expertise || ''),
      socialLinks: { twitter: user.socialLinks?.twitter || '', linkedin: user.socialLinks?.linkedin || '', youtube: user.socialLinks?.youtube || '' },
    })
    setInitialized(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await userAPI.update({ ...form, expertise: form.expertise.split(',').map((s: string) => s.trim()).filter(Boolean) })
      updateUser(res.data.user)
      qc.invalidateQueries({ queryKey: ['user-me'] })
      setMsg({ type: 'success', text: 'Profile updated!' })
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Update failed' })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mentor Profile</h1>
        <p className="text-gray-400 mt-1">Update your public mentor information</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            : <span className="text-2xl font-bold text-primary-400">{user?.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <p className="font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Bio (Public)</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="input min-h-[100px] resize-none" placeholder="Introduce yourself to students..." />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Expertise (comma separated)</label>
          <input value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))}
            className="input" placeholder="Digital Marketing, SEO, Social Media..." />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Social Links</h3>
          <div className="space-y-3">
            {(['twitter', 'linkedin', 'youtube'] as const).map(p => (
              <div key={p}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{p}</label>
                <input value={form.socialLinks[p]} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [p]: e.target.value } }))}
                  className="input text-sm" placeholder={`${p}.com/yourhandle`} />
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  )
}
