'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { classAPI } from '@/lib/api'
import {
  Video, VideoOff, Mic, MicOff, Phone, Users, Clock,
  CheckCircle2, AlertCircle, Loader2, BookOpen, Calendar,
  ArrowLeft, Wifi, WifiOff, Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

type Phase = 'loading' | 'prejoin' | 'connecting' | 'live' | 'ended' | 'error'

export default function JoinClassPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('loading')
  const [classInfo, setClassInfo] = useState<any>(null)
  const [zoomData, setZoomData] = useState<any>(null)
  const [error, setError] = useState('')

  // Attendance state
  const [watchSeconds, setWatchSeconds] = useState(0)
  const [isPresent, setIsPresent] = useState(false)
  const [justMarked, setJustMarked] = useState(false)
  const [attendancePercent, setAttendancePercent] = useState(0)

  const zoomRef = useRef<HTMLDivElement>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const zoomClientRef = useRef<any>(null)
  const sessionStartRef = useRef<number>(Date.now())

  // Load class detail + zoom signature
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

  // Start attendance ping every 30s when live
  const startAttendance = useCallback(() => {
    sessionStartRef.current = Date.now()

    // Local timer — updates every second for UI
    watchTimerRef.current = setInterval(() => {
      setWatchSeconds(s => s + 1)
    }, 1000)

    // Ping server every 30s
    pingIntervalRef.current = setInterval(async () => {
      try {
        const res = await classAPI.attendancePing(id)
        const d = res.data
        setAttendancePercent(d.percent || 0)
        setIsPresent(d.isPresent)
        if (d.justMarked) {
          setJustMarked(true)
          toast.success('Attendance marked! ✓', { duration: 4000 })
        }
      } catch { /* silent */ }
    }, 30000)
  }, [id])

  const stopAttendance = useCallback(() => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    if (watchTimerRef.current) clearInterval(watchTimerRef.current)
  }, [])

  // Join Zoom meeting
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
        leaveUrl: `/student/classes`,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        success: () => {
          ZoomMtg.join({
            signature: zoomData.signature,
            sdkKey: zoomData.sdkKey,
            meetingNumber: zoomData.meetingNumber,
            passWord: zoomData.password,
            userName: zoomData.userName,
            userEmail: zoomData.userEmail,
            success: () => {
              setPhase('live')
              startAttendance()
              // Move zoom UI inside our container
              const zoomContainer = document.getElementById('zmmtg-root')
              if (zoomContainer && zoomRef.current) {
                zoomRef.current.appendChild(zoomContainer)
                zoomContainer.style.display = 'block'
                zoomContainer.style.position = 'relative'
                zoomContainer.style.width = '100%'
                zoomContainer.style.height = '100%'
              }
            },
            error: (e: any) => {
              setError(`Failed to join: ${e.reason || 'Unknown error'}`)
              setPhase('error')
            }
          })
        },
        error: (e: any) => {
          setError(`SDK init failed: ${e.reason || 'Unknown error'}`)
          setPhase('error')
        }
      })
    } catch (e: any) {
      setError('Failed to load Zoom SDK')
      setPhase('error')
    }
  }, [zoomData, startAttendance])

  const leaveClass = useCallback(async () => {
    stopAttendance()
    if (zoomClientRef.current) {
      try { zoomClientRef.current.endMeeting({}) } catch { /* silent */ }
    }
    setPhase('ended')
    // Final ping
    try { await classAPI.attendancePing(id) } catch { /* silent */ }
  }, [stopAttendance, id])

  useEffect(() => {
    return () => stopAttendance()
  }, [stopAttendance])

  const thresholdSeconds = classInfo ? classInfo.duration * 60 * 0.75 : 0
  const progressPercent = classInfo
    ? Math.min(100, Math.round((watchSeconds / (classInfo.duration * 60)) * 100))
    : 0
  const attendanceProgressPercent = classInfo
    ? Math.min(100, Math.round((watchSeconds / thresholdSeconds) * 100))
    : 0
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading class...</p>
        </div>
      </div>
    )
  }

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Unable to join</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={() => router.push('/student/classes')}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Back to Classes
          </button>
        </div>
      </div>
    )
  }

  // ── CLASS ENDED ────────────────────────────────────────────────────────────
  if (phase === 'ended') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isPresent ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            {isPresent
              ? <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              : <Clock className="w-10 h-10 text-amber-400" />}
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Class Ended</h2>
          <p className="text-gray-400 mb-6">You attended for {formatTime(watchSeconds)}</p>

          {/* Attendance card */}
          <div className={`rounded-2xl p-5 mb-6 border ${isPresent ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Attendance Status</span>
              <span className={`text-sm font-bold ${isPresent ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPresent ? 'PRESENT ✓' : 'ABSENT'}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
              <div className={`h-2.5 rounded-full transition-all ${isPresent ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, attendanceProgressPercent)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Watched: {formatTime(watchSeconds)}</span>
              <span>Required: {formatTime(Math.round(thresholdSeconds))} (75%)</span>
            </div>
            {!isPresent && (
              <p className="text-amber-400/80 text-xs mt-3">
                You needed {formatTime(Math.max(0, Math.round(thresholdSeconds - watchSeconds)))} more to be marked present.
              </p>
            )}
          </div>

          <button onClick={() => router.push('/student/classes')}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold transition-colors">
            Back to Classes
          </button>
        </div>
      </div>
    )
  }

  // ── PRE-JOIN ───────────────────────────────────────────────────────────────
  if (phase === 'prejoin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Back */}
        <div className="p-4 border-b border-white/5">
          <button onClick={() => router.push('/student/classes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Classes
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Class Info Card */}
            <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 rounded-3xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-7 h-7 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-white font-bold text-xl leading-tight">{classInfo?.title}</h1>
                    {classInfo?.status === 'live' && (
                      <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /> LIVE
                      </span>
                    )}
                  </div>
                  {classInfo?.course?.title && (
                    <p className="text-violet-300/80 text-sm mt-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {classInfo.course.title}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {classInfo?.scheduledAt ? format(new Date(classInfo.scheduledAt), 'dd MMM, hh:mm a') : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {classInfo?.duration} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentor */}
              {classInfo?.mentor && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/30 overflow-hidden flex-shrink-0">
                    {classInfo.mentor.avatar
                      ? <img src={classInfo.mentor.avatar} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-violet-300 text-sm font-bold">
                          {classInfo.mentor.name?.[0]}
                        </div>}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{classInfo.mentor.name}</p>
                    <p className="text-gray-500 text-xs">Instructor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Info */}
            <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-white text-sm font-medium">Attendance Policy</span>
              </div>
              <p className="text-gray-400 text-sm">
                Attend at least <span className="text-violet-400 font-semibold">75%</span> of this{' '}
                <span className="text-white font-semibold">{classInfo?.duration}-minute</span> class
                ({formatTime(Math.round(thresholdSeconds))}) to be marked <span className="text-emerald-400 font-semibold">Present</span>.
              </p>
              <p className="text-gray-500 text-xs mt-1.5">
                Your attendance is tracked automatically — even if you temporarily disconnect and rejoin.
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={joinMeeting}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-violet-500/30 active:scale-[0.98] flex items-center justify-center gap-3">
              <Video className="w-6 h-6" />
              Join Class Now
            </button>
            <p className="text-center text-gray-500 text-xs mt-3">
              Powered by Zoom · Your camera and mic will be requested
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── CONNECTING ─────────────────────────────────────────────────────────────
  if (phase === 'connecting') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="w-16 h-16 border-2 border-violet-500/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <Video className="absolute inset-0 m-auto w-6 h-6 text-violet-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Joining class...</h2>
          <p className="text-gray-400 text-sm">Setting up your video session</p>
        </div>
      </div>
    )
  }

  // ── LIVE ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-slate-900/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            LIVE
          </div>
          <h2 className="text-white font-semibold text-sm truncate">{classInfo?.title}</h2>
        </div>

        {/* Attendance tracker */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex flex-col" style={{ minWidth: 120 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-[10px]">Attendance</span>
                <span className={`text-[10px] font-bold ${isPresent ? 'text-emerald-400' : 'text-gray-300'}`}>
                  {isPresent ? 'Present ✓' : `${Math.min(100, attendanceProgressPercent)}%`}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 ${isPresent ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  style={{ width: `${Math.min(100, attendanceProgressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <button onClick={leaveClass}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0">
            <Phone className="w-3.5 h-3.5 rotate-[135deg]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Zoom Meeting Container */}
      <div className="flex-1 relative bg-slate-950">
        <div ref={zoomRef} id="zoom-meeting-container" className="absolute inset-0 w-full h-full" />

        {/* Mobile attendance pill */}
        <div className="sm:hidden absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur rounded-xl px-3 py-2 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-20 bg-slate-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-violet-500'}`}
                style={{ width: `${Math.min(100, attendanceProgressPercent)}%` }} />
            </div>
            <span className={`text-[10px] font-bold ${isPresent ? 'text-emerald-400' : 'text-gray-300'}`}>
              {isPresent ? '✓ Present' : `${Math.min(100, attendanceProgressPercent)}%`}
            </span>
          </div>
        </div>

        {/* Marked present toast-like banner */}
        {justMarked && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-500/90 backdrop-blur text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xl">
            <CheckCircle2 className="w-4 h-4" /> Attendance Marked — You're Present!
          </div>
        )}
      </div>
    </div>
  )
}
