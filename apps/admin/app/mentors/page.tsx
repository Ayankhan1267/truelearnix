'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import {
  GraduationCap, Search, CheckCircle, XCircle, BookOpen,
  Users, ExternalLink, Loader2, Award, X, ChevronDown, Plus, Eye, EyeOff
} from 'lucide-react'
import { format } from 'date-fns'

const TIERS = ['starter', 'pro', 'elite', 'supreme']

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30',
  approved: 'text-green-400 bg-green-500/20 border border-green-500/30',
  rejected: 'text-red-400 bg-red-500/20 border border-red-500/30',
}

const tierColor = (t: string) => {
  const map: Record<string, string> = {
    starter: 'text-sky-400 bg-sky-500/20',
    pro: 'text-violet-400 bg-violet-500/20',
    elite: 'text-amber-400 bg-amber-500/20',
    supreme: 'text-rose-400 bg-rose-500/20',
    free: 'text-gray-400 bg-gray-500/20',
  }
  return map[t] || 'text-gray-400 bg-gray-500/20'
}

export default function MentorsPage() {
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [maxStudents, setMaxStudents] = useState('')
  const [createModal, setCreateModal] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', expertise: '', bio: '' })
  const qc = useQueryClient()

  // Fetch mentors
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-mentors', status, search, page],
    queryFn: () =>
      adminAPI.mentors({ status: status || undefined, search: search || undefined, page, limit: 20 }).then(r => r.data),
    placeholderData: (prev: any) => prev,
  })

  // Fetch all courses for assignment dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-all'],
    queryFn: () => adminAPI.allCourses({ limit: 200 }).then(r => r.data),
  })

  const approveMentor = async (id: string, name: string) => {
    if (!confirm(`Approve ${name} as a mentor?`)) return
    setActionId(id)
    try {
      await adminAPI.approveMentor(id)
      toast.success(`${name} approved as mentor`)
      refetch()
    } catch { toast.error('Approval failed') } finally { setActionId('') }
  }

  const rejectMentor = async () => {
    if (!rejectModal) return
    setActionId(rejectModal)
    try {
      await adminAPI.rejectMentor(rejectModal, rejectReason)
      toast.success('Mentor rejected')
      setRejectModal(null)
      setRejectReason('')
      refetch()
    } catch { toast.error('Rejection failed') } finally { setActionId('') }
  }

  const assignCourse = async () => {
    if (!assignModal || !selectedCourse) { toast.error('Please select a course'); return }
    setActionId(assignModal)
    try {
      await adminAPI.assignCourse(assignModal, selectedCourse, maxStudents ? Number(maxStudents) : undefined)
      toast.success('Course assigned successfully')
      setAssignModal(null)
      setSelectedCourse('')
      setMaxStudents('')
      refetch()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Assignment failed')
    } finally { setActionId('') }
  }

  const unassignCourse = async (mentorId: string, courseId: string, courseTitle: string) => {
    if (!confirm(`Remove "${courseTitle}" from this mentor?`)) return
    try {
      await adminAPI.unassignCourse(mentorId, courseId)
      toast.success('Course removed')
      refetch()
    } catch { toast.error('Failed to remove course') }
  }

  const createMentor = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password required'); return }
    setCreating(true)
    try {
      await adminAPI.createMentor(form)
      toast.success(`Mentor "${form.name}" created successfully!`)
      setCreateModal(false)
      setForm({ name: '', email: '', password: '', phone: '', expertise: '', bio: '' })
      refetch()
      setStatus('approved')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create mentor')
    } finally { setCreating(false) }
  }

  const givePackage = async (id: string, name: string, packageTier: string) => {
    if (!confirm(`Give ${packageTier} package to ${name}?`)) return
    try {
      await adminAPI.giveMentorPackage(id, packageTier)
      toast.success(`${packageTier} package given to ${name}`)
      refetch()
    } catch { toast.error('Failed to give package') }
  }

  const STATUS_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ]

  const mentors = data?.mentors || []
  const total = data?.total || 0
  const pages = data?.pages || 1

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-400" />
              Mentors
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{total} mentor{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Create Mentor
          </button>
        </div>

        {/* Status Tabs + Search */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Tabs */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1 border border-white/10">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setStatus(tab.value); setPage(1) }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === tab.value
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or email..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading mentors...
          </div>
        )}

        {/* Mentor Cards */}
        {!isLoading && (
          <div className="space-y-4">
            {mentors.length === 0 && (
              <div className="text-center py-16 text-gray-500 card">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No {status !== 'all' ? status : ''} mentors found</p>
              </div>
            )}

            {mentors.map((mentor: any) => (
              <div key={mentor._id} className="card">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Avatar + Identity */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {mentor.avatar
                        ? <img src={mentor.avatar} className="w-full h-full object-cover" alt="" />
                        : <span className="text-violet-400 font-bold text-lg">{mentor.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-white">{mentor.name}</p>
                        <span className={`badge ${statusColors[mentor.mentorStatus] || 'text-gray-400 bg-gray-500/20'}`}>
                          {mentor.mentorStatus || 'unknown'}
                        </span>
                        {mentor.packageTier && mentor.packageTier !== 'free' && (
                          <span className={`badge ${tierColor(mentor.packageTier)} capitalize`}>
                            <Award className="w-3 h-3 mr-1" />{mentor.packageTier}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{mentor.email}</p>
                      {mentor.phone && <p className="text-gray-500 text-xs mt-0.5">{mentor.phone}</p>}

                      {/* Application Details */}
                      {mentor.mentorApplication && (
                        <div className="mt-3 space-y-1.5">
                          {mentor.mentorApplication.experience && (
                            <p className="text-sm text-gray-300">
                              <span className="text-gray-500 mr-1">Experience:</span>
                              {mentor.mentorApplication.experience}
                            </p>
                          )}
                          {mentor.mentorApplication.bio && (
                            <p className="text-sm text-gray-400 line-clamp-2">{mentor.mentorApplication.bio}</p>
                          )}
                          {mentor.mentorApplication.expertise?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mentor.mentorApplication.expertise.map((ex: string) => (
                                <span key={ex} className="badge bg-slate-700 text-gray-300 text-[10px]">{ex}</span>
                              ))}
                            </div>
                          )}
                          {mentor.mentorApplication.linkedin && (
                            <a href={mentor.mentorApplication.linkedin} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                              <ExternalLink className="w-3 h-3" /> LinkedIn Profile
                            </a>
                          )}
                          {mentor.mentorApplication.portfolio && (
                            <a href={mentor.mentorApplication.portfolio} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 ml-3">
                              <ExternalLink className="w-3 h-3" /> Portfolio
                            </a>
                          )}
                          {mentor.mentorApplication.rejectionReason && (
                            <p className="text-xs text-red-400 mt-1">
                              <span className="font-medium">Rejection reason:</span> {mentor.mentorApplication.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Applied date */}
                      <p className="text-xs text-gray-500 mt-2">
                        Applied: {mentor.mentorApplication?.appliedAt
                          ? format(new Date(mentor.mentorApplication.appliedAt), 'dd MMM yyyy')
                          : mentor.createdAt
                            ? format(new Date(mentor.createdAt), 'dd MMM yyyy')
                            : '—'}
                      </p>

                      {/* Assigned Courses */}
                      {mentor.assignedCourses?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Assigned Courses
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {mentor.assignedCourses.map((ac: any) => {
                              const courseTitle = ac.courseId?.title || ac.courseId || 'Course'
                              const courseId = ac.courseId?._id || ac.courseId
                              return (
                                <span key={courseId}
                                  className="inline-flex items-center gap-1 text-xs bg-slate-700 text-gray-300 px-2 py-0.5 rounded-full">
                                  {courseTitle}
                                  {ac.maxStudents && (
                                    <span className="text-gray-500 ml-0.5">({ac.maxStudents} max)</span>
                                  )}
                                  <button
                                    onClick={() => unassignCourse(mentor._id, courseId, courseTitle)}
                                    className="ml-1 text-gray-500 hover:text-red-400 transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 justify-start lg:justify-start">
                    {/* Approve / Reject — for pending */}
                    {mentor.mentorStatus === 'pending' && (
                      <>
                        <button
                          disabled={actionId === mentor._id}
                          onClick={() => approveMentor(mentor._id, mentor.name)}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50">
                          {actionId === mentor._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          disabled={actionId === mentor._id}
                          onClick={() => { setRejectModal(mentor._id); setRejectReason('') }}
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {/* Assign Course — for approved */}
                    {mentor.mentorStatus === 'approved' && (
                      <button
                        onClick={() => { setAssignModal(mentor._id); setSelectedCourse(''); setMaxStudents('') }}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors">
                        <BookOpen className="w-3.5 h-3.5" /> Assign Course
                      </button>
                    )}

                    {/* Give Package — for approved */}
                    {mentor.mentorStatus === 'approved' && (
                      <div className="relative group">
                        <button
                          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors w-full">
                          <Award className="w-3.5 h-3.5" /> Give Package
                          <ChevronDown className="w-3 h-3 ml-auto" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-10 min-w-[130px] py-1 hidden group-hover:block">
                          {TIERS.map(tier => (
                            <button
                              key={tier}
                              onClick={() => givePackage(mentor._id, mentor.name, tier)}
                              className={`w-full text-left px-3 py-2 text-xs capitalize hover:bg-white/5 transition-colors ${tierColor(tier)}`}>
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Students count for approved */}
                    {mentor.mentorStatus === 'approved' && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
                        <Users className="w-3.5 h-3.5" />
                        {mentor.assignedCourses?.length || 0} course{mentor.assignedCourses?.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-400 hover:text-white'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Reject Mentor Application</h3>
              <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Provide a reason for rejection (optional — will be shown to the mentor).
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient experience, incomplete portfolio..."
              rows={3}
              className="input resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 text-gray-300 hover:bg-slate-600 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                disabled={actionId === rejectModal}
                onClick={rejectMentor}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                {actionId === rejectModal && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Mentor Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-violet-400" /> Create New Mentor
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Account will be auto-approved and ready to login</p>
              </div>
              <button onClick={() => setCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma" className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210" className="input" />
                </div>
              </div>

              <div>
                <label className="label block mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="mentor@example.com" className="input" />
              </div>

              <div>
                <label className="label block mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters" className="input pr-10" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label block mb-1.5">Expertise <span className="text-gray-500">(comma separated)</span></label>
                <input value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))}
                  placeholder="e.g. Web Development, Python, Data Science" className="input" />
              </div>

              <div>
                <label className="label block mb-1.5">Bio <span className="text-gray-500">(optional)</span></label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Short description about the mentor..." rows={3} className="input resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 text-gray-300 hover:bg-slate-600 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={createMentor} disabled={creating || !form.name || !form.email || !form.password}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                {creating ? 'Creating...' : 'Create Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Assign Course to Mentor</h3>
              <button onClick={() => { setAssignModal(null); setSelectedCourse(''); setMaxStudents('') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label block mb-1.5">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="input">
                  <option value="">-- Choose a course --</option>
                  {coursesData?.courses?.map((c: any) => (
                    <option key={c._id} value={c._id} className="bg-slate-800">
                      {c.title} {c.status !== 'published' ? `(${c.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label block mb-1.5">Max Students (optional)</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={e => setMaxStudents(e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="input"
                  min={1}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAssignModal(null); setSelectedCourse(''); setMaxStudents('') }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 text-gray-300 hover:bg-slate-600 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                disabled={!selectedCourse || actionId === assignModal}
                onClick={assignCourse}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {actionId === assignModal && <Loader2 className="w-4 h-4 animate-spin" />}
                <BookOpen className="w-4 h-4" />
                Assign Course
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
