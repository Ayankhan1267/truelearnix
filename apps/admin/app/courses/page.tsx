'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { BookOpen, Clock, CheckCircle, XCircle, Users, DollarSign } from 'lucide-react'

type Tab = 'all' | 'pending'

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    pending: 'bg-blue-500/20 text-blue-400',
    rejected: 'bg-red-500/20 text-red-400',
    archived: 'bg-gray-500/20 text-gray-400',
  }
  return map[s] || 'bg-gray-500/20 text-gray-400'
}

export default function CoursesPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [processing, setProcessing] = useState('')

  const { data: allData, refetch: refetchAll } = useQuery({
    queryKey: ['admin-courses', statusFilter],
    queryFn: () => adminAPI.allCourses({ status: statusFilter || undefined, limit: 50 }).then(r => r.data),
    enabled: tab === 'all'
  })

  const { data: pendingData, refetch: refetchPending } = useQuery({
    queryKey: ['pending-courses'],
    queryFn: () => adminAPI.pendingCourses().then(r => r.data),
    enabled: tab === 'pending'
  })

  const courses = tab === 'all'
    ? (allData?.courses || allData?.data || [])
    : (pendingData?.courses || pendingData?.data || [])

  const approve = async (id: string, title: string) => {
    setProcessing(id)
    try {
      await adminAPI.approveCourse(id)
      toast.success(`"${title}" approved`)
      refetchPending()
      refetchAll()
    } catch { toast.error('Failed to approve') } finally { setProcessing('') }
  }

  const reject = async (id: string, title: string) => {
    const reason = prompt(`Reason for rejecting "${title}":`)
    if (!reason) return
    setProcessing(id)
    try {
      await adminAPI.rejectCourse(id, reason)
      toast.success('Course rejected')
      refetchPending()
      refetchAll()
    } catch { toast.error('Failed to reject') } finally { setProcessing('') }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Courses</h1>
            <p className="text-gray-400 text-sm mt-0.5">{courses.length} courses</p>
          </div>
          {tab === 'pending' && pendingData?.courses?.length > 0 && (
            <span className="badge bg-blue-500/20 text-blue-400">
              {pendingData.courses.length} awaiting review
            </span>
          )}
        </div>

        {/* Tabs + Filter */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-1 bg-slate-800/50 border border-white/10 rounded-2xl p-1">
            <button onClick={() => setTab('all')}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'all' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              All Courses
            </button>
            <button onClick={() => setTab('pending')}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Clock className="w-3.5 h-3.5" /> Pending Approval
              {(pendingData?.courses?.length || 0) > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {pendingData?.courses?.length}
                </span>
              )}
            </button>
          </div>
          {tab === 'all' && (
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Course</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Mentor</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Enrolled</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Price</th>
                  {tab === 'pending' && <th className="text-left px-5 py-4 text-gray-400 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course: any) => (
                  <tr key={course._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-14 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-9 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-violet-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-medium line-clamp-1 max-w-[250px]">{course.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{course.category || course.level || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm">{course.mentor?.name || course.instructor?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{course.mentor?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusColor(course.status)} capitalize`}>{course.status || 'draft'}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-300 text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {(course.enrolledCount || course.totalEnrollments || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white font-medium text-sm">
                      {course.isFree ? (
                        <span className="badge bg-green-500/20 text-green-400">Free</span>
                      ) : (
                        <span>₹{(course.price || 0).toLocaleString()}</span>
                      )}
                    </td>
                    {tab === 'pending' && (
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approve(course._id, course.title)}
                            disabled={processing === course._id}
                            className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => reject(course._id, course.title)}
                            disabled={processing === course._id}
                            className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {tab === 'pending' ? 'No courses pending approval' : 'No courses found'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
