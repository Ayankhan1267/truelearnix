'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  BookOpen, Play, CheckCircle, Clock, ChevronRight,
  Sparkles, Lock, ArrowRight, Search, Users, BarChart2,
  GraduationCap, Flame, Star, Filter
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'enrolled' | 'available'
type Filter = 'all' | 'inprogress' | 'completed'

export default function LearnerCoursesPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('enrolled')
  const [filter, setFilter] = useState<Filter>('all')
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
  const isPaid = tier !== 'free' || !!(user as any)?.isAffiliate || !!user?.enrollmentCount
    || enrolledData === undefined
    || (enrolledData && enrolledData.length > 0)
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

  const completedCount = (enrolledData || []).filter((e: any) => e.progressPercent === 100).length
  const inProgressCount = (enrolledData || []).filter((e: any) => e.progressPercent > 0 && e.progressPercent < 100).length

  return (
    <div className="space-y-6 max-w-5xl pb-8">

      {/* Header + Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Learning</h1>
            <p className="text-gray-400 text-sm mt-1">Track your progress and keep learning</p>
          </div>
          <Link href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all border border-indigo-500/20 self-start sm:self-auto">
            <BookOpen className="w-4 h-4" /> Browse More Courses
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-800 rounded-2xl p-4 border border-white/5 text-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">{enrolledData?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
          </div>
          <div className="bg-dark-800 rounded-2xl p-4 border border-white/5 text-center">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xl font-bold text-white">{inProgressCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
          </div>
          <div className="bg-dark-800 rounded-2xl p-4 border border-white/5 text-center">
            <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-white">{completedCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-dark-800 rounded-xl p-1 border border-white/5 self-start">
          <button onClick={() => setTab('enrolled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'enrolled' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white'
            }`}>
            My Courses
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

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-dark-800 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      </div>

      {/* Enrolled Tab */}
      {tab === 'enrolled' && (
        <>
          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'all', label: 'All', icon: Filter },
              { key: 'inprogress', label: 'In Progress', icon: Flame },
              { key: 'completed', label: 'Completed', icon: CheckCircle },
            ] as const).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  filter === f.key
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/25'
                    : 'text-gray-400 bg-dark-800 border-white/5 hover:text-white'
                }`}>
                <f.icon className="w-3 h-3" />
                {f.label}
              </button>
            ))}
          </div>

          {loadingEnrolled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />}
              title="No courses found"
              desc={search ? 'Try a different search term.' : 'Enroll in a course to start learning.'}
              action={<Link href="/courses" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-medium hover:bg-indigo-500/25">
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>}
            />
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
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 w-fit">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-semibold capitalize">{tier} Plan</span>
            <span className="text-xs text-gray-400">— Enroll for free</span>
          </div>

          {loadingAvail ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredAvail.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />}
              title="All caught up!"
              desc="You've enrolled in all available courses."
            />
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

      {/* Free tier upgrade CTA */}
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-dark-800 border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-video bg-dark-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-dark-700 rounded w-3/4" />
        <div className="h-3 bg-dark-700 rounded w-1/2" />
        <div className="h-2 bg-dark-700 rounded-full" />
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-16 px-4">
      {icon}
      <p className="text-gray-300 font-semibold mb-1">{title}</p>
      <p className="text-gray-500 text-sm mb-4">{desc}</p>
      {action}
    </div>
  )
}

// ── Enrolled Course Card ──────────────────────────────────────────────────────
function EnrolledCard({ enrollment: e }: { enrollment: any }) {
  const done = e.progressPercent === 100
  const lessonCount = e.course?.lessons?.length || 0

  return (
    <Link href={`/student/courses/${e.course?._id}`}
      className="group rounded-2xl bg-dark-800 border border-white/5 hover:border-indigo-500/30 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {e.course?.thumbnail
          ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-violet-900/40">
              <BookOpen className="w-10 h-10 text-indigo-700" />
            </div>
        }
        {/* Status overlay */}
        {done ? (
          <div className="absolute inset-0 bg-green-900/50 flex items-center justify-center backdrop-blur-[2px]">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
              <p className="text-green-300 text-xs font-semibold mt-1">Completed!</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
        )}
        {/* Category badge */}
        {e.course?.category && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-gray-300 font-medium">
            {e.course.category}
          </div>
        )}
        {/* Progress badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold ${
          done ? 'bg-green-500/90 text-white' : e.progressPercent > 0 ? 'bg-indigo-500/90 text-white' : 'bg-black/50 text-gray-300'
        }`}>
          {e.progressPercent || 0}%
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors flex-1 leading-snug">
          {e.course?.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />{lessonCount} lessons
            </span>
          )}
          {e.course?.level && (
            <span className="capitalize flex items-center gap-1">
              <BarChart2 className="w-3 h-3" />{e.course.level}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${done ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
              style={{ width: `${e.progressPercent || 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium flex items-center gap-1 ${done ? 'text-green-400' : 'text-indigo-400'}`}>
              {done ? <><CheckCircle className="w-3 h-3" /> Completed</> : e.progressPercent > 0 ? <><Play className="w-3 h-3" /> Continue</> : 'Start Learning'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
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
    <div className="rounded-2xl bg-dark-800 border border-white/5 hover:border-violet-500/20 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-0.5">
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {course.thumbnail
          ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
              <BookOpen className="w-10 h-10 text-violet-700" />
            </div>
        }
        {course.category && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-gray-300">
            {course.category}
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-violet-500/80 text-xs text-white font-semibold">
          Free Enroll
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1 leading-snug">{course.title}</h3>

        <div className="flex items-center gap-3 mt-2 mb-3 text-xs text-gray-500">
          <span className="capitalize flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />{course.level || 'Beginner'}
          </span>
          {course.lessons?.length > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />{course.lessons.length} lessons
            </span>
          )}
        </div>

        {done ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/15 text-green-300 text-sm font-medium border border-green-500/20">
            <CheckCircle className="w-4 h-4" /> Enrolled! Open Course
          </div>
        ) : (
          <button
            onClick={handle}
            disabled={enrolling}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {enrolling ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enrolling...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Enroll for Free</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
