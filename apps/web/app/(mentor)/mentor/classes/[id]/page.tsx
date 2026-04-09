'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { classAPI } from '@/lib/api'
import {
  Video, Phone, Users, Clock, CheckCircle2, Loader2,
  ArrowLeft, AlertCircle, Square, BarChart2, Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

type Phase = 'loading' | 'prejoin' | 'connecting' | 'live' | 'ended' | 'error'

export default function MentorJoinPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('loading')
  const [classInfo, setClassInfo] = useState<any>(null)
  const [zoomData, setZoomData] = useState<any>(null)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState<any[]>([])
  const [showAttendance, setShowAttendance] = useState(false)
  const [liveCount, setLiveCount] = useState(0)

  const zoomRef = useRef<HTMLDivElement>(null)
  const zoomClientRef = useRef<any>(null)
  const attendancePollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [detailRes, sigRes] = await Promise.all([
          classAPI.detail(id),
          classAPI.zoomSignature(id),
        ])
        setClassInfo(detailRes.data.liveClass)
        setZoomData(sigRes.data)
        setPhase('prejoin')
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load class')
        setPhase('error')
      }
    }
    load()
  }, [id])

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await classAPI.myAttendance(id) // reuse endpoint — backend returns all for mentor
      // Actually need a different endpoint for full list — we'll use the detail
      const detailRes = await classAPI.detail(id)
      const records = detailRes.data.liveClass?.attendanceRecords || []
      setAttendance(records)
      setLiveCount(records.filter((r: any) => r.lastPing && (Date.now() - new Date(r.lastPing).getTime()) < 60000).length)
    } catch { /* silent */ }
  }, [id])

  const startAttendancePoll = useCallback(() => {
    fetchAttendance()
    attendancePollRef.current = setInterval(fetchAttendance, 30000)
  }, [fetchAttendance])

  const stopPoll = useCallback(() => {
    if (attendancePollRef.current) clearInterval(attendancePollRef.current)
  }, [])

  useEffect(() => () => stopPoll(), [stopPoll])

  const joinMeeting = useCallback(async () => {
    if (!zoomData || !zoomRef.current) return
    setPhase('connecting')
    try {
      const { ZoomMtg } = await import('@zoom/meetingsdk')
      zoomClientRef.current = ZoomMtg

      ZoomMtg.setZoomJSLib('https://source.zoom.us/3.1.5/lib', '/av')
      ZoomMtg.preLoadWasm()
      ZoomMtg.prepareWebSDK()

      ZoomMtg.init({
        leaveUrl: `/mentor/classes`,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        success: () => {
          ZoomMtg.join({
            signature: zoomData.signature,
            sdkKey: zoomData.sdkKey,
            meetingNumber: zoomData.meetingNumber,
            passWord: zoomData.password,
            userName: `[Host] ${zoomData.userName}`,
            userEmail: zoomData.userEmail,
            success: () => {
              setPhase('live')
              startAttendancePoll()
              const zoomContainer = document.getElementById('zmmtg-root')
              if (zoomContainer && zoomRef.current) {
                zoomRef.current.appendChild(zoomContainer)
                zoomContainer.style.display = 'block'
                zoomContainer.style.position = 'relative'
                zoomContainer.style.width = '100%'
                zoomContainer.style.height = '100%'
              }
            },
            error: (e: any) => { setError(`Failed to join: ${e.reason}`); setPhase('error') }
          })
        },
        error: (e: any) => { setError(`SDK init failed: ${e.reason}`); setPhase('error') }
      })
    } catch { setError('Failed to load Zoom SDK'); setPhase('error') }
  }, [zoomData, startAttendancePoll])

  const endClass = useCallback(async () => {
    stopPoll()
    try { await classAPI.end(id); toast.success('Class ended') } catch { /* silent */ }
    if (zoomClientRef.current) {
      try { zoomClientRef.current.endMeeting({}) } catch { /* silent */ }
    }
    await fetchAttendance()
    setPhase('ended')
  }, [id, stopPoll, fetchAttendance])

  const thresholdSecs = classInfo ? classInfo.duration * 60 * 0.75 : 0
  const presentCount = attendance.filter((r: any) => r.isPresent).length

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading class...</p>
      </div>
    </div>
  )

  if (phase === 'error') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white font-bold text-xl mb-2">Error</h2>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button onClick={() => router.push('/mentor/classes')}
          className="bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
          Back to Classes
        </button>
      </div>
    </div>
  )

  // ── ENDED ────────────────────────────────────────────────────────────────
  if (phase === 'ended') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-2xl">Class Ended</h2>
          <p className="text-gray-400 mt-1">"{classInfo?.title}"</p>
        </div>

        {/* Attendance Summary */}
        <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-violet-400" />
            <h3 className="text-white font-semibold">Attendance Report</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{attendance.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Joined</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">{presentCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">Present (75%+)</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{attendance.length - presentCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">Absent</p>
            </div>
          </div>

          {/* Student list */}
          {attendance.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attendance.map((r: any, i: number) => {
                const watchMin = Math.round((r.totalWatchSeconds || 0) / 60)
                const pct = classInfo ? Math.min(100, Math.round((r.totalWatchSeconds / (classInfo.duration * 60)) * 100)) : 0
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-gray-300 font-bold">
                      {(r.user?.name || 'S')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{r.user?.name || 'Student'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-slate-700 rounded-full h-1">
                          <div className={`h-1 rounded-full ${r.isPresent ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-500 text-[10px] flex-shrink-0">{watchMin}m ({pct}%)</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.isPresent ? 'text-emerald-400 bg-emerald-500/15' : 'text-red-400 bg-red-500/15'}`}>
                      {r.isPresent ? 'P' : 'A'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button onClick={() => router.push('/mentor/classes')}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold transition-colors">
          Back to Classes
        </button>
      </div>
    </div>
  )

  // ── PRE-JOIN ──────────────────────────────────────────────────────────────
  if (phase === 'prejoin') return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <button onClick={() => router.push('/mentor/classes')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">
                <Award className="w-3 h-3" /> HOST
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[classInfo?.status]?.cls || ''}`}>
                {STATUS_BADGE[classInfo?.status]?.label || classInfo?.status}
              </span>
            </div>
            <h1 className="text-white font-bold text-2xl mb-1">{classInfo?.title}</h1>
            {classInfo?.course?.title && <p className="text-emerald-300/70 text-sm mb-3">{classInfo.course.title}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{classInfo?.duration} mins</span>
              {classInfo?.scheduledAt && (
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  {format(new Date(classInfo.scheduledAt), 'dd MMM, hh:mm a')}
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 mb-6">
            <p className="text-gray-400 text-sm">
              <span className="text-white font-medium">Attendance auto-tracking</span> is enabled.
              Students who attend <span className="text-violet-400 font-semibold">≥75%</span> of this session
              ({Math.round(classInfo?.duration * 0.75)} mins) will be automatically marked{' '}
              <span className="text-emerald-400 font-semibold">Present</span>.
            </p>
          </div>

          <button onClick={joinMeeting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-3">
            <Video className="w-6 h-6" />
            Start Class as Host
          </button>
        </div>
      </div>
    </div>
  )

  // ── CONNECTING ────────────────────────────────────────────────────────────
  if (phase === 'connecting') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 border-2 border-emerald-500/30 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Video className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Starting class...</h2>
        <p className="text-gray-400 text-sm">Launching host session</p>
      </div>
    </div>
  )

  // ── LIVE (HOST) ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-slate-900/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /> LIVE
          </div>
          <h2 className="text-white font-semibold text-sm truncate">{classInfo?.title}</h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live participant count */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 rounded-xl px-3 py-1.5 border border-white/5 text-xs text-gray-300">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>{liveCount} active</span>
            <span className="text-gray-600">·</span>
            <span className="text-emerald-400">{presentCount} present</span>
          </div>

          {/* Attendance toggle */}
          <button onClick={() => setShowAttendance(v => !v)}
            className="hidden sm:flex items-center gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-violet-500/20">
            <BarChart2 className="w-3.5 h-3.5" /> Attendance
          </button>

          <button onClick={endClass}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors">
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Class</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Zoom Meeting */}
        <div ref={zoomRef} id="zoom-meeting-container" className="flex-1 relative bg-slate-950" />

        {/* Attendance Sidebar */}
        {showAttendance && (
          <div className="hidden sm:flex w-72 bg-slate-900 border-l border-white/10 flex-col flex-shrink-0">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Live Attendance</h3>
              <p className="text-gray-400 text-xs mt-0.5">{presentCount} present · {attendance.length - presentCount} absent</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {attendance.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-8">No students yet</p>
              ) : attendance.map((r: any, i: number) => {
                const pct = classInfo ? Math.min(100, Math.round((r.totalWatchSeconds / (classInfo.duration * 60)) * 100)) : 0
                return (
                  <div key={i} className="bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-white text-xs font-medium truncate flex-1">{r.user?.name || 'Student'}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 ${r.isPresent ? 'text-emerald-400 bg-emerald-500/15' : 'text-amber-400 bg-amber-500/15'}`}>
                        {r.isPresent ? 'Present' : `${pct}%`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${r.isPresent ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-gray-600 text-[10px] mt-1">
                      {Math.round((r.totalWatchSeconds || 0) / 60)}m watched · need {Math.round(thresholdSecs / 60)}m
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-500/20 text-blue-400' },
  live:      { label: 'LIVE',      cls: 'bg-red-500/20 text-red-400' },
  ended:     { label: 'Ended',     cls: 'bg-gray-500/20 text-gray-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400' },
}
