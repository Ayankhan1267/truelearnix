'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classAPI, courseAPI, mentorAPI } from '@/lib/api'
import { Video, Plus, Loader2, Play, Square, X, Users, Clock, Calendar, Zap, CheckCircle2 } from 'lucide-react'
import { format, formatDistanceToNow, isFuture } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-500/20 text-blue-400' },
  live:      { label: 'LIVE',      cls: 'bg-red-500/20 text-red-400 animate-pulse' },
  ended:     { label: 'Ended',     cls: 'bg-gray-500/20 text-gray-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400' },
}

export default function MentorClasses() {
  const qc = useQueryClient()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', courseId: '', scheduledAt: '', duration: '60', platform: 'zoom' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const { data: classes, isLoading } = useQuery({
    queryKey: ['mentor-classes'],
    queryFn: () => mentorAPI.myClasses().then(r => r.data.classes),
  })
  const { data: courses } = useQuery({
    queryKey: ['mentor-courses'],
    queryFn: () => courseAPI.myMentorCourses().then(r => r.data.courses),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => classAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-classes'] })
      setShowForm(false)
      setForm({ title: '', courseId: '', scheduledAt: '', duration: '60', platform: 'zoom' })
      toast.success('Class scheduled!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => classAPI.start(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['mentor-classes'] })
      toast.success('Class started!')
      router.push(`/mentor/classes/${id}`)
    },
  })
  const endMutation = useMutation({
    mutationFn: (id: string) => classAPI.end(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentor-classes'] }); toast.success('Class ended') },
  })
  const cancelMutation = useMutation({
    mutationFn: (id: string) => classAPI.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentor-classes'] }); toast.success('Class cancelled') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Classes</h1>
          <p className="text-gray-400 mt-1">Schedule and manage your live sessions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Class
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-white">Schedule New Class</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Class Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="e.g. Digital Marketing Module 1" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Course</label>
              <select value={form.courseId} onChange={e => set('courseId', e.target.value)} className="input">
                <option value="">— General Session —</option>
                {courses?.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date & Time *</label>
              <input value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} type="datetime-local" className="input" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (minutes)</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} type="number" className="input" min="15" max="300" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platform</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className="input">
                <option value="zoom">Zoom (auto-created)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate({ ...form, duration: Number(form.duration) })}
              disabled={createMutation.isPending || !form.title || !form.scheduledAt}
              className="btn-primary flex items-center gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              Schedule
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Classes List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
      ) : classes?.length === 0 ? (
        <div className="card text-center py-16">
          <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No classes scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes?.map((cls: any) => (
            <div key={cls._id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{cls.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[cls.status] || STATUS_BADGE.scheduled}`}>{cls.status}</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {format(new Date(cls.scheduledAt), 'dd MMM yyyy, hh:mm a')} • {cls.duration} min
                  {cls.course && ` • ${cls.course.title}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cls.status === 'live' && (
                  <Link href={`/mentor/classes/${cls._id}`}
                    className="flex items-center gap-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg">
                    <Zap className="w-3.5 h-3.5" /> Rejoin
                  </Link>
                )}
                {cls.status === 'scheduled' && (
                  <>
                    <button onClick={() => startMutation.mutate(cls._id)} disabled={startMutation.isPending}
                      className="flex items-center gap-1.5 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg">
                      <Play className="w-3.5 h-3.5" /> Start
                    </button>
                    <button onClick={() => cancelMutation.mutate(cls._id)} disabled={cancelMutation.isPending}
                      className="flex items-center gap-1.5 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
                {cls.status === 'live' && (
                  <button onClick={() => endMutation.mutate(cls._id)} disabled={endMutation.isPending}
                    className="flex items-center gap-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg">
                    <Square className="w-3.5 h-3.5" /> End Class
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
