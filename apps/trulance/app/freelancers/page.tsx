'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trulanceAPI } from '@/lib/api'
import Link from 'next/link'
import { Search, Users, Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const SKILLS = ['All', 'Digital Marketing', 'SEO', 'Content Writing', 'React', 'Node.js', 'Design', 'Video Editing', 'Data Analysis']

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: 'Free', cls: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
  starter: { label: 'Starter', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  pro: { label: 'Pro', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  elite: { label: 'Elite', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  supreme: { label: 'Supreme', cls: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
}

export default function FreelancersPage() {
  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('All')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['freelancers', search, skill, page],
    queryFn: () => trulanceAPI.getFreelancers({ search, skill: skill === 'All' ? undefined : skill, page, limit: 12 }).then(r => r.data),
  })

  const users: any[] = data?.data || []
  const total: number = data?.total || 0
  const pages: number = data?.pages || 1

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="py-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Find Talent</h1>
          <p className="text-gray-500">{total} verified freelancers available</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name..." className="input pl-10" />
          </div>
          <select value={skill} onChange={e => { setSkill(e.target.value); setPage(1); }} className="input w-auto">
            {SKILLS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Skills' : s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {users.map((u: any, i: number) => {
                const tier = TIER_BADGE[u.packageTier] || TIER_BADGE.free
                return (
                  <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <Link href={`/freelancers/${u._id}`}>
                      <div className="card cursor-pointer hover:border-teal-500/40 transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}>
                            {u.avatar
                              ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              : <span className="text-white">{u.name?.[0]}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{u.name}</p>
                            <span className={`badge border text-[10px] ${tier.cls}`}>{tier.label}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1">
                          {u.bio || 'TruLearnix Certified Professional'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(u.expertise || []).slice(0, 3).map((s: string) => (
                            <span key={s} className="badge bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px]">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{u.xpPoints || 0} XP</span>
                          </div>
                          <span className="text-xs text-teal-400 font-semibold flex items-center gap-0.5">
                            View <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {users.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">No freelancers found</p>
                <p className="text-sm mt-1">Try adjusting your search</p>
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
