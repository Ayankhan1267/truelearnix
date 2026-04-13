'use client'
import { useQuery } from '@tanstack/react-query'
import { managerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  Users, TrendingUp, IndianRupee, Target, Trophy,
  CheckCircle, Loader2, UserCheck, Flame, Bell, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['manager-stats'],
    queryFn: () => managerAPI.stats().then(r => r.data.stats),
  })

  const { data: lbData } = useQuery({
    queryKey: ['manager-leaderboard'],
    queryFn: () => managerAPI.leaderboard().then(r => r.data.leaderboard),
  })

  const { data: partnersData } = useQuery({
    queryKey: ['manager-partners-recent'],
    queryFn: () => managerAPI.partners({ limit: 5 }).then(r => r.data.partners),
  })

  const s = statsData

  const statCards = [
    { label: 'My Earnings',       value: `₹${(s?.myEarnings || 0).toLocaleString()}`,   icon: IndianRupee, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/15', icon_c: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'My Wallet',         value: `₹${(s?.myWallet || 0).toLocaleString()}`,     icon: Flame,       color: 'from-teal-500/20 to-teal-600/10',     border: 'border-teal-500/15',    icon_c: 'text-teal-400',    bg: 'bg-teal-500/15' },
    { label: 'This Month',        value: `₹${(s?.myMonthlyEarnings || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/15', icon_c: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { label: 'Total Partners',    value: s?.totalPartners || 0,     icon: Users,         color: 'from-blue-500/20 to-blue-600/10',    border: 'border-blue-500/15',    icon_c: 'text-blue-400',    bg: 'bg-blue-500/15' },
    { label: 'Active Partners',   value: s?.activePartners || 0,    icon: UserCheck,     color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/15', icon_c: 'text-violet-400', bg: 'bg-violet-500/15' },
    { label: 'Active Goals',      value: s?.totalGoals || 0,        icon: Target,        color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/15', icon_c: 'text-orange-400',  bg: 'bg-orange-500/15' },
  ]

  const TIER_COLOR: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-400', starter: 'bg-blue-500/20 text-blue-400',
    pro: 'bg-indigo-500/20 text-indigo-400', elite: 'bg-violet-500/20 text-violet-400',
    supreme: 'bg-yellow-500/20 text-yellow-400',
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's how your team is performing today</p>
        </div>
        <Link href="/manager/partners"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-all border border-emerald-500/20">
          <Users className="w-4 h-4" /> View All Partners
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {statCards.map(card => (
            <div key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 sm:p-5 border ${card.border} flex flex-col gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.icon_c}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Partners Leaderboard */}
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Top Performers
            </h2>
            <Link href="/manager/leaderboard" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Full Leaderboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!lbData?.length ? (
            <div className="text-center py-8 text-gray-500 text-sm">No partners yet</div>
          ) : (
            <div className="space-y-2">
              {lbData.slice(0, 5).map((p: any, idx: number) => (
                <Link key={p._id} href={`/manager/partners/${p._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/5 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.l1Count} referrals · {p.affiliateCode}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">₹{(p.totalEarnings || 0).toLocaleString()}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${TIER_COLOR[p.packageTier] || TIER_COLOR.free}`}>{p.packageTier}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Partners */}
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Recent Partners
            </h2>
            <Link href="/manager/partners" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!partnersData?.length ? (
            <div className="text-center py-8 text-gray-500 text-sm">No partners assigned yet</div>
          ) : (
            <div className="space-y-2">
              {partnersData.map((p: any) => (
                <Link key={p._id} href={`/manager/partners/${p._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.affiliateCode}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{p.l1Count || 0} referrals</p>
                    {p.activeGoals > 0 && (
                      <p className="text-xs text-orange-400">{p.activeGoals} goals</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
