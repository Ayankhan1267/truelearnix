'use client'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseAPI, certAPI, materialAPI } from '@/lib/api'
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle, Play, FileText,
  Award, Loader2, PlayCircle, ClipboardList, BookOpen, Clock,
  Calendar, BarChart2, Download, FileDown, Upload, X, Menu,
  ExternalLink, Eye, Link2, Video, File, Image as ImgIcon,
  AlertCircle, Star, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Tab = 'lessons' | 'sessions' | 'assignments' | 'notes'

const TYPE_ICON: Record<string, any> = { pdf: FileDown, video: Video, doc: FileText, link: Link2, image: ImgIcon }
const TYPE_COLOR: Record<string, string> = {
  pdf: 'text-red-400 bg-red-500/15 border-red-500/20',
  video: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
  doc: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/20',
  link: 'text-green-400 bg-green-500/15 border-green-500/20',
  image: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
}

export default function CoursePlayer({ params }: { params: { id: string } }) {
  const { id } = params
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [tab, setTab] = useState<Tab>('lessons')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['course-content', id],
    queryFn: () => courseAPI.getContent(id).then(r => r.data),
  })

  const { data: sessionsData } = useQuery({
    queryKey: ['student-course-sessions', id],
    queryFn: () => courseAPI.sessions(id).then(r => r.data.sessions),
    enabled: tab === 'sessions',
  })

  const { data: assignmentsData } = useQuery({
    queryKey: ['student-course-assignments', id],
    queryFn: () => courseAPI.courseAssignments(id).then(r => r.data.assignments),
    enabled: tab === 'assignments',
  })

  const { data: notesData } = useQuery({
    queryKey: ['course-materials', id],
    queryFn: () => materialAPI.courseMaterials(id).then(r => r.data.data),
    enabled: tab === 'notes',
  })

  const markMutation = useMutation({
    mutationFn: (lessonId: string) => courseAPI.markLesson(id, lessonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-content', id] }),
  })

  const course = data?.course
  const lessons: any[] = course?.lessons || []
  const activeLesson = lessons[activeLessonIdx]
  const completedIds: string[] = data?.completedLessons || []
  const progressPercent = lessons.length > 0 ? Math.round((completedIds.length / lessons.length) * 100) : 0
  const allDone = lessons.length > 0 && completedIds.length >= lessons.length

  const getRecordingUrl = (url: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${base}${url}`
  }

  const claimCertificate = async () => {
    try {
      setClaiming(true)
      await certAPI.claim(id)
      setClaimed(true)
      toast.success('Certificate claimed!')
    } catch { toast.error('Failed to claim certificate') }
    finally { setClaiming(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
    </div>
  )

  if (!course) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Course not found or you are not enrolled.</p>
      <Link href="/student/courses" className="btn-primary mt-4 inline-block">Back to Courses</Link>
    </div>
  )

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'lessons', label: 'Lessons', icon: BookOpen, count: lessons.length },
    { key: 'notes', label: 'Notes', icon: FileDown, count: notesData?.length },
    { key: 'sessions', label: 'Recordings', icon: PlayCircle, count: sessionsData?.length },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList, count: assignmentsData?.length },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)]">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 pb-0 border-b border-white/5 bg-dark-900 flex-shrink-0">
        <Link href="/student/courses"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mr-2 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        {/* Mobile sidebar toggle */}
        {tab === 'lessons' && (
          <button onClick={() => setSidebarOpen(o => !o)}
            className="sm:hidden flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mr-1 p-1.5 rounded-lg hover:bg-white/5">
            <Menu className="w-4 h-4" />
          </button>
        )}

        <p className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-xs mr-2 hidden sm:block">{course.title}</p>

        {/* Tab bar - scrollable on mobile */}
        <div className="flex gap-0 overflow-x-auto scrollbar-hide flex-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                tab === t.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              {t.count != null && t.count > 0 && (
                <span className={`text-[10px] px-1 rounded-full ${tab === t.key ? 'bg-primary-500/20 text-primary-400' : 'bg-white/10 text-gray-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:block">{progressPercent}%</span>
          <div className="w-16 sm:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ── TAB: Lessons ── */}
      {tab === 'lessons' && (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="sm:hidden absolute inset-0 z-20 flex">
              <div className="w-72 bg-dark-900 border-r border-white/5 flex flex-col overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">Course Content</p>
                  <button onClick={() => setSidebarOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <LessonList
                  lessons={lessons}
                  activeLessonIdx={activeLessonIdx}
                  completedIds={completedIds}
                  onSelect={idx => { setActiveLessonIdx(idx); setSidebarOpen(false) }}
                />
              </div>
              <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden sm:flex w-64 bg-dark-800 border-r border-white/5 flex-col overflow-hidden flex-shrink-0">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-xs text-gray-500 font-medium">{completedIds.length}/{lessons.length} lessons done</p>
            </div>
            <LessonList
              lessons={lessons}
              activeLessonIdx={activeLessonIdx}
              completedIds={completedIds}
              onSelect={setActiveLessonIdx}
            />
          </aside>

          {/* Main Video Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeLesson ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  {activeLesson.videoUrl ? (
                    <div className="bg-black aspect-video w-full max-h-[45vh] sm:max-h-[55vh]">
                      {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full" allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      ) : (
                        <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                      )}
                    </div>
                  ) : (
                    <div className="p-8 flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900 min-h-36">
                      <div className="text-center text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-sm">Reading lesson — no video</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">{activeLesson.title}</h1>
                      {activeLesson.duration > 0 && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500 bg-dark-700 px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />{activeLesson.duration} min
                        </span>
                      )}
                    </div>
                    {activeLesson.content && (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {activeLesson.content}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="p-3 sm:p-4 border-t border-white/5 bg-dark-800 flex items-center justify-between gap-3">
                  <button onClick={() => setActiveLessonIdx(i => Math.max(0, i - 1))} disabled={activeLessonIdx === 0}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1.5 rounded-lg hover:bg-white/5">
                    <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {!completedIds.includes(activeLesson._id) ? (
                      <button onClick={() => markMutation.mutate(activeLesson._id)} disabled={markMutation.isPending}
                        className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2">
                        {markMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Mark Complete</span>
                        <span className="sm:hidden">Done</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                    {allDone && (
                      <button onClick={claimCertificate} disabled={claiming || claimed}
                        className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-dark-900 font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition-colors">
                        {claiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{claimed ? 'Claimed!' : 'Get Certificate'}</span>
                        <span className="sm:hidden">{claimed ? '✓' : 'Cert'}</span>
                      </button>
                    )}
                  </div>

                  <button onClick={() => setActiveLessonIdx(i => Math.min(lessons.length - 1, i + 1))} disabled={activeLessonIdx === lessons.length - 1}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1.5 rounded-lg hover:bg-white/5">
                    <span className="hidden sm:inline">Next</span><ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>Select a lesson to start learning</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Notes (PDF Materials) ── */}
      {tab === 'notes' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Batch Notes & Resources</h2>
              <span className="text-xs text-gray-500 bg-dark-800 px-3 py-1.5 rounded-xl border border-white/5">
                {notesData?.length || 0} files
              </span>
            </div>

            {!notesData ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
            ) : notesData.length === 0 ? (
              <div className="text-center py-20 bg-dark-800 rounded-2xl border border-white/5">
                <FileDown className="w-14 h-14 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-300 font-semibold">No notes uploaded yet</p>
                <p className="text-gray-500 text-sm mt-1">Your mentor will upload batch notes and study materials here.</p>
              </div>
            ) : (
              <>
                {/* PDF notes first */}
                {notesData.filter((m: any) => m.type === 'pdf').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-red-400" /> PDFs & Notes
                    </h3>
                    {notesData.filter((m: any) => m.type === 'pdf').map((m: any) => (
                      <NoteCard key={m._id} material={m} />
                    ))}
                  </div>
                )}
                {/* Other resources */}
                {notesData.filter((m: any) => m.type !== 'pdf').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <File className="w-4 h-4 text-gray-400" /> Other Resources
                    </h3>
                    {notesData.filter((m: any) => m.type !== 'pdf').map((m: any) => (
                      <NoteCard key={m._id} material={m} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Sessions / Recordings ── */}
      {tab === 'sessions' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Class Recordings</h2>
              {lessons.length > 0 && (
                <span className="text-xs text-gray-500 bg-dark-800 px-3 py-1.5 rounded-xl border border-white/5">
                  {lessons.length} curriculum topics
                </span>
              )}
            </div>

            {/* Curriculum quick reference */}
            {lessons.length > 0 && (
              <CurriculumAccordion lessons={lessons} completedIds={completedIds} />
            )}

            {!sessionsData ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
            ) : sessionsData.length === 0 ? (
              <div className="text-center py-16 bg-dark-800 rounded-2xl border border-white/5">
                <PlayCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-300 font-semibold">No recordings yet</p>
                <p className="text-gray-500 text-sm mt-1">Completed live classes will appear here automatically.</p>
              </div>
            ) : sessionsData.map((session: any, idx: number) => (
              <SessionCard
                key={session._id}
                session={session}
                idx={idx}
                lessons={lessons}
                getRecordingUrl={getRecordingUrl}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Assignments ── */}
      {tab === 'assignments' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Assignments</h2>
              <span className="text-xs text-gray-500 bg-dark-800 px-3 py-1.5 rounded-xl border border-white/5">
                {assignmentsData?.length || 0} total
              </span>
            </div>

            {!assignmentsData ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-400" /></div>
            ) : assignmentsData.length === 0 ? (
              <div className="text-center py-16 bg-dark-800 rounded-2xl border border-white/5">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-300 font-semibold">No assignments yet</p>
                <p className="text-gray-500 text-sm mt-1">Your mentor will publish assignments here.</p>
              </div>
            ) : assignmentsData.map((a: any) => (
              <AssignmentCard key={a._id} assignment={a} courseId={id} onSubmit={() => qc.invalidateQueries({ queryKey: ['student-course-assignments', id] })} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Lesson List (sidebar) ─────────────────────────────────────────────────────
function LessonList({ lessons, activeLessonIdx, completedIds, onSelect }: {
  lessons: any[]; activeLessonIdx: number; completedIds: string[]; onSelect: (i: number) => void
}) {
  if (lessons.length === 0) {
    return <div className="text-center py-8 text-gray-500 text-xs px-3">No lessons added yet.</div>
  }
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {lessons.map((lesson: any, idx: number) => {
        const done = completedIds.includes(lesson._id)
        const active = idx === activeLessonIdx
        return (
          <button key={lesson._id} onClick={() => onSelect(idx)}
            className={`w-full flex items-start gap-2.5 p-3 rounded-xl text-left transition-colors ${
              active ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5 border border-transparent'
            }`}>
            <div className="mt-0.5 flex-shrink-0">
              {done
                ? <CheckCircle className="w-4 h-4 text-green-400" />
                : active
                  ? <Play className="w-4 h-4 text-primary-400" />
                  : <Circle className="w-4 h-4 text-gray-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium leading-snug ${active ? 'text-primary-300' : done ? 'text-gray-300' : 'text-gray-400'}`}>
                {idx + 1}. {lesson.title}
              </p>
              {lesson.duration > 0 && (
                <p className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{lesson.duration} min
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ material: m }: { material: any }) {
  const Icon = TYPE_ICON[m.type] || File
  const colorClass = TYPE_COLOR[m.type] || 'text-gray-400 bg-gray-500/15 border-gray-500/20'

  const handleDownload = async () => {
    try { await materialAPI.incrementDownload(m._id) } catch {}
    window.open(m.url, '_blank')
  }

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/5 p-4 flex items-start gap-4 hover:border-white/10 transition-colors group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm leading-snug">{m.title}</h4>
        {m.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{m.description}</p>}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-gray-600 uppercase font-medium">{m.type}</span>
          {m.downloadCount > 0 && (
            <span className="text-xs text-gray-600 flex items-center gap-0.5">
              <Download className="w-3 h-3" />{m.downloadCount}
            </span>
          )}
          {m.tags?.map((tag: string) => (
            <span key={tag} className="text-xs bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>
      <button onClick={handleDownload}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${colorClass} hover:opacity-80`}>
        {m.type === 'link' ? <><ExternalLink className="w-3.5 h-3.5" /> Open</> : <><Download className="w-3.5 h-3.5" /> Download</>}
      </button>
    </div>
  )
}

// ── Curriculum Accordion ──────────────────────────────────────────────────────
function CurriculumAccordion({ lessons, completedIds }: { lessons: any[]; completedIds: string[] }) {
  const [open, setOpen] = useState(false)
  const done = completedIds.length
  return (
    <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Course Curriculum</span>
          <span className="text-xs text-gray-500">{done}/{lessons.length} completed</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {lessons.map((lesson: any, idx: number) => {
            const isDone = completedIds.includes(lesson._id)
            return (
              <div key={lesson._id} className="flex items-center gap-3 px-4 py-2.5">
                {isDone
                  ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  : <Circle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                }
                <span className={`text-xs ${isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                  {idx + 1}. {lesson.title}
                  {lesson.duration > 0 && <span className="text-gray-600 ml-1.5">({lesson.duration}m)</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({ session, idx, lessons, getRecordingUrl }: {
  session: any; idx: number; lessons: any[]; getRecordingUrl: (url: string) => string
}) {
  // Match session to curriculum topic by position or title keyword
  const matchedLesson = lessons[idx] || null

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
      {/* Session header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {session.batch && (
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/15">
                  Batch {session.batch.batchNumber}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-lg ${session.wasPresent ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                {session.wasPresent ? 'Attended' : 'Missed'}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{session.title}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
              {session.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {session.duration && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.duration} min</span>
              )}
            </div>
          </div>
          {session.recordingUrl && (
            <a href={getRecordingUrl(session.recordingUrl)} target="_blank" rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors">
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Watch</span>
            </a>
          )}
        </div>

        {/* Curriculum match */}
        {matchedLesson && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-500/8 border border-indigo-500/15 rounded-xl w-fit">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-indigo-300">
              Covers: <span className="font-semibold">Lesson {idx + 1} — {matchedLesson.title}</span>
            </span>
          </div>
        )}
      </div>

      {/* Summary / Notes */}
      {(session.summary || session.mentorNotes) && (
        <div className="border-t border-white/5 px-4 sm:px-5 py-3 space-y-3">
          {session.summary && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" /> Session Summary
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{session.summary}</p>
            </div>
          )}
          {session.mentorNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Mentor Notes
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{session.mentorNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Assignment Card ───────────────────────────────────────────────────────────
function AssignmentCard({ assignment: a, courseId, onSubmit }: { assignment: any; courseId: string; onSubmit: () => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isOverdue = a.dueDate && new Date(a.dueDate) < new Date()
  const hasSubmission = !!a.mySubmission

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) return toast.error('File must be under 20MB')
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/zip', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) return toast.error('Only PDF, Word, image or ZIP files allowed')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await courseAPI.submitAssignment(a._id, fd)
      toast.success('Assignment submitted!')
      onSubmit()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={`bg-dark-800 rounded-2xl border overflow-hidden transition-all ${
      isOverdue && !hasSubmission ? 'border-red-500/20' : 'border-white/5 hover:border-white/10'
    }`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{a.title}</h3>
            {a.description && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{a.description}</p>}

            <div className="flex items-center gap-3 mt-2.5 text-xs flex-wrap">
              {a.dueDate && (
                <span className={`flex items-center gap-1 font-medium px-2 py-1 rounded-lg ${
                  isOverdue ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-500">
                <Star className="w-3 h-3" /> Max: {a.maxScore} pts
              </span>
            </div>
          </div>

          {/* Submission status badge */}
          <div className="flex-shrink-0">
            {hasSubmission ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-xl text-xs font-semibold border border-green-500/15">
                  <CheckCircle className="w-3.5 h-3.5" /> Submitted
                </span>
                {a.mySubmission.score != null && (
                  <p className="text-xs text-gray-400 mt-1 text-right">{a.mySubmission.score}/{a.maxScore} pts</p>
                )}
              </div>
            ) : (
              <span className={`text-xs px-2.5 py-1.5 rounded-xl font-medium ${
                isOverdue ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-dark-700 text-gray-400 border border-white/5'
              }`}>
                {isOverdue ? 'Overdue' : 'Pending'}
              </span>
            )}
          </div>
        </div>

        {/* Submission section */}
        <div className="mt-4 pt-4 border-t border-white/5">
          {hasSubmission ? (
            <div className="space-y-3">
              {/* Submitted file info */}
              {a.mySubmission.fileName && (
                <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl border border-white/5">
                  <FileDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate font-medium">{a.mySubmission.fileName}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Submitted {new Date(a.mySubmission.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {a.mySubmission.fileUrl && (
                    <a href={a.mySubmission.fileUrl} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                  )}
                </div>
              )}

              {/* Mentor feedback */}
              {a.mySubmission.feedback && (
                <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl p-3">
                  <p className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Mentor Feedback
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{a.mySubmission.feedback}</p>
                  {a.mySubmission.status === 'reviewed' && a.mySubmission.score != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-400">{a.mySubmission.score} / {a.maxScore}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Re-submit button */}
              {!isOverdue && (
                <div>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Re-submit Assignment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || isOverdue}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isOverdue
                    ? 'bg-dark-700 text-gray-600 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/20'
                }`}>
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  : isOverdue
                    ? 'Submission Closed'
                    : <><Upload className="w-4 h-4" /> Submit Assignment (PDF / Word / ZIP)</>
                }
              </button>
              {!isOverdue && (
                <p className="text-xs text-gray-600 text-center mt-2">Max 20MB · PDF, Word, ZIP or Image</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
