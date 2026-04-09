'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import { Search, Users, ShoppingBag, UserX, Crown, Star, Zap, Shield, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  free:    { label: 'Free',    color: 'text-gray-400',   bg: 'bg-gray-500/20',   icon: Users },
  starter: { label: 'Starter', color: 'text-sky-400',    bg: 'bg-sky-500/20',    icon: Star },
  pro:     { label: 'Pro',     color: 'text-violet-400', bg: 'bg-violet-500/20', icon: Zap },
  elite:   { label: 'Elite',   color: 'text-amber-400',  bg: 'bg-amber-500/20',  icon: Shield },
  supreme: { label: 'Supreme', color: 'text-rose-400',   bg: 'bg-rose-500/20',   icon: Crown },
}

type Tab = 'purchased' | 'free' | 'all'

export default function LearnersPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-learners', tab, search, page],
    queryFn: () => adminAPI.learners({ type: tab, search: search || undefined, page, limit: 20 }).then(r => r.data),
    placeholderData: (prev: any) => prev,
  })

  const stats = data?.stats || { purchasedCount: 0, freeCount: 0 }
  const totalAll = (stats.purchasedCount || 0) + (stats.freeCount || 0)

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleTab = (t: Tab) => { setTab(t); setPage(1) }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Learners</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage all learners on the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Total Learners</p>
              <p className="text-3xl font-bold text-white">{totalAll}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Purchased</p>
              <p className="text-3xl font-bold text-emerald-400">{stats.purchasedCount}</p>
              <p className="text-gray-500 text-xs mt-0.5">{totalAll ? Math.round((stats.purchasedCount / totalAll) * 100) : 0}% conversion</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-600/20 to-slate-800/10 border border-slate-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <UserX className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Free / Not Purchased</p>
              <p className="text-3xl font-bold text-gray-300">{stats.freeCount}</p>
              <p className="text-gray-500 text-xs mt-0.5">Potential conversions</p>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-white/5">
            {(['all', 'purchased', 'free'] as Tab[]).map(t => (
              <button key={t} onClick={() => handleTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-white'}`}>
                {t === 'purchased' ? 'Purchased' : t === 'free' ? 'Free / Unpaid' : 'All Learners'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search name, email or phone..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-colors" />
          </div>
          <span className="text-gray-400 text-sm ml-auto">{data?.total || 0} results</span>
        </div>

        {/* Table */}
        <div className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-700/30">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Learner</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Contact</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Package</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">XP / Level</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.learners?.map((u: any) => {
                    const tier = TIER_CONFIG[u.packageTier] || TIER_CONFIG.free
                    const TierIcon = tier.icon
                    return (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all">
                              {u.avatar
                                ? <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                                : <span className="text-violet-400 font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">{u.name}</p>
                              {u.affiliateCode && <p className="text-xs text-violet-400 mt-0.5">Affiliate: {u.affiliateCode}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-gray-300 text-xs">{u.email}</p>
                          {u.phone && <p className="text-gray-500 text-xs mt-0.5">{u.phone}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${tier.color} ${tier.bg}`}>
                              <TierIcon className="w-3 h-3" />
                              {tier.label}
                            </span>
                          </div>
                          {u.packagePurchasedAt && (
                            <p className="text-gray-500 text-[11px] mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(u.packagePurchasedAt), 'dd MMM yyyy')}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-white font-medium text-xs">{u.xpPoints || 0} XP</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">Level {u.level || 1}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">
                          {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!data?.learners?.length && (
                <div className="text-center py-16 text-gray-500">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No learners found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center gap-2 justify-center">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(data.pages, 7) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-400 hover:text-white'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
