'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mentorAPI } from '@/lib/api'
import { Users, Search, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function MentorStudents() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['mentor-students'],
    queryFn: () => mentorAPI.myStudents().then(r => r.data.students),
  })

  const filtered = data?.filter((e: any) =>
    e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Students</h1>
          <p className="text-gray-400 mt-1">{data?.length || 0} students enrolled in your courses</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-64" placeholder="Search students..." />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
      ) : filtered?.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{search ? 'No students match your search.' : 'No students enrolled yet.'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">Student</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">Course</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">Progress</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered?.map((e: any) => (
                  <tr key={e._id} className="hover:bg-white/2">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          {e.student?.avatar
                            ? <img src={e.student.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            : <span className="text-primary-400 text-xs font-bold">{e.student?.name?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{e.student?.name}</p>
                          <p className="text-xs text-gray-400">{e.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300 line-clamp-1">{e.course?.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${e.progressPercent || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{e.progressPercent || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-400">{e.createdAt ? format(new Date(e.createdAt), 'dd MMM yyyy') : '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
