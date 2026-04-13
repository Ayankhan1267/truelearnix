'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Users, TrendingUp, Crown, Star, Loader2, Copy, Check, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const TIER_GRAD: Record<string, string> = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  elite: 'from-amber-500 to-orange-500',
  supreme: 'from-rose-500 to-pink-600',
}
const TIER_BADGE: Record<string, string> = {
  free: 'bg-gray-600/30 text-gray-300 border-gray-500/30',
  starter: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  elite: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  supreme: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

const LEVELS = [
  { key: 'l1', n: 1, label: 'Level 1', sub: 'Your direct referrals', color: '#8b5cf6', light: 'violet', grad: 'from-violet-600 to-violet-500', ring: 'ring-violet-500/40', glow: 'shadow-violet-500/30', bg: 'bg-violet-500/10 border-violet-500/20', header: 'from-violet-900/80 to-violet-800/40', dot: 'bg-violet-500' },
  { key: 'l2', n: 2, label: 'Level 2', sub: 'Referrals of Level 1', color: '#3b82f6', light: 'blue', grad: 'from-blue-600 to-blue-500', ring: 'ring-blue-500/40', glow: 'shadow-blue-500/30', bg: 'bg-blue-500/10 border-blue-500/20', header: 'from-blue-900/80 to-blue-800/40', dot: 'bg-blue-500' },
  { key: 'l3', n: 3, label: 'Level 3', sub: 'Referrals of Level 2', color: '#06b6d4', light: 'cyan', grad: 'from-cyan-600 to-cyan-500', ring: 'ring-cyan-500/40', glow: 'shadow-cyan-500/30', bg: 'bg-cyan-500/10 border-cyan-500/20', header: 'from-cyan-900/80 to-cyan-800/40', dot: 'bg-cyan-500' },
]

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'
  return '₹' + n
}
function fmtFull(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function MemberPill({ m }: { m: any }) {
  const grad = TIER_GRAD[m.packageTier] || TIER_GRAD.free
  const badge = TIER_BADGE[m.packageTier] || TIER_BADGE.free
  return (
    <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 transition-all group cursor-default">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {m.name?.[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-white text-xs font-semibold truncate">{m.name}</p>
          {m.isAffiliate && <Star className="w-2.5 h-2.5 text-violet-400 flex-shrink-0" />}
        </div>
        <span className={`text-xs px-1.5 py-0 rounded-full border capitalize ${badge}`}>{m.packageTier || 'free'}</span>
      </div>
      {m.totalEarnings > 0 && (
        <p className="text-green-400 text-xs font-bold flex-shrink-0">{fmt(m.totalEarnings)}</p>
      )}
    </div>
  )
}

function LevelNode({ lv, members, earnings, idx }: { lv: typeof LEVELS[0]; members: any[]; earnings: number; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  const paid = members.filter(m => m.packageTier && m.packageTier !== 'free').length

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Connector line from above */}
      <div className="flex flex-col items-center">
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-white/5" />
        <div className={`w-3 h-3 rounded-full ${lv.dot} ring-4 ${lv.ring} shadow-lg ${lv.glow}`} />
        <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
      </div>

      {/* Level card */}
      <div className={`w-full rounded-2xl border ${lv.bg} overflow-hidden shadow-lg ${lv.glow}`} style={{ boxShadow: `0 0 30px ${lv.color}18` }}>
        {/* Header */}
        <button
          className={`w-full bg-gradient-to-r ${lv.header} px-5 py-4 flex items-center justify-between`}
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lv.grad} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-black text-sm">L{lv.n}</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold">{lv.label}</p>
              <p className="text-white/50 text-xs">{lv.sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-5">
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-none">{members.length}</p>
                <p className="text-white/40 text-xs mt-0.5">members</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-none">{paid}</p>
                <p className="text-white/40 text-xs mt-0.5">paid</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 font-bold text-lg leading-none">{fmt(earnings)}</p>
                <p className="text-white/40 text-xs mt-0.5">earned</p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              {open ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
            </div>
          </div>
        </button>

        {/* Mobile stats */}
        {open && (
          <div className="sm:hidden px-5 py-3 flex justify-around border-b border-white/5">
            <div className="text-center"><p className="text-white font-bold">{members.length}</p><p className="text-white/40 text-xs">Members</p></div>
            <div className="text-center"><p className="text-white font-bold">{paid}</p><p className="text-white/40 text-xs">Paid</p></div>
            <div className="text-center"><p className="text-green-400 font-bold">{fmt(earnings)}</p><p className="text-white/40 text-xs">Earned</p></div>
          </div>
        )}

        {/* Members grid */}
        {open && (
          <div className="p-4">
            {members.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No {lv.label} members yet</p>
                <p className="text-white/20 text-xs mt-1">Share your code to grow</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {members.map((m: any) => <MemberPill key={m._id} m={m} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MTypePage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['partner-m-type'],
    queryFn: () => partnerAPI.mType().then(r => r.data),
  })

  const l1: any[] = data?.l1 || []
  const l2: any[] = data?.l2 || []
  const l3: any[] = data?.l3 || []
  const teamEarnings: any[] = data?.teamEarnings || []
  const getEarnings = (n: number) => teamEarnings.find((e: any) => e._id === n)?.total || 0
  const totalEarnings = getEarnings(1) + getEarnings(2) + getEarnings(3)

  const copyCode = () => {
    navigator.clipboard.writeText(user?.affiliateCode || '')
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-violet-500/20 animate-ping absolute inset-0" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center relative">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
        </div>
        <p className="text-dark-400 text-sm">Loading your network...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-white text-2xl font-bold">M-Type Network</h1>
        <p className="text-dark-400 text-sm mt-0.5">Your 3-level referral network flow</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Team', value: l1.length + l2.length + l3.length, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'Total Earned', value: fmtFull(totalEarnings), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'L1 Direct', value: l1.length, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'L2 + L3', value: l2.length + l3.length, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} p-4 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className={`${color} font-bold text-lg leading-none`}>{value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Flow tree */}
      <div className="flex flex-col items-center w-full">

        {/* ROOT — You */}
        <div className="relative w-full max-w-md">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-xl" />
          <div className="relative rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-950 to-purple-950 p-5"
            style={{ boxShadow: '0 0 40px #7c3aed30, 0 0 80px #7c3aed10' }}>
            <div className="flex items-center gap-4">
              {/* Avatar with rings */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 blur-md opacity-50 scale-110" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-black ring-2 ring-violet-400/50">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-dark-900">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-lg leading-none">{user?.name}</p>
                <p className="text-violet-300/70 text-xs mt-1 capitalize">{user?.packageTier} · Root Node</p>
                <button
                  onClick={copyCode}
                  className="mt-2 flex items-center gap-1.5 text-xs bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="font-mono font-semibold">{user?.affiliateCode}</span>
                </button>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-green-400 font-black text-lg">{fmt(totalEarnings)}</p>
                <p className="text-white/30 text-xs mt-0.5">earned</p>
                <p className="text-violet-300 font-bold mt-1">{l1.length + l2.length + l3.length}</p>
                <p className="text-white/30 text-xs">team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Levels */}
        {LEVELS.map((lv, i) => (
          <LevelNode
            key={lv.key}
            lv={lv}
            members={data?.[lv.key] || []}
            earnings={getEarnings(lv.n)}
            idx={i}
          />
        ))}

        {/* Bottom cap */}
        <div className="flex flex-col items-center mt-2">
          <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  )
}
