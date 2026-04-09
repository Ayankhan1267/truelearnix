'use client'
import { useQuery } from '@tanstack/react-query'
import { mentorAPI } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { Users, Search, GraduationCap, Phone, Mail } from 'lucide-react'
import { useState, Suspense } from 'react'
import { format } from 'date-fns'

function StudentsContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course') || ''
  const [search, setSearch] = useState('')

  const { data: coursesData } = useQuery({
    queryKey: ['mentor-courses'],
    queryFn: () => mentorAPI.courses().then(r => r.data)
  })

  const [selectedCourse, setSelectedCourse] = useState(courseId)
  const courses = coursesData?.courses || []

  const { data, isLoading } = useQuery({
    queryKey: ['mentor-students', selectedCourse],
    queryFn: () => mentorAPI.courseStudents(selectedCourse).then(r => r.data),
    enabled: !!selectedCourse,
  })

  const students = (data?.students || []).filter((e: any) =>
    !search || e.user?.name?.toLowerCase().includes(search.toLowerCase()) || e.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Students</h1>
        <p className="text-gray-400 text-sm mt-1">Students enrolled in your assigned courses</p>
      </div>

      {/* Course selector */}
      {courses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {courses.map((item: any) => {
            const course = item.courseId
            if (!course) return null
            return (
              <button key={course._id}
                onClick={() => setSelectedCourse(course._id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedCourse === course._id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
                {course.title}
              </button>
            )
          })}
        </div>
      )}

      {!selectedCourse ? (
        <div className="card text-center py-16">
          <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold">Select a course to view students</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students..." className="input pl-9" />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
          ) : students.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">{search ? 'No students match search' : 'No students enrolled yet'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''}</p>
              {students.map((e: any, i: number) => (
                <div key={i} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    {e.user?.avatar ? <img src={e.user.avatar} className="w-10 h-10 rounded-full object-cover" /> : <span className="text-primary-400 font-bold">{e.user?.name?.[0] || '?'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{e.user?.name}</p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {e.user?.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{e.user.email}</span>}
                      {e.user?.phone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{e.user.phone}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.user?.packageTier !== 'free' ? 'bg-violet-500/20 text-violet-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {e.user?.packageTier || 'free'}
                    </span>
                    {e.createdAt && <p className="text-xs text-gray-600 mt-1">{format(new Date(e.createdAt), 'MMM d, yyyy')}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function MentorStudentsPage() {
  return <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}><StudentsContent /></Suspense>
}
