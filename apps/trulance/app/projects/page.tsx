'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trulanceAPI } from '@/lib/api'
import Link from 'next/link'
import { Search, Briefcase, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Content', 'Data', 'Video', 'Other']
const LEVELS = ['All', 'beginner', 'intermediate', 'expert']

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/15 text-green-400 border-green-500/20',
  intermediate: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  expert: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, category, level, page],
    queryFn: () => trulanceAPI.getProjects({ search, category, experienceLevel: level, page, limit: 12 }).then(r => r.data),
  })

  const jobs: any[] = data?.data || []
  const total: number = data?.total || 0
  const pages: number = data?.pages || 1

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="py-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Browse Projects</h1>
          <p className="text-gray-500">{total} open projects available</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search projects..." className="input pl-10" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input w-auto">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="input w-auto capitalize">
            {LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job: any, i: number) => (
                <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <Link href={`/projects/${job._id}`}>
                    <div className="card cursor-pointer hover:border-teal-500/40 h-full flex flex-col transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-white leading-snug line-clamp-2 flex-1 text-sm">{job.title}</h3>
                        <span className={`badge border flex-shrink-0 capitalize ${LEVEL_COLORS[job.experienceLevel] || 'bg-gray-500/15 text-gray-400'}`}>
                          {job.experienceLevel}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-3 mb-4 flex-1">{job.description}</p>
                      {job.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {job.skills.slice(0, 4).map((s: string) => (
                            <span key={s} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div>
                          <p className="text-teal-400 font-black">₹{job.budget?.toLocaleString()}</p>
                          <p className="text-xs text-gray-600 capitalize">{job.budgetType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{job.category}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600 justify-end mt-0.5">
                            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{job.applicants?.length || 0}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{job.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">No projects found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page ? 'btn-primary' : 'btn-secondary'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
