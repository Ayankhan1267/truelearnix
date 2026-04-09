'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { packageAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  Rocket, Flame, Shield, Crown, Check, Zap, ArrowRight,
  Star, ChevronRight, Sparkles, Lock
} from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    tier: 'starter', name: 'Starter', price: 4999,
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.35)',
    border: 'rgba(59,130,246,0.3)',
    accent: '#60a5fa',
    bg: 'from-blue-600/12 to-cyan-600/8',
    badge: '',
  },
  {
    tier: 'pro', name: 'Pro', price: 9999,
    icon: Flame,
    gradient: 'from-violet-500 to-fuchsia-500',
    glow: 'rgba(139,92,246,0.4)',
    border: 'rgba(139,92,246,0.35)',
    accent: '#a78bfa',
    bg: 'from-violet-600/15 to-fuchsia-600/10',
    badge: 'Most Popular',
  },
  {
    tier: 'elite', name: 'Elite', price: 19999,
    icon: Shield,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.4)',
    border: 'rgba(245,158,11,0.35)',
    accent: '#fbbf24',
    bg: 'from-amber-600/12 to-orange-600/8',
    badge: 'Best Value',
  },
  {
    tier: 'supreme', name: 'Supreme', price: 29999,
    icon: Crown,
    gradient: 'from-rose-500 to-pink-500',
    glow: 'rgba(244,63,94,0.4)',
    border: 'rgba(244,63,94,0.35)',
    accent: '#fb7185',
    bg: 'from-rose-600/12 to-pink-600/8',
    badge: 'All Access',
  },
]

const FEATURES: Record<string, string[]> = {
  starter: ['All Courses Access', 'Live Classes', 'Community Access', 'AI Coach Basic', 'Certificate Generation', 'Job Engine Access'],
  pro: ['Everything in Starter', 'Priority Support', 'Personal Brand Tools', 'Advanced AI Coach', 'Quiz & Assignments', 'Mentor 1-on-1 (2/month)'],
  elite: ['Everything in Pro', 'Unlimited Mentor Sessions', 'Personal Brand Kit', 'Premium Community', 'Early Access to New Courses', 'Career Placement Support'],
  supreme: ['Everything in Elite', 'Lifetime Access', 'Dedicated Success Manager', 'White-glove Onboarding', 'Custom Learning Path', 'Guaranteed Placement'],
}

const TIER_ORDER = ['free', 'starter', 'pro', 'elite', 'supreme']

export default function UpgradePage() {
  const { user } = useAuthStore()
  const currentTier = (user as any)?.packageTier || 'free'
  const currentIdx = TIER_ORDER.indexOf(currentTier)

  const { data: pkgs } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageAPI.getAll().then(r => r.data.packages)
  })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent border border-indigo-500/20 p-5 sm:p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Upgrade Your Plan
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Level Up Your Learning</h1>
        <p className="text-gray-400 mt-2 text-sm max-w-lg mx-auto">
          Unlock all courses, live classes, AI Coach & more. Your current plan:
          <span className="text-indigo-300 font-semibold capitalize ml-1">{currentTier}</span>
        </p>
      </div>

      {/* Current plan status */}
      {currentTier !== 'free' && (
        <div className="rounded-2xl bg-dark-800 border border-white/8 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">You're on the <span className="text-indigo-300 capitalize">{currentTier}</span> plan</p>
            <p className="text-xs text-gray-500 mt-0.5">Upgrade to unlock more features & higher commission rates</p>
          </div>
          {(user as any)?.packageExpiresAt && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Expires</p>
              <p className="text-xs text-white font-medium">
                {new Date((user as any).packageExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((t, i) => {
          const tierIdx = TIER_ORDER.indexOf(t.tier)
          const isCurrent = t.tier === currentTier
          const isUpgrade = tierIdx > currentIdx
          const isLocked = tierIdx < currentIdx
          const Icon = t.icon
          const features = FEATURES[t.tier] || []
          const pkgData = pkgs?.find((p: any) => p.tier === t.tier)

          return (
            <div
              key={t.tier}
              className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                isCurrent
                  ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-600/15 to-violet-600/8'
                  : isUpgrade
                    ? `bg-gradient-to-b ${t.bg} hover:border-opacity-60 cursor-pointer`
                    : 'bg-dark-800 opacity-60'
              }`}
              style={{ borderColor: isCurrent ? 'rgba(99,102,241,0.4)' : isUpgrade ? t.border : 'rgba(255,255,255,0.06)' }}
            >
              {/* Badge */}
              {t.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${t.gradient.includes('violet') ? '#7c3aed,#d946ef' : t.gradient.includes('amber') ? '#d97706,#ea580c' : '#f43f5e,#ec4899'})`, color: '#fff' }}>
                  {t.badge}
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500 text-white whitespace-nowrap">
                  Current
                </div>
              )}

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mt-1"
                style={{ background: `linear-gradient(135deg, ${t.glow}, rgba(0,0,0,0.1))` }}>
                <Icon className="w-5 h-5" style={{ color: t.accent }} />
              </div>

              <h3 className="text-base font-bold text-white">{t.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-4">
                <span className="text-2xl font-bold" style={{ color: isUpgrade || isCurrent ? t.accent : '#9ca3af' }}>
                  ₹{(pkgData?.price || t.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-500">one-time</span>
              </div>

              <ul className="space-y-1.5 flex-1 mb-5">
                {features.slice(0, 5).map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: isUpgrade || isCurrent ? t.accent : '#6b7280' }} />
                    <span className={isUpgrade || isCurrent ? 'text-gray-300' : 'text-gray-500'}>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold text-center border border-indigo-500/25">
                  ✓ Active Plan
                </div>
              ) : isUpgrade ? (
                <Link
                  href={`/packages/${t.tier}`}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${t.glow.replace('0.35', '0.8')}, ${t.glow.replace('0.35', '0.6')})` }}
                >
                  Upgrade to {t.name} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="w-full py-2.5 rounded-xl bg-white/5 text-gray-500 text-xs font-semibold text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Already Passed
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Benefits comparison */}
      <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          Why Upgrade?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎓', title: 'All Courses', desc: 'Access every course in the library — new ones added weekly' },
            { icon: '🤖', title: 'AI Coach', desc: 'Get personalized guidance, roadmaps and Q&A from AI' },
            { icon: '📜', title: 'Certificates', desc: 'Earn verified certificates for every completed course' },
            { icon: '🎯', title: 'Live Classes', desc: 'Join live sessions with expert mentors every week' },
            { icon: '💼', title: 'Job Engine', desc: 'Exclusive job listings and placement assistance' },
            { icon: '🏆', title: 'Community', desc: 'Access to premium learner community and networking' },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-700">
              <span className="text-xl">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{b.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 via-violet-600/15 to-fuchsia-600/10 border border-indigo-500/20 p-6 text-center">
        <p className="text-white font-bold text-lg mb-1">Ready to unlock your potential?</p>
        <p className="text-gray-400 text-sm mb-4">Join thousands of learners already on their journey</p>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Sparkles className="w-4 h-4" />
          Browse All Plans
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
