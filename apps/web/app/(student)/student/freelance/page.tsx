'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { freelanceAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Briefcase, Search, Plus, X, Clock, DollarSign, Users, CheckCircle, Filter } from 'lucide-react'

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Content', 'Data', 'Video', 'Other']
const LEVELS = ['All', 'beginner', 'intermediate', 'expert']

export default function FreelancePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [showPost, setShowPost] = useState(false)
  const [tab, setTab] = useState<'browse' | 'my-jobs'>('browse')
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    title: '', description: '', budget: '', budgetType: 'fixed',
    skills: '', duration: '1 month', category: 'Development', experienceLevel: 'intermediate'
  })

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['freelance', search, category, level, tab],
    queryFn: () => {
      if (tab === 'my-jobs') return freelanceAPI.my().then(r => r.data.data)
      const params: any = {}
      if (category !== 'All') params.category = category
      if (level !== 'All') params.experienceLevel = level
      if (search) params.search = search
      return freelanceAPI.all(params).then(r => r.data.data)
    },
  })

  const postMut = useMutation({
    mutationFn: (data: any) => freelanceAPI.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['freelance'] }); toast.success('Job posted!'); setShowPost(false) },
    onError: () => toast.error('Failed to post'),
  })

  const applyMut = useMutation({
    mutationFn: (id: string) => freelanceAPI.apply(id),
    onSuccess: (_, id) => { setApplied(prev => { const s = new Set(Array.from(prev)); s.add(id); return s; }); toast.success('Application submitted!') },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to apply'),
  })

  const postJob = () => {
    if (!form.title || !form.description || !form.budget) return toast.error('Fill all required fields')
    const payload = { ...form, budget: +form.budget, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
    postMut.mutate(payload)
  }

  const LEVEL_COLORS: Record<string, string> = {
    beginner: 'text-green-400 bg-green-500/20',
    intermediate: 'text-blue-400 bg-blue-500/20',
    expert: 'text-purple-400 bg-purple-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Freelance Opportunities</h1>
          <p className="text-gray-400 text-sm mt-1">Find work and grow your income</p>
        </div>
        <button onClick={() => setShowPost(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="w-4 h-4" /> Post a Job
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(['browse', 'my-jobs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'browse' ? 'Browse Jobs' : 'My Posted Jobs'}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
                className="input pl-10 w-full" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input px-3">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className="input px-3 capitalize">
              {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l === 'All' ? 'All Levels' : l}</option>)}
            </select>
          </div>
        </div>
      )}

      {showPost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-lg border border-white/10 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Post a Job</h2>
              <button onClick={() => setShowPost(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Job Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. React Developer for E-commerce" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Detailed job description, requirements, deliverables..." rows={4} className="input w-full resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Budget (₹) *</label>
                <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  placeholder="5000" className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Budget Type</label>
                <select value={form.budgetType} onChange={e => setForm(p => ({ ...p, budgetType: e.target.value }))} className="input w-full">
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Required Skills (comma-separated)</label>
              <input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                placeholder="React, TypeScript, Node.js" className="input w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input w-full">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Experience Level</label>
                <select value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))} className="input w-full capitalize">
                  {['beginner', 'intermediate', 'expert'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 2 weeks, 1 month" className="input w-full" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPost(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
              <button onClick={postJob} disabled={postMut.isPending} className="btn-primary flex-1 py-2.5">
                {postMut.isPending ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => {
            const isOwner = (user as any)?._id === job.postedBy?._id
            const hasApplied = applied.has(job._id) || job.applicants?.includes((user as any)?._id)
            return (
              <div key={job._id} className="card hover:border-primary-500/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-bold">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[job.experienceLevel]}`}>{job.experienceLevel}</span>
                      <span className="text-xs text-gray-500 capitalize bg-dark-700 px-2 py-0.5 rounded-full">{job.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">{job.description}</p>
                    {job.skills?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-3">
                        {job.skills.map((s: string) => <span key={s} className="text-xs bg-dark-700 text-gray-300 px-2 py-0.5 rounded-full">{s}</span>)}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{job.budget.toLocaleString()} {job.budgetType}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicants?.length || 0} applicants</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-400 text-xs font-bold">{job.postedBy?.name?.[0]}</span>
                      </div>
                    </div>
                    {!isOwner && tab === 'browse' && (
                      <button onClick={() => applyMut.mutate(job._id)}
                        disabled={hasApplied || applyMut.isPending}
                        className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${hasApplied ? 'bg-green-500/20 text-green-400 cursor-default' : 'btn-primary'}`}>
                        {hasApplied ? <><CheckCircle className="w-3.5 h-3.5 inline mr-1" />Applied</> : 'Apply Now'}
                      </button>
                    )}
                    {isOwner && <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded-full">Your Job</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {jobs.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No jobs found. Check back later or post your own!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
