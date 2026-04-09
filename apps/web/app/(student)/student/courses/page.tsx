'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import {
  BookOpen, Play, CheckCircle, Clock, ChevronRight,
  Sparkles, Lock, ArrowRight, Search
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'enrolled' | 'available'

export default function LearnerCoursesPage() {
  const [tab, setTab] = useState<Tab>('enrolled')
  const [filter, setFilter] = useState<'all' | 'inprogress' | 'completed'>('all')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: enrolledData, isLoading: loadingEnrolled } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: () => userAPI.enrolledCourses().then(r => r.data.enrollments)
  })

  const { data: availableData, isLoading: loadingAvail } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => userAPI.availableCourses().then(r => r.data)
  })

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => userAPI.enrollFree(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrolled-courses'] })
      qc.invalidateQueries({ queryKey: ['available-courses'] })
    }
  })

  const tier = availableData?.packageTier || 'free'
  const isPaid = tier !== 'free'
  const available: any[] = availableData?.courses || []

  const filtered = (enrolledData || []).filter((e: any) => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'inprogress' ? (e.progressPercent > 0 && e.progressPercent < 100) :
      e.progressPercent === 100
    const matchSearch = !search || e.course?.title?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const filteredAvail = available.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 text-sm mt-1">
            {enrolledData?.length || 0} enrolled
            {isPaid && available.length > 0 && ` · ${available.length} available to enroll`}
          </p>
        </div>
        <Link href="/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all border border-indigo-500/20 self-start sm:self-auto">
          <BookOpen className="w-4 h-4" /> Browse More
        </Link>
      </div>

      {/* Tab + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-dark-800 rounded-xl p-1 border border-white/5 self-start">
          <button onClick={() => setTab('enrolled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'enrolled' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white'
            }`}>
            Enrolled
            <span className="ml-1.5 text-xs opacity-60">{enrolledData?.length || 0}</span>
          </button>
          {isPaid && (
            <button onClick={() => setTab('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                tab === 'available' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white'
              }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Available
              {available.length > 0 && (
                <span className="ml-1 text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">{available.length}</span>
              )}
            </button>
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-dark-800 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      </div>

      {/* Enrolled Tab */}
      {tab === 'enrolled' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'inprogress', 'completed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  filter === f
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/25'
                    : 'text-gray-400 bg-dark-800 border-white/5 hover:text-white'
                }`}>
                {f === 'inprogress' ? 'In Progress' : f === 'all' ? 'All' : 'Completed'}
              </button>
            ))}
          </div>

          {loadingEnrolled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-dark-800 border border-white/5 h-64 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-16 px-4">
              <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium mb-1">No courses found</p>
              <p className="text-gray-600 text-sm mb-4">{search ? 'Try a different term.' : 'Enroll in a course to start.'}</p>
              <Link href="/courses" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-medium hover:bg-indigo-500/25">
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((e: any) => <EnrolledCard key={e._id} enrollment={e} />)}
            </div>
          )}
        </>
      )}

      {/* Available Tab */}
      {tab === 'available' && (
        <>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 self-start w-fit">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium capitalize">{tier} Plan</span>
            <span className="text-xs text-gray-500">— Enroll for free</span>
          </div>

          {loadingAvail ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-dark-800 border border-white/5 h-64 animate-pulse" />)}
            </div>
          ) : filteredAvail.length === 0 ? (
            <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-16">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-white font-medium">All caught up!</p>
              <p className="text-gray-500 text-sm mt-1">You've enrolled in all available courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvail.map((course: any) => (
                <AvailableCard
                  key={course._id}
                  course={course}
                  onEnroll={() => enrollMutation.mutateAsync(course._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Free upgrade CTA */}
      {!isPaid && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/25 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Unlock Package Courses</h3>
              <p className="text-sm text-gray-400 mt-1">Upgrade your plan to enroll in all courses included in your package at no extra cost.</p>
              <Link href="/packages"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                View Plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Enrolled Course Card ──────────────────────────────────────────────────────
function EnrolledCard({ enrollment: e }: { enrollment: any }) {
  const done = e.progressPercent === 100
  return (
    <Link href={`/student/courses/${e.course?._id}`}
      className="group rounded-2xl bg-dark-800 border border-white/5 hover:border-indigo-500/25 overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {e.course?.thumbnail
          ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-700" /></div>
        }
        {done ? (
          <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center backdrop-blur-sm">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors flex-1">
          {e.course?.title}
        </h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.course?.level || 'Beginner'}</span>
            <span className={`font-medium ${done ? 'text-green-400' : 'text-indigo-400'}`}>{e.progressPercent || 0}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
              style={{ width: `${e.progressPercent || 0}%` }}
            />
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${done ? 'text-green-400' : 'text-indigo-400'}`}>
            {done ? <><CheckCircle className="w-3 h-3" /> Completed</> : <><Play className="w-3 h-3" /> Continue</>}
            <ChevronRight className="w-3 h-3 ml-auto" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Available Course Card ─────────────────────────────────────────────────────
function AvailableCard({ course, onEnroll }: { course: any; onEnroll: () => Promise<any> }) {
  const [done, setDone] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const handle = async () => {
    setEnrolling(true)
    try { await onEnroll(); setDone(true) } catch {}
    setEnrolling(false)
  }

  return (
    <div className="rounded-2xl bg-dark-800 border border-white/5 hover:border-indigo-500/20 overflow-hidden flex flex-col transition-all">
      <div className="aspect-video bg-dark-700 overflow-hidden">
        {course.thumbnail
          ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-700" /></div>
        }
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1">{course.title}</h3>
        <div className="flex items-center gap-2 mt-2 mb-3 text-xs text-gray-500">
          <span className="capitalize">{course.level || 'Beginner'}</span>
          {course.category && <><span>·</span><span>{course.category}</span></>}
        </div>
        {done ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/15 text-green-300 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Enrolled!
          </div>
        ) : (
          <button
            onClick={handle}
            disabled={enrolling}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {enrolling ? 'Enrolling...' : 'Enroll for Free'}
          </button>
        )}
      </div>
    </div>
  )
}
