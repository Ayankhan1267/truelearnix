'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { Video, Plus, X, Calendar, Users, Clock, Link as LinkIcon } from 'lucide-react'
import { format } from 'date-fns'

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    live: 'bg-red-500/20 text-red-400 animate-pulse',
    upcoming: 'bg-blue-500/20 text-blue-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  }
  return map[s] || 'bg-gray-500/20 text-gray-400'
}

const emptyForm = {
  title: '', description: '', mentor: '', scheduledAt: '',
  duration: 60, maxParticipants: 100, meetingLink: '', type: 'webinar'
}

export default function LiveClassesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, refetch } = useQuery({
    queryKey: ['admin-classes', statusFilter],
    queryFn: () => adminAPI.allClasses({ status: statusFilter || undefined, limit: 50 }).then(r => r.data)
  })

  const classes = data?.classes || data?.data || []

  const createClass = async () => {
    if (!form.title || !form.scheduledAt) {
      toast.error('Title and schedule date are required')
      return
    }
    setSaving(true)
    try {
      await adminAPI.createClass(form)
      toast.success('Live class created!')
      setModal(false)
      setForm({ ...emptyForm })
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create class')
    } finally { setSaving(false) }
  }

  const liveCount = classes.filter((c: any) => c.status === 'live').length
  const upcomingCount = classes.filter((c: any) => ['upcoming', 'scheduled'].includes(c.status)).length
  const completedCount = classes.filter((c: any) => c.status === 'completed').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Classes</h1>
            <p className="text-gray-400 text-sm mt-0.5">{classes.length} total classes</p>
          </div>
          <button onClick={() => { setForm({ ...emptyForm }); setModal(true) }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Class
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-black text-red-400">{liveCount}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Now
            </p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-blue-400">{upcomingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Upcoming</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-green-400">{completedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-44">
            <option value="">All Status</option>
            <option value="live">Live Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Classes list */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Class</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Mentor</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Scheduled</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Participants</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {classes.map((cls: any) => (
                  <tr key={cls._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium line-clamp-1 max-w-[200px]">{cls.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{cls.type || 'webinar'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-sm">{cls.mentor?.name || cls.instructor?.name || '—'}</td>
                    <td className="px-5 py-4 text-gray-300 text-xs">
                      {cls.scheduledAt ? format(new Date(cls.scheduledAt), 'dd MMM yyyy, hh:mm a') : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{cls.duration || 60}min</span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cls.registeredCount || cls.participants?.length || 0}/{cls.maxParticipants || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusColor(cls.status)} capitalize`}>{cls.status || 'scheduled'}</span>
                    </td>
                    <td className="px-5 py-4">
                      {cls.meetingLink ? (
                        <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                          <LinkIcon className="w-3.5 h-3.5" /> Join
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {classes.length === 0 && <div className="text-center py-12 text-gray-500">No live classes found</div>}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Schedule Live Class</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Class Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input" placeholder="Introduction to Stock Market" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="input resize-none" placeholder="Class description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Scheduled Date & Time *</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Duration (minutes)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    className="input" min={15} step={15} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Max Participants</label>
                  <input type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                    className="input" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Class Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input">
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="qa">Q&A Session</option>
                    <option value="masterclass">Masterclass</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Meeting Link</label>
                <input value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                  className="input" placeholder="https://zoom.us/j/..." />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={createClass} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Creating...' : 'Schedule Class'}
              </button>
              <button onClick={() => setModal(false)} className="btn bg-slate-700 hover:bg-slate-600 text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
