'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { BookOpen, Play, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function MyCoursesPage() {
  const [filter, setFilter] = useState<'all' | 'inprogress' | 'completed'>('all')
  const { data, isLoading } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: () => userAPI.enrolledCourses().then(r => r.data.enrollments)
  })

  const filtered = (data || []).filter((e: any) => {
    if (filter === 'inprogress') return e.progressPercent > 0 && e.progressPercent < 100
    if (filter === 'completed') return e.progressPercent === 100
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 mt-1">{data?.length || 0} courses enrolled</p>
        </div>
        <Link href="/courses" className="btn-primary text-sm py-2 px-5">Browse More</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'inprogress', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-gray-400 bg-white/5 hover:text-white'}`}>
            {f === 'inprogress' ? 'In Progress' : f === 'all' ? 'All Courses' : 'Completed'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="card animate-pulse h-64 bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No courses found.</p>
          <Link href="/courses" className="btn-primary text-sm">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((e: any) => (
            <Link key={e._id} href={`/student/courses/${e.course?._id}`}
              className="card hover:border-primary-500/30 transition-all group flex flex-col">
              <div className="relative rounded-xl overflow-hidden mb-4 aspect-video bg-dark-700">
                {e.course?.thumbnail
                  ? <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-600" /></div>}
                {e.progressPercent === 100 && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">{e.course?.title}</h3>
              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {e.course?.level || 'Beginner'}</span>
                  <span>{e.progressPercent || 0}% complete</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${e.progressPercent || 0}%` }} />
                </div>
                <div className={`flex items-center gap-2 text-xs font-medium mt-1 ${e.progressPercent === 100 ? 'text-green-400' : 'text-primary-400'}`}>
                  {e.progressPercent === 100 ? <><CheckCircle className="w-3 h-3" /> Completed</> : <><Play className="w-3 h-3" /> Continue</>}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
