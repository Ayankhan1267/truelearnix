'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { TrendingUp, Coins, Users, ArrowUpRight, Clock, Package } from 'lucide-react'

function Bar({ value, max, color }: { value: number, max: number, color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function EarningsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['partner-earnings'], queryFn: () => partnerAPI.earnings().then(r => r.data) })

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  const byLevel = data?.byLevel || { l1: 0, l2: 0, l3: 0 }
  const byTier = data?.byTier || {}
  const recent = data?.recentCommissions || []
  const monthly = data?.monthly || []
  const maxMonth = Math.max(...monthly.map((m: any) => m.total || 0), 1)
  const maxTier = Math.max(...Object.values(byTier as Record<string, number>), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Earnings</h1>
        <p className="text-dark-400 text-sm mt-1">Your income breakdown and insights</p>
      </div>

      {/* Level Breakdown */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-violet-400" />Commission by Level</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Level 1', value: byLevel.l1, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-900/20', text: 'text-violet-400' },
            { label: 'Level 2', value: byLevel.l2, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-900/20', text: 'text-blue-400' },
            { label: 'Level 3', value: byLevel.l3, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-900/20', text: 'text-emerald-400' },
          ].map(({ label, value, color, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-white/5 text-center`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} mx-auto mb-3 flex items-center justify-center`}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className={`${text} text-xl font-bold`}>₹{(value || 0).toLocaleString()}</p>
              <p className="text-dark-400 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By Package Tier */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-amber-400" />Revenue by Package Tier</h3>
        <div className="space-y-4">
          {['supreme', 'elite', 'pro', 'starter'].map((tier) => {
            const val = (byTier as any)[tier] || 0
            const colors: Record<string, string> = {
              supreme: 'from-rose-500 to-pink-600',
              elite: 'from-amber-500 to-orange-600',
              pro: 'from-purple-500 to-violet-600',
              starter: 'from-blue-500 to-cyan-600',
            }
            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-dark-300 text-sm capitalize">{tier}</span>
                  <span className="text-white text-sm font-semibold">₹{(val).toLocaleString()}</span>
                </div>
                <Bar value={val} max={maxTier} color={colors[tier]} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" />Monthly Trend</h3>
        {monthly.length > 0 ? (
          <div className="space-y-3">
            {monthly.map((m: any) => (
              <div key={m.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-dark-300 text-sm">{m.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-dark-400 text-xs">{m.count} commissions</span>
                    <span className="text-white text-sm font-semibold">₹{(m.total || 0).toLocaleString()}</span>
                  </div>
                </div>
                <Bar value={m.total || 0} max={maxMonth} color="from-violet-500 to-purple-600" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-dark-500">No earnings data yet. Share your affiliate link to start earning!</div>
        )}
      </div>

      {/* Recent Commissions */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />Recent Commissions</h3>
        {recent.length === 0 ? (
          <div className="text-center py-8 text-dark-500 text-sm">No commissions yet</div>
        ) : (
          <div className="space-y-3">
            {recent.map((c: any) => (
              <div key={c._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {c.from?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.from?.name || 'Unknown'}</p>
                  <p className="text-dark-400 text-xs capitalize">Level {c.level} · {c.from?.packageTier || '—'} package</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-bold">+₹{(c.amount || 0).toLocaleString()}</p>
                  <p className="text-dark-500 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
