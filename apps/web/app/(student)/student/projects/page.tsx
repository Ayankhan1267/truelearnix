'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Plus, X, Github, Globe, Heart, Eye, Code2, Search, Briefcase } from 'lucide-react'

const CATEGORIES = ['All', 'Web', 'Mobile', 'AI/ML', 'Data Science', 'Blockchain', 'DevOps', 'General']

const empty = { title: '', description: '', techStack: '', liveUrl: '', repoUrl: '', thumbnail: '', category: 'Web' }

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(empty)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [tab, setTab] = useState<'all' | 'mine'>('all')

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects', category, search, tab],
    queryFn: () => {
      const params: any = {}
      if (category !== 'All') params.category = category
      if (search) params.search = search
      if (tab === 'mine') params.userId = (user as any)?._id
      return projectAPI.all(params).then(r => r.data.data)
    },
  })

  const createMut = useMutation({
    mutationFn: (data: any) => projectAPI.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project published!'); setShowForm(false); setForm(empty) },
    onError: () => toast.error('Failed to publish'),
  })

  const likeMut = useMutation({
    mutationFn: (id: string) => projectAPI.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => projectAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed'),
  })

  const submit = () => {
    if (!form.title || !form.description) return toast.error('Title and description required')
    const payload = { ...form, techStack: form.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) }
    createMut.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Showcase</h1>
          <p className="text-gray-400 text-sm mt-1">Share your work with the community</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(['all', 'mine'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors capitalize ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'all' ? 'All Projects' : 'My Projects'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="input pl-10 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${category === c ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-lg border border-white/10 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Add Project</h2>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {[
              { label: 'Project Title *', key: 'title', placeholder: 'e.g. AI Resume Builder' },
              { label: 'Description *', key: 'description', textarea: true, placeholder: 'What does your project do?' },
              { label: 'Tech Stack (comma-separated)', key: 'techStack', placeholder: 'React, Node.js, MongoDB' },
              { label: 'Live URL', key: 'liveUrl', placeholder: 'https://myproject.com' },
              { label: 'GitHub Repo', key: 'repoUrl', placeholder: 'https://github.com/...' },
              { label: 'Thumbnail URL', key: 'thumbnail', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{f.label}</label>
                {f.textarea ? (
                  <textarea value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} rows={3} className="input w-full resize-none" />
                ) : (
                  <input value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input w-full" />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} className="input w-full">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
              <button onClick={submit} disabled={createMut.isPending} className="btn-primary flex-1 py-2.5">
                {createMut.isPending ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allProjects.map((p: any) => {
            const isOwner = (user as any)?._id === p.owner?._id
            const isLiked = p.likes?.includes((user as any)?._id)
            return (
              <div key={p._id} className="card group hover:border-primary-500/30 transition-all overflow-hidden">
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                ) : (
                  <div className="w-full h-36 bg-primary-500/10 rounded-xl mb-4 flex items-center justify-center">
                    <Code2 className="w-10 h-10 text-primary-500/40" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold leading-snug">{p.title}</h3>
                  {isOwner && (
                    <button onClick={() => deleteMut.mutate(p._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{p.description}</p>
                {p.techStack?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {p.techStack.map((t: string) => <span key={t} className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <span className="text-primary-400 text-xs font-bold">{p.owner?.name?.[0]}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{p.owner?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => likeMut.mutate(p._id)} className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                      <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
                      <span className="text-xs">{p.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {allProjects.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No projects found. Be the first to showcase your work!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
