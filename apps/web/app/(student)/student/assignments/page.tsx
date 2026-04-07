'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { courseAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { FileText, Clock, CheckCircle, XCircle, Upload, BookOpen, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: 'text-yellow-400 bg-yellow-500/20', icon: Clock, label: 'Pending' },
  reviewed: { color: 'text-green-400 bg-green-500/20', icon: CheckCircle, label: 'Reviewed' },
  overdue: { color: 'text-red-400 bg-red-500/20', icon: XCircle, label: 'Overdue' },
  'not-submitted': { color: 'text-gray-400 bg-gray-500/20', icon: AlertCircle, label: 'Not Submitted' },
}

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'all'>('all')

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => courseAPI.enrolled().then(r => r.data.data || []),
  })

  const courseIds: string[] = enrollments.map((e: any) => e.course?._id || e.course).filter(Boolean)

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments', courseIds],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map((id: string) =>
          courseAPI.assignments(id)
            .then(r => (r.data.assignments || []).map((a: any) => ({ ...a, courseName: enrollments.find((e: any) => (e.course?._id || e.course) === id)?.course?.title || 'Unknown Course' })))
            .catch(() => [])
        )
      )
      return results.flat()
    },
  })

  const getMySubmission = (a: any) => a.submissions?.find((s: any) => s.student === (user as any)?._id || s.student?._id === (user as any)?._id)

  const getStatus = (a: any): string => {
    const sub = getMySubmission(a)
    if (sub) return sub.status
    if (a.dueDate && new Date(a.dueDate) < new Date()) return 'overdue'
    return 'not-submitted'
  }

  const filtered = assignments.filter(a => {
    const status = getStatus(a)
    if (activeTab === 'pending') return status === 'not-submitted'
    if (activeTab === 'submitted') return status === 'pending' || status === 'reviewed'
    return true
  })

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => getMySubmission(a)).length,
    reviewed: assignments.filter(a => getMySubmission(a)?.status === 'reviewed').length,
    pending: assignments.filter(a => !getMySubmission(a) && (a.dueDate ? new Date(a.dueDate) >= new Date() : true)).length,
  }

  if (loadingEnrollments || loadingAssignments) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (courseIds.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Enrolled Courses</h2>
        <p className="text-gray-400 mb-6">Enroll in courses to see assignments</p>
        <Link href="/courses" className="btn-primary px-6 py-3">Browse Courses</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <p className="text-gray-400 text-sm mt-1">Track and submit your course assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Submitted', value: stats.submitted, color: 'text-blue-400' },
          { label: 'Reviewed', value: stats.reviewed, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="card py-4">
            <p className="text-gray-400 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {([['all', 'All'], ['pending', 'Pending'], ['submitted', 'Submitted']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Assignments list */}
      <div className="space-y-4">
        {filtered.map((a: any) => {
          const sub = getMySubmission(a)
          const status = getStatus(a)
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['not-submitted']
          const isOverdue = status === 'overdue'
          return (
            <div key={a._id} className={`card hover:border-primary-500/20 transition-all ${isOverdue ? 'border-red-500/20' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{a.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{a.courseName}</span>
                      {a.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                          <Calendar className="w-3 h-3" />Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>Max Score: {a.maxScore}</span>
                    </div>
                    {sub && (
                      <div className="mt-3 p-3 bg-dark-700 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                            {sub.fileName && <p className="text-xs text-primary-400 mt-0.5">{sub.fileName}</p>}
                          </div>
                          {sub.score !== undefined && (
                            <div className="text-right">
                              <p className="text-white font-bold">{sub.score}/{a.maxScore}</p>
                              <p className="text-xs text-gray-400">Score</p>
                            </div>
                          )}
                        </div>
                        {sub.feedback && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <p className="text-xs text-gray-400 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-300">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {!sub && !isOverdue && (
                  <Link href={`/student/courses?assignment=${a._id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/30 transition-colors flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" /> Submit
                  </Link>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No assignments {activeTab !== 'all' ? `in ${activeTab}` : ''} yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
