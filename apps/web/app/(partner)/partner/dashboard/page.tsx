'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI, managerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import {
  TrendingUp, Users, Coins, Trophy, Star, Target, ArrowRight,
  ArrowUpRight, Activity, ChevronRight, Zap, Crown, Flame,
  Network, ShieldCheck, Link2, Award, Lock, UserCog, MessageSquare, CheckCircle2
} from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, gradient, change }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} border border-white/10`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {change !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${change >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function MiniChart({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((v - min) / range) * 80
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

export default function PartnerDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['partner-dashboard'], queryFn: () => partnerAPI.dashboard().then(r => r.data), staleTime: 0 })
  const { data: tipsData } = useQuery({ queryKey: ['my-tips'], queryFn: () => managerAPI.myTips().then(r => r.data), staleTime: 0 })
  const { data: goalsData } = useQuery({ queryKey: ['my-goals'], queryFn: () => managerAPI.myGoals().then(r => r.data), staleTime: 0 })

  const myTips: any[] = tipsData?.tips || []
  const myGoals: any[] = goalsData?.goals || []
  const myManager = data?.manager || myTips[0]?.manager || myGoals[0]?.manager || null

  const stats = data?.stats
  const trend = data?.trend || []
  const topReferrals = data?.topReferrals || []
  const rank = data?.rank
  const sponsor = data?.sponsor
  const locked = data?.locked
  const commissionRates = data?.commissionRates
  const packageCommissions: any[] = data?.packageCommissions || []

  const tierColors: Record<string, string> = {
    free: 'from-gray-600 to-gray-700',
    starter: 'from-blue-600 to-blue-700',
    pro: 'from-purple-600 to-purple-700',
    elite: 'from-amber-500 to-orange-600',
    supreme: 'from-rose-500 to-pink-600',
  }
  const tierGrad = tierColors[user?.packageTier || 'free']

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  if (locked) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-dark-400" />
      </div>
      <h2 className="text-white text-2xl font-bold mb-3">Partner Panel Locked</h2>
      <p className="text-dark-400 max-w-sm mb-8">Purchase a package to unlock the Partner Panel and start earning commissions through referrals.</p>
      <Link href="/student/upgrade" className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all">
        View Packages
      </Link>
    </div>
  )

  const trendValues = trend.map((t: any) => t.earnings || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Partner Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${tierGrad} text-white text-sm font-semibold capitalize flex items-center gap-2`}>
          <Crown className="w-4 h-4" /> {user?.packageTier} Partner
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={`₹${(stats?.totalEarnings || 0).toLocaleString()}`} icon={Coins} gradient="from-violet-600 to-purple-700" sub="All time" />
        <StatCard label="This Month" value={`₹${(stats?.monthEarnings || 0).toLocaleString()}`} icon={TrendingUp} gradient="from-emerald-600 to-teal-700" change={stats?.monthGrowth} />
        <StatCard label="Total Referrals" value={stats?.totalReferrals || 0} icon={Users} gradient="from-blue-600 to-cyan-700" sub={`L1: ${stats?.l1Count || 0} · L2: ${stats?.l2Count || 0} · L3: ${stats?.l3Count || 0}`} />
        <StatCard label="Leaderboard Rank" value={rank ? `#${rank}` : '—'} icon={Trophy} gradient="from-amber-500 to-orange-600" sub="Among all partners" />
      </div>

      {/* Wallet + Trend */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Wallet Card */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Wallet</h3>
            <Link href="/student/wallet" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">Withdraw <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="text-3xl font-bold text-white mb-1">₹{(user?.wallet || 0).toLocaleString()}</div>
          <p className="text-dark-400 text-xs mb-4">Available balance</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-dark-700 rounded-xl p-3">
              <p className="text-green-400 text-sm font-bold">₹{(stats?.totalEarnings || 0).toLocaleString()}</p>
              <p className="text-dark-400 text-xs">Total Earned</p>
            </div>
            <div className="bg-dark-700 rounded-xl p-3">
              <p className="text-red-400 text-sm font-bold">₹{(user?.totalWithdrawn || 0).toLocaleString()}</p>
              <p className="text-dark-400 text-xs">Withdrawn</p>
            </div>
          </div>
        </div>

        {/* Earnings Trend */}
        <div className="lg:col-span-2 bg-dark-800 rounded-2xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Earnings Trend</h3>
            <Link href="/partner/earnings" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {trendValues.length > 1 ? (
            <>
              <MiniChart data={trendValues} color="#8b5cf6" />
              <div className="flex justify-between mt-2">
                {trend.slice(-6).map((t: any) => (
                  <div key={t.month} className="text-center">
                    <p className="text-white text-xs font-semibold">₹{(t.earnings / 1000).toFixed(0)}k</p>
                    <p className="text-dark-500 text-[10px]">{t.month?.slice(0, 3)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-20 text-dark-500 text-sm">No earnings data yet</div>
          )}
        </div>
      </div>

      {/* Commission Rates + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Commission Rates */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />Your Commission Rates</h3>
          {packageCommissions.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 px-2 pb-1 border-b border-dark-700">
                <p className="text-dark-400 text-xs font-medium col-span-1">Package</p>
                <p className="text-green-400 text-xs font-medium text-right">L1</p>
                <p className="text-blue-400 text-xs font-medium text-right">L2</p>
                <p className="text-violet-400 text-xs font-medium text-right">L3</p>
              </div>
              {packageCommissions.map((pkg: any) => (
                <div key={pkg.packageId} className="grid grid-cols-4 gap-2 items-center p-2 rounded-xl hover:bg-dark-700 transition-colors">
                  <div className="min-w-0 col-span-1">
                    <p className="text-white text-xs font-semibold truncate">{pkg.name}</p>
                    <p className="text-dark-500 text-[10px]">₹{(pkg.price || 0).toLocaleString()}</p>
                  </div>
                  <p className="text-green-400 text-xs font-bold text-right">
                    {pkg.l1Earn > 0 ? `₹${pkg.l1Earn.toLocaleString()}` : '—'}
                  </p>
                  <p className="text-blue-400 text-xs font-bold text-right">
                    {pkg.l2Earn > 0 ? `₹${pkg.l2Earn.toLocaleString()}` : '—'}
                  </p>
                  <p className="text-violet-400 text-xs font-bold text-right">
                    {pkg.l3Earn > 0 ? `₹${pkg.l3Earn.toLocaleString()}` : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-4">No commission rates configured yet</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-green-400 text-xs">L1 = Direct referral</span>
            <span className="text-blue-400 text-xs">L2 = 2nd level</span>
            <span className="text-violet-400 text-xs">L3 = 3rd level</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-green-400" />Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/partner/link-generator', icon: Link2, label: 'Generate Affiliate Link', color: 'text-violet-400 bg-violet-900/30' },
              { href: '/partner/crm', icon: Users, label: 'View My Leads', color: 'text-blue-400 bg-blue-900/30' },
              { href: '/partner/m-type', icon: Network, label: 'View My Network Tree', color: 'text-cyan-400 bg-cyan-900/30' },
              { href: '/partner/kyc', icon: ShieldCheck, label: `KYC Status: ${user?.kyc?.status || 'Pending'}`, color: 'text-amber-400 bg-amber-900/30' },
              { href: '/partner/achievements', icon: Award, label: 'My Achievements', color: 'text-pink-400 bg-pink-900/30' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 hover:bg-dark-600 transition-all group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-white text-sm flex-1">{label}</span>
                <ChevronRight className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Referrals */}
      {topReferrals.length > 0 && (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />Top Direct Referrals</h3>
            <Link href="/partner/referrals" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">See All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {topReferrals.slice(0, 5).map((r: any, i: number) => (
              <div key={r._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{r.name}</p>
                  <p className="text-dark-400 text-xs capitalize">{r.packageTier} tier</p>
                </div>
                <span className="text-green-400 text-sm font-semibold">₹{(r.contribution || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Manager */}
      {myManager && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-700/30 rounded-2xl p-5 space-y-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Your Manager</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {myManager.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold">{myManager.name}</p>
              <p className="text-gray-400 text-sm">{myManager.email}</p>
            </div>
            <div className="ml-auto w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Recent Tips */}
          {myTips.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Latest Tips from Manager</p>
              {myTips.slice(0, 2).map((tip: any) => (
                <div key={tip._id} className="bg-dark-800/60 rounded-xl p-3 flex gap-3">
                  <span className="text-base">{tip.category === 'motivation' ? '🔥' : tip.category === 'warning' ? '⚠️' : tip.category === 'feedback' ? '💬' : tip.category === 'update' ? '📢' : '💡'}</span>
                  <p className="text-gray-300 text-sm flex-1">{tip.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Active Goals */}
          {myGoals.filter((g: any) => g.status === 'active').length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Active Goals</p>
              {myGoals.filter((g: any) => g.status === 'active').slice(0, 2).map((goal: any) => {
                const pct = Math.min(100, Math.round(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100))
                return (
                  <div key={goal._id} className="bg-dark-800/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">{goal.title}</p>
                      <span className="text-xs text-emerald-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{goal.currentValue || 0} / {goal.targetValue} {goal.unit}{goal.reward ? ` · 🎁 ${goal.reward}` : ''}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Sponsor */}
      {sponsor && (
        <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700/30 rounded-2xl p-5">
          <p className="text-dark-400 text-xs uppercase tracking-wider mb-3">Your Sponsor</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {sponsor.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold">{sponsor.name}</p>
              <p className="text-dark-400 text-sm">{sponsor.phone} · <span className="capitalize text-violet-400">{sponsor.packageTier}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
