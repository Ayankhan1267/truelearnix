'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { freelanceAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Briefcase, Plus, X } from 'lucide-react'

const CATEGORIES = ['Development', 'Design', 'Marketing', 'Content', 'Data', 'Video', 'Other']
const LEVELS = ['beginner', 'intermediate', 'expert']

export default function PostProjectPage() {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    budgetType: 'fixed',
    category: 'Development',
    experienceLevel: 'intermediate',
    duration: '1 month',
    skills: [] as string[],
  })

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      toast.error('Please login to post a project')
      router.push('/login?redirect=/post-project')
    }
  }, [_hasHydrated, user, router])

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) setForm(p => ({ ...p, skills: [...p.skills, s] }))
    setSkillInput('')
  }
  const removeSkill = (s: string) => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.budget) return toast.error('Fill all required fields')
    setLoading(true)
    try {
      await freelanceAPI.postProject({ ...form, budget: Number(form.budget) })
      toast.success('Project posted!')
      router.push('/projects')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to post project')
    } finally {
      setLoading(false)
    }
  }

  if (!_hasHydrated || !user) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Post a Project</h1>
          </div>
          <p className="text-gray-500 ml-13 text-sm">Describe your project and find the right talent</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="card space-y-5">
            <h2 className="font-bold text-white">Project Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Build a Landing Page for E-commerce" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe what you need, deliverables, timeline, requirements..." rows={5} className="input resize-none" required />
            </div>
          </div>

          <div className="card space-y-5">
            <h2 className="font-bold text-white">Budget & Timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Budget (₹) *</label>
                <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  placeholder="5000" className="input" required min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                <select value={form.budgetType} onChange={e => setForm(p => ({ ...p, budgetType: e.target.value }))} className="input">
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 2 weeks, 1 month" className="input" />
            </div>
          </div>

          <div className="card space-y-5">
            <h2 className="font-bold text-white">Requirements</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Experience Level</label>
                <select value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))} className="input capitalize">
                  {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Required Skills</label>
              <div className="flex gap-2 mb-3">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill, press Enter to add" className="input flex-1" />
                <button type="button" onClick={addSkill} className="btn-secondary px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map(s => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-teal-400"
                      style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
                      {s}
                      <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold">
            {loading ? 'Posting...' : 'Post Project →'}
          </button>
        </form>
      </div>
    </div>
  )
}
