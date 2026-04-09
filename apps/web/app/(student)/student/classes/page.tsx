'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { classAPI } from '@/lib/api'
import { Video, Clock, Bell, Play, Calendar, User, Zap, CheckCircle2, BookOpen } from 'lucide-react'
import { format, formatDistanceToNow, isFuture, isPast, isWithinInterval, addMinutes } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Tab = 'upcoming' | 'live' | 'recordings'

export default function LiveClassesPage() {
  const [tab, setTab] = useState<Tab>('upcoming')

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes-all'],
    queryFn: () => classAPI.upcoming().then(r => r.data.classes),
    refetchInterval: 60000,
  })

  const all: any[] = classesData || []
  const liveNow = all.filter((c: any) => c.status === 'live')
  const upcoming = all.filter((c: any) => c.status === 'scheduled' && isFuture(new Date(c.scheduledAt)))
  const recordings = all.filter((c: any) => c.recordingUrl)
  const attended = all.filter((c: any) => c.status === 'ended')

  const isJoinable = (cls: any) =>
    cls.status === 'live' ||
    (cls.status === 'scheduled' && isWithinInterval(new Date(), {
      start: addMinutes(new Date(cls.scheduledAt), -10),
      end: addMinutes(new Date(cls.scheduledAt), cls.duration + 10),
    }))

  const activeTab: Tab = liveNow.length > 0 && tab === 'upcoming' ? tab : tab

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Live Classes</h1>
        <p className="text-gray-400 mt-1 text-sm">Join live sessions and access recordings</p>
      </div>

      {/* Live NOW banner */}
      {liveNow.length > 0 && (
        <div className="bg-gradient-to-r from-red-600/20 to-rose-600/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /> LIVE NOW
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{liveNow[0].title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{liveNow[0].mentor?.name} · {liveNow[0].duration} mins</p>
            </div>
          </div>
          <Link href={`/student/classes/${liveNow[0]._id}`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
            <Zap className="w-4 h-4" /> Join Now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Upcoming', value: upcoming.length, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Live Now',  value: liveNow.length,  color: 'text-red-400',    bg: 'bg-red-500/10' },
          { label: 'Attended',  value: attended.length, color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
          { label: 'Recordings',value: recordings.length,color:'text-blue-400',   bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/5 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-white/5 w-fit">
        {([
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'live', label: `Live${liveNow.length ? ` (${liveNow.length})` : ''}` },
          { key: 'recordings', label: 'Recordings' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : tab === 'live' ? (
        liveNow.length === 0 ? (
          <div className="card text-center py-16">
            <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">No live classes right now</p>
            <p className="text-gray-400 text-sm">Check upcoming tab for scheduled sessions</p>
          </div>
        ) : (
          <ClassList classes={liveNow} isJoinable={isJoinable} isLive />
        )
      ) : tab === 'upcoming' ? (
        upcoming.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">No upcoming classes</p>
            <p className="text-gray-400 text-sm">Your instructor hasn't scheduled any classes yet</p>
          </div>
        ) : (
          <ClassList classes={upcoming} isJoinable={isJoinable} />
        )
      ) : (
        recordings.length === 0 ? (
          <div className="card text-center py-16">
            <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recordings available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((cls: any) => (
              <div key={cls._id} className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{cls.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{format(new Date(cls.scheduledAt), 'dd MMM yyyy')} · {cls.duration} mins</p>
                </div>
                <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                  <Play className="w-3.5 h-3.5" /> Watch
                </a>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function ClassList({ classes, isJoinable, isLive = false }: { classes: any[]; isJoinable: (c: any) => boolean; isLive?: boolean }) {
  return (
    <div className="space-y-3">
      {classes.map((cls: any) => {
        const canJoin = isJoinable(cls)
        return (
          <div key={cls._id}
            className={`card flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${isLive ? 'border-red-500/20 bg-red-500/5' : ''}`}>
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-red-500/20' : 'bg-violet-500/20'}`}>
              <Video className={`w-6 h-6 ${isLive ? 'text-red-400' : 'text-violet-400'}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-sm">{cls.title}</h3>
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" /> LIVE
                  </span>
                )}
                {canJoin && !isLive && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Open to join</span>
                )}
              </div>
              {cls.course?.title && (
                <p className="text-violet-300/70 text-xs mt-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {cls.course.title}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(cls.scheduledAt), 'dd MMM, hh:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {cls.duration} mins
                </span>
                {cls.mentor?.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {cls.mentor.name}
                  </span>
                )}
              </div>
              {!isLive && !canJoin && (
                <p className="text-yellow-400/80 text-xs mt-1.5">
                  {formatDistanceToNow(new Date(cls.scheduledAt), { addSuffix: true })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {canJoin ? (
                <Link href={`/student/classes/${cls._id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isLive
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  }`}>
                  <Zap className="w-3.5 h-3.5" />
                  {isLive ? 'Join Live' : 'Join'}
                </Link>
              ) : (
                <button
                  onClick={() => toast.success(`Reminder set for "${cls.title}"`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 bg-slate-700 hover:bg-slate-600 transition-colors">
                  <Bell className="w-3.5 h-3.5" /> Remind
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
