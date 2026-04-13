'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classAPI } from '@/lib/api'
import { Video, Plus, Calendar, Clock, Users, Play, Square, X, ExternalLink, Radio } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function MentorClassesPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: classes, isLoading } = useQuery({
    queryKey: ['mentor-classes'],
    queryFn: () => classAPI.upcoming().then(r => r.data.classes)
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => classAPI.start(id),
    onSuccess: (_, id) => { qc.invalidateQueries({ queryKey: ['mentor-classes'] }); router.push(`/mentor/classes/${id}`) },
    onError: () => toast.error('Could not start class')
  })

  const endMutation = useMutation({
    mutationFn: (id: string) => classAPI.end(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentor-classes'] }); toast.success('Class ended') },
    onError: () => toast.error('Could not end class')
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => classAPI.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentor-classes'] }); toast.success('Class cancelled') },
    onError: () => toast.error('Could not cancel class')
  })

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    live: 'bg-green-500/20 text-green-400 border-green-500/30',
    ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Live Classes</h1>
          <p className="text-gray-400 mt-1 text-sm">Schedule and manage your live sessions</p>
        </div>
        <Link href="/mentor/classes/new"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm w-fit">
          <Plus className="w-4 h-4" /> Schedule Class
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: classes?.length || 0, icon: Video, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Live Now', value: classes?.filter((c: any) => c.status === 'live').length || 0, icon: Radio, color: 'text-green-400 bg-green-500/10' },
          { label: 'Upcoming', value: classes?.filter((c: any) => c.status === 'scheduled').length || 0, icon: Calendar, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Total Students', value: classes?.reduce((a: number, c: any) => a + (c.attendees?.length || 0), 0) || 0, icon: Users, color: 'text-yellow-400 bg-yellow-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-800 rounded-xl p-4 border border-white/5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Classes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-dark-800 rounded-2xl h-28 animate-pulse border border-white/5" />)}
        </div>
      ) : !classes?.length ? (
        <div className="bg-dark-800 rounded-2xl p-12 border border-white/5 text-center">
          <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No classes yet</h3>
          <p className="text-gray-400 text-sm mb-6">Schedule your first live class to get started</p>
          <Link href="/mentor/classes/new" className="btn-primary text-sm px-6 py-2.5">
            + Schedule Your First Class
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls: any) => (
            <div key={cls._id}
              className={`bg-dark-800 rounded-2xl p-4 lg:p-5 border transition-all ${cls.status === 'live' ? 'border-green-500/30 shadow-lg shadow-green-500/5' : 'border-white/5 hover:border-white/10'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: icon + info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.status === 'live' ? 'bg-green-500/20' : 'bg-primary-500/10'}`}>
                    {cls.status === 'live'
                      ? <Radio className="w-6 h-6 text-green-400 animate-pulse" />
                      : <Video className="w-6 h-6 text-primary-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white truncate">{cls.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[cls.status] || statusColor.scheduled}`}>
                        {cls.status === 'live' ? '● LIVE' : cls.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cls.platform === 'zoom' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {cls.platform === 'zoom' ? 'Zoom' : 'WebRTC'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">{cls.course?.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(cls.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(cls.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {cls.duration}min</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.attendees?.length || 0} joined</span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {cls.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => startMutation.mutate(cls._id)}
                        disabled={startMutation.isPending}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        <Play className="w-4 h-4" /> Start
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate(cls._id)}
                        disabled={cancelMutation.isPending}
                        className="flex items-center gap-1.5 bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-sm px-3 py-2 rounded-xl transition-colors border border-white/5">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  )}
                  {cls.status === 'live' && (
                    <>
                      <Link href={`/mentor/classes/${cls._id}`}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors animate-pulse">
                        <Radio className="w-4 h-4" /> Enter Class
                      </Link>
                      <button
                        onClick={() => endMutation.mutate(cls._id)}
                        disabled={endMutation.isPending}
                        className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm px-3 py-2 rounded-xl transition-colors border border-red-500/30">
                        <Square className="w-4 h-4" /> End
                      </button>
                    </>
                  )}
                  {cls.status === 'ended' && cls.zoomJoinUrl && (
                    <a href={cls.zoomJoinUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Recording
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
