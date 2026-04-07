'use client'
import { useQuery } from '@tanstack/react-query'
import { courseAPI } from '@/lib/api'
import { BookOpen, Plus, Users, Star, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function MentorCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ['mentor-courses'],
    queryFn: () => courseAPI.myMentorCourses().then(r => r.data.courses),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 mt-1">Manage and create courses</p>
        </div>
        <Link href="/mentor/courses/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No courses yet. Create your first course!</p>
          <Link href="/mentor/courses/new" className="btn-primary">Create Course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.map((course: any) => (
            <Link key={course._id} href={`/mentor/courses/${course._id}`}
              className="card hover:border-primary-500/30 border border-white/5 transition-colors group">
              <div className="aspect-video rounded-xl overflow-hidden bg-dark-700 mb-4">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-gray-600" /></div>
                }
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2">{course.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_BADGE[course.status] || STATUS_BADGE.draft}`}>
                  {course.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrollmentCount || 0}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{course.rating?.toFixed(1) || 'N/A'}</span>
                <span className="capitalize text-xs">{course.category}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-primary-400 font-bold">₹{course.price?.toLocaleString()}</span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
