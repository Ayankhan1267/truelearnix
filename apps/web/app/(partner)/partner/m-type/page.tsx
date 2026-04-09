'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Network, ChevronDown, ChevronRight, Users, Coins, Crown } from 'lucide-react'

const tierColors: Record<string, string> = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  elite: 'from-amber-500 to-orange-500',
  supreme: 'from-rose-500 to-pink-600',
}

function MemberCard({ member, level }: { member: any, level: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = member.children && member.children.length > 0
  const levelColors = ['border-violet-500/50 bg-violet-900/20', 'border-blue-500/50 bg-blue-900/20', 'border-cyan-500/50 bg-cyan-900/20']
  const levelBg = levelColors[level - 1] || levelColors[2]

  return (
    <div className={`rounded-xl border ${levelBg} overflow-hidden`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => hasChildren && setExpanded(!expanded)}>
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tierColors[member.packageTier || 'free']} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {member.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{member.name}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${tierColors[member.packageTier || 'free']} text-white capitalize`}>{member.packageTier || 'free'}</span>
            {member.isAffiliate && <span className="text-xs text-green-400">Partner</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {member.totalEarnings > 0 && <p className="text-green-400 text-xs font-semibold">₹{member.totalEarnings.toLocaleString()}</p>}
          {hasChildren && (
            <div className="flex items-center gap-1 text-dark-400 text-xs justify-end mt-1">
              <Users className="w-3 h-3" />{member.children.length}
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="pl-5 pb-3 pr-3 space-y-2 border-t border-white/5 pt-2">
          {member.children.map((child: any) => (
            <MemberCard key={child._id} member={child} level={Math.min(level + 1, 3)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MTypePage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['partner-m-type'], queryFn: () => partnerAPI.mType().then(r => r.data) })

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  const tree = data?.tree || []
  const summary = data?.summary || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">M-Type Network Tree</h1>
        <p className="text-dark-400 text-sm mt-1">Your multi-level referral network visualization</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'L1 Members', value: summary.l1Count || 0, color: 'text-violet-400', sub: `${summary.l1Active || 0} paid` },
          { label: 'L2 Members', value: summary.l2Count || 0, color: 'text-blue-400', sub: `${summary.l2Active || 0} paid` },
          { label: 'L3 Members', value: summary.l3Count || 0, color: 'text-cyan-400', sub: `${summary.l3Active || 0} paid` },
          { label: 'Team Earnings', value: `₹${(summary.teamEarnings || 0).toLocaleString()}`, color: 'text-green-400', sub: 'Total contributed' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <p className={`${color} text-xl font-bold`}>{value}</p>
            <p className="text-white text-xs font-medium mt-1">{label}</p>
            <p className="text-dark-500 text-xs">{sub}</p>
          </div>
        ))}
      </div>

      {/* You (root) */}
      <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/40 rounded-2xl p-4 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tierColors[user?.packageTier || 'free']} flex items-center justify-center text-white font-bold text-lg`}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-bold">{user?.name}</p>
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-dark-400 text-sm">You · Code: <span className="text-violet-400 font-mono">{user?.affiliateCode}</span></p>
        </div>
      </div>

      {/* Tree */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-violet-500/50 border border-violet-500" /> L1</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-500" /> L2</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-500/50 border border-cyan-500" /> L3</div>
          <span className="text-dark-500">(tap to expand)</span>
        </div>
        {tree.length === 0 ? (
          <div className="text-center py-16 bg-dark-800 rounded-2xl border border-dark-700">
            <Network className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400 font-medium">No referrals yet</p>
            <p className="text-dark-500 text-sm mt-1">Share your affiliate link to grow your network</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tree.map((member: any) => (
              <MemberCard key={member._id} member={member} level={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
