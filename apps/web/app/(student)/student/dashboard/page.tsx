'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI, classAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  BookOpen, Video, Award, Timer, Play, ChevronRight,
  Flame, Zap, Pause, RotateCcw, CheckCircle,
  TrendingUp, Lock, ArrowRight, Sparkles, Target,
  Megaphone, Heart, Bell, ArrowUpCircle, Coffee,
  Star, BarChart2, Users, Clock
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const FOCUS_MINS = 25
const BREAK_MINS = 5

// ── Focus Timer ──────────────────────────────────────────────────────────────
function FocusTimer() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [seconds, setSeconds] = useState(FOCUS_MINS * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSessions(Number(localStorage.getItem('focusSessions') || '0'))
  }, [])

  const totalSecs = mode === 'focus' ? FOCUS_MINS * 60 : BREAK_MINS * 60
  const pct = ((totalSecs - seconds) / totalSecs) * 100
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const circumference = 2 * Math.PI * 54

  const reset = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setSeconds(mode === 'focus' ? FOCUS_MINS * 60 : BREAK_MINS * 60)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (mode === 'focus') {
              setSessions(prev => { const next = prev + 1; localStorage.setItem('focusSessions', String(next)); return next })
              setMode('break')
              return BREAK_MINS * 60
            } else {
              setMode('focus')
              return FOCUS_MINS * 60
            }
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(139,92,246,0.15) 100%)',
      border: '1px solid rgba(99,102,241,0.25)'
    }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Focus Timer</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${mode === 'focus' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-500/20 text-green-300'}`}>
            {mode === 'focus' ? '🎯 Focus' : '☕ Break'}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Ring */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={mode === 'focus' ? '#818cf8' : '#34d399'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pct / 100) * circumference}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white tabular-nums">{mins}:{secs}</span>
              <span className="text-[10px] text-gray-400">{mode === 'focus' ? 'focus' : 'break'}</span>
            </div>
          </div>

          {/* Controls + Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={reset} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setRunning(r => !r)}
                className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-sm transition-all ${running ? 'bg-white/10 text-white' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'}`}>
                {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4 ml-0.5" /> Start</>}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/5 p-2.5 text-center">
                <p className="text-lg font-black text-orange-400">{sessions}</p>
                <p className="text-[10px] text-gray-500">sessions</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 text-center">
                <p className="text-lg font-black text-indigo-400">{sessions * FOCUS_MINS}m</p>
                <p className="text-[10px] text-gray-500">focused</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function LearnerDashboard() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [focusSessions, setFocusSessions] = useState(0)

  useEffect(() => {
    setFocusSessions(Number(localStorage.getItem('focusSessions') || '0'))
  }, [])

  const { data: enrollments } = useQuery({
    queryKey: ['enrolled'],
    queryFn: () => userAPI.enrolledCourses().then(r => r.data.enrollments)
  })
  const { data: classesData } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: () => classAPI.upcoming().then(r => r.data.classes)
  })
  const { data: availableData } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => userAPI.availableCourses().then(r => r.data)
  })
  const { data: annData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => userAPI.announcements().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => userAPI.favorites().then(r => r.data.favorites),
    staleTime: 5 * 60 * 1000,
  })

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => userAPI.enrollFree(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrolled'] })
      qc.invalidateQueries({ queryKey: ['available-courses'] })
    }
  })

  const completed = enrollments?.filter((e: any) => e.progressPercent === 100)?.length || 0
  const inProgress = enrollments?.filter((e: any) => e.progressPercent > 0 && e.progressPercent < 100) || []
  const tier = (user as any)?.packageTier || 'free'
  const isPaid = tier !== 'free'
  const available = availableData?.courses || []
  const announcements = annData?.announcements || []
  const favorites = favData || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const tierConfig: Record<string, { label: string; color: string; bg: string }> = {
    free:    { label: 'Free',    color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/20' },
    starter: { label: 'Starter', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    pro:     { label: 'Pro',     color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    elite:   { label: 'Elite',   color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
    supreme: { label: 'Supreme', color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  }
  const tc = tierConfig[tier] || tierConfig.free

  return (
    <div className="space-y-5 max-w-6xl pb-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6" style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(139,92,246,0.12) 50%, rgba(217,70,239,0.06) 100%)',
        border: '1px solid rgba(99,102,241,0.2)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, #6366f1, transparent 50%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-300 text-sm font-medium">{greeting} ✨</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">{user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Ready to level up today?</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {((user as any)?.streak || 0) > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-orange-400 font-black text-lg leading-none">{(user as any).streak}</p>
                  <p className="text-[10px] text-orange-400/60">day streak</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-indigo-400 font-black text-lg leading-none">{(user as any)?.xpPoints || 0}</p>
                <p className="text-[10px] text-indigo-400/60">XP points</p>
              </div>
            </div>
            <div className={`px-3.5 py-2.5 rounded-xl border ${tc.bg}`}>
              <p className={`font-black text-sm capitalize ${tc.color}`}>{tc.label}</p>
              <p className="text-[10px] text-gray-500">plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: BookOpen,   label: 'Enrolled',    value: enrollments?.length || 0, color: 'text-blue-400',   bg: 'from-blue-600/15 to-blue-900/5 border-blue-500/15' },
          { icon: TrendingUp, label: 'In Progress',  value: inProgress.length,        color: 'text-violet-400', bg: 'from-violet-600/15 to-violet-900/5 border-violet-500/15' },
          { icon: Award,      label: 'Completed',    value: completed,                color: 'text-green-400',  bg: 'from-green-600/15 to-green-900/5 border-green-500/15' },
          { icon: Timer,      label: 'Focus Today',  value: `${focusSessions * FOCUS_MINS}m`, color: 'text-orange-400', bg: 'from-orange-600/15 to-orange-900/5 border-orange-500/15' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl bg-gradient-to-br ${s.bg} border p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}>
            <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-4">

          {/* Available to Enroll */}
          {isPaid && available.length > 0 && (
            <section className="rounded-2xl bg-dark-800 border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Available to Enroll</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${tc.bg} ${tc.color} border`}>{tier}</span>
                </div>
                <Link href="/student/courses" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {available.slice(0, 4).map((course: any) => (
                  <div key={course._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 border border-white/4 hover:border-indigo-500/20 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900 to-violet-900 flex-shrink-0 overflow-hidden">
                      {course.thumbnail
                        ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <BookOpen className="w-5 h-5 text-indigo-400 m-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{course.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{course.level || 'Beginner'}</p>
                    </div>
                    <button
                      onClick={() => enrollMutation.mutate(course._id)}
                      disabled={enrollMutation.isPending}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50">
                      Enroll
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Free user CTA */}
          {!isPaid && (
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.25)'
            }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Unlock All Courses</h3>
                  <p className="text-sm text-gray-400 mt-1">Get instant access to all courses, live classes, AI coach, certificates and more.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['All Courses', 'Live Classes', 'AI Coach', 'Certificates'].map(f => (
                      <span key={f} className="flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                  <Link href="/packages" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    View Plans <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Continue Learning */}
          <section className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                <h2 className="text-base font-bold text-white">Continue Learning</h2>
              </div>
              <Link href="/student/courses" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {inProgress.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">No courses in progress.</p>
                <Link href="/courses" className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300 font-medium">
                  Browse courses →
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {inProgress.slice(0, 3).map((e: any) => (
                  <Link key={e._id} href={`/student/courses/${e.course?._id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-700 border border-white/4 hover:border-indigo-500/20 hover:bg-dark-600 transition-all group">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-dark-600">
                      {e.course?.thumbnail
                        ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <BookOpen className="w-5 h-5 text-gray-600 m-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">{e.course?.title}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="text-indigo-400 font-semibold">{e.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${e.progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 group-hover:bg-indigo-500 flex items-center justify-center flex-shrink-0 transition-all">
                      <Play className="w-4 h-4 text-indigo-400 group-hover:text-white ml-0.5 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Live Classes */}
          <section className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <h2 className="text-base font-bold text-white">Upcoming Live Classes</h2>
              </div>
              <Link href="/student/classes" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {classesData && classesData.length > 0 ? (
              <div className="space-y-2.5">
                {classesData.slice(0, 3).map((cls: any) => (
                  <div key={cls._id} className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-700 border border-white/4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{cls.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {cls.scheduledAt ? format(new Date(cls.scheduledAt), 'dd MMM, h:mm a') : 'Scheduled'}
                      </p>
                    </div>
                    <Link href="/student/classes"
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-300 text-xs font-semibold hover:bg-green-500 hover:text-white transition-all">
                      Join
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Video className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming live classes.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-4">
          <FocusTimer />

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="rounded-2xl bg-dark-800 border border-indigo-500/15 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Announcements</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">{announcements.length}</span>
                </div>
                <Link href="/student/announcements" className="text-xs text-indigo-400 hover:text-indigo-300">All</Link>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 2).map((a: any) => (
                  <div key={a._id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-500/8 border border-indigo-500/10">
                    <Megaphone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                      {a.description && <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access */}
          <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Quick Access
            </h3>
            <div className="space-y-0.5">
              {[
                { href: '/student/courses',      icon: BookOpen,      label: 'My Courses',    color: 'text-indigo-400' },
                { href: '/student/favorites',    icon: Heart,         label: `Favorites${favorites.length > 0 ? ` (${favorites.length})` : ''}`, color: 'text-rose-400' },
                { href: '/student/certificates', icon: Award,         label: 'Certificates',  color: 'text-amber-400' },
                { href: '/student/ai-coach',     icon: Sparkles,      label: 'AI Coach',      color: 'text-violet-400' },
                { href: '/student/community',    icon: Users,         label: 'Community',     color: 'text-green-400' },
                { href: '/student/upgrade',      icon: ArrowUpCircle, label: 'Upgrade Plan',  color: 'text-cyan-400' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group">
                  <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex-1">{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Milestone */}
          {completed > 0 && (
            <div className="rounded-2xl p-5 text-center" style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
              border: '1px solid rgba(34,197,94,0.2)'
            }}>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-3xl font-black text-white">{completed}</p>
              <p className="text-sm text-green-300 font-semibold mt-0.5">Course{completed > 1 ? 's' : ''} Completed</p>
              <Link href="/student/certificates"
                className="inline-flex items-center gap-1 mt-3 text-xs text-green-400 hover:text-green-300 font-medium">
                View certificates <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
