'use client'
import { useQuery } from '@tanstack/react-query'
import { trulanceAPI } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Star, ExternalLink, Linkedin, Globe, Twitter, Award, Zap } from 'lucide-react'

const TIER_META: Record<string, { label: string; emoji: string; cls: string }> = {
  free: { label: 'Free', emoji: '🎓', cls: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
  starter: { label: 'Starter', emoji: '🚀', cls: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  pro: { label: 'Pro', emoji: '⚡', cls: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  elite: { label: 'Elite', emoji: '👑', cls: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  supreme: { label: 'Supreme', emoji: '💎', cls: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
}

export default function FreelancerProfile({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['freelancer', params.id],
    queryFn: () => trulanceAPI.getFreelancer(params.id).then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Freelancer not found</p>
        <Link href="/freelancers" className="btn-primary">Browse Freelancers</Link>
      </div>
    </div>
  )

  const tier = TIER_META[data.packageTier] || TIER_META.free
  const hasSocial = data.socialLinks && Object.values(data.socialLinks).some(Boolean)

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/freelancers" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Freelancers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="space-y-4">
            <div className="card text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}>
                {data.avatar
                  ? <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                  : <span className="text-white text-3xl font-black">{data.name?.[0]}</span>}
              </div>
              <h1 className="text-xl font-black text-white mb-1">{data.name}</h1>
              <span className={`badge border ${tier.cls} mb-4`}>{tier.emoji} {tier.label} Member</span>
              <p className="text-gray-400 text-sm leading-relaxed">
                {data.bio || 'TruLearnix Certified Professional'}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl py-3" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
                  <p className="text-teal-400 font-black text-2xl">{data.xpPoints || 0}</p>
                  <p className="text-xs text-gray-500 mt-0.5">XP Points</p>
                </div>
                <div className="rounded-xl py-3" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
                  <p className="text-teal-400 font-black text-2xl">{data.level || 1}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Level</p>
                </div>
              </div>
            </div>

            {hasSocial && (
              <div className="card">
                <h3 className="font-bold text-white text-sm mb-3">Connect</h3>
                <div className="space-y-2.5">
                  {data.socialLinks?.linkedin && (
                    <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-blue-400 transition-colors group">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                  )}
                  {data.socialLinks?.twitter && (
                    <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-sky-400 transition-colors group">
                      <Twitter className="w-4 h-4" /> Twitter
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                  )}
                  {data.socialLinks?.website && (
                    <a href={data.socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-teal-400 transition-colors group">
                      <Globe className="w-4 h-4" /> Portfolio
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <Link href="/post-project" className="btn-primary w-full py-3 text-sm block text-center">
              <Zap className="w-3.5 h-3.5" /> Hire {data.name?.split(' ')[0]}
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {data.expertise?.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-white mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {data.expertise.map((s: string) => (
                    <span key={s} className="px-3 py-1.5 rounded-xl text-sm font-semibold text-teal-400"
                      style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.badges?.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-white mb-4">Achievements</h2>
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((b: string) => (
                    <span key={b} className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Award className="w-3 h-3" /> {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed text-sm">
                {data.bio || `${data.name} is a certified TruLearnix professional ready to take on exciting projects. They are part of our ${tier.label} tier and actively building their career through real-world work.`}
              </p>
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)' }}>
                <p className="text-sm text-teal-400 font-medium flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  TruLearnix Verified Member · {tier.emoji} {tier.label} Tier
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
