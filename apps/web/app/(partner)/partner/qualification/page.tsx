'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { Star, Trophy, Target, CheckCircle, Lock, ArrowRight } from 'lucide-react'

export default function QualificationPage() {
  const { data, isLoading } = useQuery({ queryKey: ['partner-qualification'], queryFn: () => partnerAPI.qualification().then(r => r.data) })

  if (isLoading) return (
    <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
  )

  const milestones = data?.milestones || []
  const current = data?.current || {}

  const rewardColors = [
    'from-slate-500 to-slate-600',
    'from-blue-500 to-cyan-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-red-500 to-rose-600',
    'from-yellow-400 to-amber-500',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Qualification</h1>
        <p className="text-dark-400 text-sm mt-1">Sales milestones and rewards program</p>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-dark-400 text-xs uppercase tracking-wider">Current Status</p>
            <p className="text-white text-xl font-bold mt-1">{current.title || 'Newcomer'}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-violet-400" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center mt-2">
          <div className="bg-dark-900/40 rounded-xl p-2">
            <p className="text-white font-bold">{current.totalSales || 0}</p>
            <p className="text-dark-400 text-xs">Total Sales</p>
          </div>
          <div className="bg-dark-900/40 rounded-xl p-2">
            <p className="text-white font-bold">{current.totalReferrals || 0}</p>
            <p className="text-dark-400 text-xs">Referrals</p>
          </div>
          <div className="bg-dark-900/40 rounded-xl p-2">
            <p className="text-green-400 font-bold">₹{(current.totalEarnings || 0).toLocaleString()}</p>
            <p className="text-dark-400 text-xs">Earned</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-amber-400" />Milestones & Rewards</h3>
        {milestones.map((m: any, i: number) => {
          const achieved = m.achieved
          const inProgress = !achieved && (m.type === 'sales' ? (current.totalSales || 0) > 0 : (current.totalReferrals || 0) > 0)
          const progress = m.type === 'sales'
            ? Math.min(100, ((current.totalSales || 0) / m.target) * 100)
            : Math.min(100, ((current.totalReferrals || 0) / m.target) * 100)
          const current_val = m.type === 'sales' ? (current.totalSales || 0) : (current.totalReferrals || 0)

          return (
            <div key={i} className={`rounded-2xl border overflow-hidden transition-all ${achieved ? 'border-green-500/30 bg-green-900/10' : 'border-dark-700 bg-dark-800'}`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rewardColors[i % rewardColors.length]} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {m.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold">{m.title}</p>
                      {achieved && <CheckCircle className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-dark-400 text-sm mt-0.5">{m.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded-lg">
                        {m.type === 'sales' ? `${m.target} sales` : `${m.target} referrals`}
                      </span>
                      <ArrowRight className="w-3 h-3 text-dark-500" />
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${achieved ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                        🏆 {m.reward}
                      </span>
                    </div>
                  </div>
                  {achieved ? (
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl font-semibold">Achieved</span>
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-dark-500 flex-shrink-0 mt-1" />
                  )}
                </div>

                {/* Progress bar */}
                {!achieved && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-dark-400 mb-1.5">
                      <span>{current_val} / {m.target} {m.type === 'sales' ? 'sales' : 'referrals'}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${rewardColors[i % rewardColors.length]} transition-all`}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
