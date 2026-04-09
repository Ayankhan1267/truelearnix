'use client'
import { useQuery } from '@tanstack/react-query'
import { mentorAPI } from '@/lib/api'
import { BookOpen, Users, ChevronRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'

const levelColors: Record<string, string> = {
  beginner: 'text-green-400 bg-green-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/20',
  advanced: 'text-red-400 bg-red-500/20',
}

export default function MentorCoursesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['mentor-courses'],
    queryFn: () => mentorAPI.courses().then(r => r.data)
  })

  const courses = data?.courses || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Assigned Courses</h1>
        <p className="text-gray-400 text-sm mt-1">Courses assigned to you by admin</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No courses assigned yet</p>
          <p className="text-gray-400 text-sm">Admin will assign courses to you soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((item: any, i: number) => {
            const course = item.courseId
            if (!course) return null
            return (
              <div key={i} className="card hover:border-primary-500/30 transition-all group p-0 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary-400/50" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-sm leading-tight">{course.title}</h3>
                    {course.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${levelColors[course.level] || 'text-gray-400 bg-gray-500/20'}`}>
                        {course.level}
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledCount || 0} students</span>
                    {item.maxStudents && <span>Max: {item.maxStudents}</span>}
                  </div>
                  <Link href={`/mentor/students?course=${course._id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-xl text-primary-400 text-xs font-medium transition-all">
                    <GraduationCap className="w-3.5 h-3.5" /> View Students <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
