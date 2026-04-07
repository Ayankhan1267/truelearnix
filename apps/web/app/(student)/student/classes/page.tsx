'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { classAPI } from '@/lib/api'
import { Video, Clock, Bell, Play, Calendar, User } from 'lucide-react'
import { format, formatDistanceToNow, isFuture } from 'date-fns'
import toast from 'react-hot-toast'

export default function LiveClassesPage() {
  const [tab, setTab] = useState<'upcoming' | 'recordings'>('upcoming')
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes-all'],
    queryFn: () => classAPI.upcoming().then(r => r.data.classes)
  })

  const upcoming = (classesData || []).filter((c: any) => isFuture(new Date(c.scheduledAt)) && c.status !== 'cancelled')
  const recordings = (classesData || []).filter((c: any) => c.recordingUrl)

  const setReminder = (cls: any) => toast.success(`Reminder set for "${cls.title}"`)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Live Classes</h1>
        <p className="text-gray-400 mt-1">Join live sessions and access recordings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{upcoming.length}</p>
          <p className="text-xs text-gray-400 mt-1">Upcoming</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{recordings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Recordings</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{(classesData || []).filter((c:any) => c.status === 'ended').length}</p>
          <p className="text-xs text-gray-400 mt-1">Attended</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'recordings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${tab === t ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-gray-400 bg-white/5 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-white/5" />)}</div>
      ) : tab === 'upcoming' ? (
        upcoming.length === 0 ? (
          <div className="card text-center py-16">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No upcoming classes scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((cls: any) => (
              <div key={cls._id} className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-7 h-7 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{cls.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(cls.scheduledAt), 'dd MMM, hh:mm a')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.duration || 60} mins</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{cls.mentor?.name || 'Instructor'}</span>
                  </div>
                  <p className="text-xs text-yellow-400 mt-1">
                    {formatDistanceToNow(new Date(cls.scheduledAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setReminder(cls)} className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors" title="Set reminder">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button className="btn-primary text-xs py-2 px-4">Join</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        recordings.length === 0 ? (
          <div className="card text-center py-16">
            <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recordings available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordings.map((cls: any) => (
              <div key={cls._id} className="card flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-7 h-7 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{cls.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(cls.scheduledAt), 'dd MMM yyyy')} • {cls.duration || 60} mins</p>
                </div>
                <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-2 px-4">Watch</a>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
