'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Users, Clock, ChevronRight, Mic, MonitorPlay, Calendar, Sparkles, ArrowRight, Gift, Zap, Play } from 'lucide-react'
import Link from 'next/link'
import { classAPI } from '@/lib/api'

const FALLBACK_CLASSES = [
  { _id:'1', title:'Full Stack Web Dev — Batch 12', mentor:{ name:'Aryan Kapoor' }, attendees:[{},{},{},{},{}].concat(Array(242).fill({})), scheduledAt: new Date().toISOString(), status:'live', course:{ title:'Full Stack Development', category:'Web Dev' }, color:'from-violet-600 to-indigo-600', glow:'rgba(124,58,237,0.3)', tag:'Web Dev' },
  { _id:'2', title:'Data Science with Python',      mentor:{ name:'Priya Mehta' },  attendees:[{},{},{}], scheduledAt: new Date(Date.now()+3*3600000).toISOString(), status:'scheduled', course:{ title:'Data Science', category:'Data Science' }, color:'from-blue-600 to-cyan-600', glow:'rgba(6,182,212,0.25)', tag:'Data Science' },
  { _id:'3', title:'UI/UX Design Masterclass',      mentor:{ name:'Sakshi Jain' },  attendees:[{},{}], scheduledAt: new Date(Date.now()+5*3600000).toISOString(), status:'scheduled', course:{ title:'UI/UX Design', category:'Design' }, color:'from-pink-600 to-rose-600', glow:'rgba(236,72,153,0.25)', tag:'Design' },
  { _id:'4', title:'React Native — Mobile Apps',    mentor:{ name:'Vikram Singh' }, attendees:[{},{},{},{}], scheduledAt: new Date(Date.now()+22*3600000).toISOString(), status:'scheduled', course:{ title:'Mobile Dev', category:'Mobile' }, color:'from-green-600 to-emerald-600', glow:'rgba(16,185,129,0.25)', tag:'Mobile Dev' },
]

const TAG_COLORS: Record<string,string> = {
  'Web Dev': 'from-violet-600 to-indigo-600',
  'Data Science': 'from-blue-600 to-cyan-600',
  'Design': 'from-pink-600 to-rose-600',
  'Mobile': 'from-green-600 to-emerald-600',
  'Marketing': 'from-amber-600 to-orange-600',
  'Cloud': 'from-teal-500 to-cyan-600',
}
const TAG_GLOW: Record<string,string> = {
  'Web Dev': 'rgba(124,58,237,0.3)',
  'Data Science': 'rgba(6,182,212,0.25)',
  'Design': 'rgba(236,72,153,0.25)',
  'Mobile': 'rgba(16,185,129,0.25)',
  'Marketing': 'rgba(245,158,11,0.3)',
  'Cloud': 'rgba(6,182,212,0.3)',
}

function formatClassTime(scheduledAt: string) {
  const d = new Date(scheduledAt)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffM = Math.floor((diffMs % 3600000) / 60000)
  if (diffMs < 0) return 'Started'
  if (diffH === 0) return `in ${diffM}m`
  if (diffH < 24) return `in ${diffH}h ${diffM}m`
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1)
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`
  return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
}

function ClassCard({ cls, i, isFirst }: { cls: any; i: number; isFirst: boolean }) {
  const category = cls.course?.category || cls.tag || 'General'
  const gradColor = TAG_COLORS[category] || 'from-violet-600 to-indigo-600'
  const glowColor = TAG_GLOW[category] || 'rgba(124,58,237,0.3)'
  const isLive = cls.status === 'live'
  const attendeeCount = cls.attendees?.length || 0

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
      transition={{ delay:i*0.07 }} viewport={{ once:true }}
      className={`relative flex-shrink-0 w-[300px] sm:w-auto group cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden ${isLive ? 'animated-border' : ''}`}
      style={isLive ? {} : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
    >
      <div className={isLive ? 'rounded-[20px] overflow-hidden' : ''} style={isLive ? { background:'rgba(13,16,32,1)' } : {}}>
        {/* Top color band */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradColor}`} />

        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
            style={{ boxShadow:`0 8px 24px ${glowColor}` }}>
            <Video className="w-6 h-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}>{category}</span>
              {isLive ? (
                <span className="live-badge text-[10px] px-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot" />LIVE NOW
                </span>
              ) : (
                <span className="chip text-[10px]">{formatClassTime(cls.scheduledAt)}</span>
              )}
              {isFirst && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
                  <Gift className="w-2.5 h-2.5" />FREE
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-sm truncate group-hover:text-violet-400 transition-colors">{cls.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>by {cls.mentor?.name || 'Expert Mentor'}</span>
              {attendeeCount > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{attendeeCount}</span>}
            </div>
          </div>

          {isLive ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
              <Play className="w-4 h-4 text-red-400 ml-0.5" />
            </div>
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function LiveClassesSection() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classAPI.getPublic()
      .then(res => {
        const data = res.data?.classes || []
        setClasses(data.length > 0 ? data : FALLBACK_CLASSES)
      })
      .catch(() => setClasses(FALLBACK_CLASSES))
      .finally(() => setLoading(false))
  }, [])

  const displayClasses = loading ? FALLBACK_CLASSES : classes

  return (
    <section className="py-14 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 60% 60% at 80% 40%, rgba(239,68,68,0.05), transparent)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
              className="inline-flex items-center gap-2 text-xs font-black px-4 py-1.5 rounded-full mb-5"
              style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot" />LIVE CLASSES
            </motion.div>
            <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="font-black text-white leading-tight"
              style={{ fontSize:'clamp(2rem,5vw,3.5rem)' }}>
              Learn Live with{' '}
              <span className="gradient-text">Expert Mentors</span>
            </motion.h2>
          </div>
          <Link href="/live-classes" className="flex items-center gap-1.5 text-violet-400 hover:text-white font-bold text-sm whitespace-nowrap transition-colors group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* NEW USER FIRST CLASS FREE Banner */}
        <motion.div
          initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="mb-8 rounded-2xl p-4 sm:p-5 relative overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.08),rgba(124,58,237,0.10))', border:'1px solid rgba(16,185,129,0.3)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background:'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.3)' }}>
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400 font-black text-sm sm:text-base">🎁 New User Offer — First Live Class is FREE!</span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">Join any live class for free as a new user. No credit card required. Experience live learning before committing.</p>
            </div>
            <Link href="/register"
              className="flex-shrink-0 text-xs font-black px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
              style={{ background:'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow:'0 4px 20px rgba(16,185,129,0.4)' }}>
              Join Free →
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Class list */}
          <div>
            {/* Desktop stacked */}
            <div className="hidden sm:flex flex-col gap-3">
              {displayClasses.map((cls, i) => (
                <ClassCard key={cls._id || i} cls={cls} i={i} isFirst={i === 0} />
              ))}
            </div>
            {/* Mobile horizontal scroll */}
            <div className="sm:hidden scroll-track pb-3">
              {displayClasses.map((cls, i) => (
                <ClassCard key={cls._id || i} cls={cls} i={i} isFirst={i === 0} />
              ))}
            </div>
          </div>

          {/* Features + CTA */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:Mic,         title:'Ask Live',        desc:'Real-time Q&A in every session',        color:'text-violet-400', bg:'rgba(124,58,237,0.12)' },
              { icon:MonitorPlay, title:'Recordings',      desc:'All sessions recorded, 24/7 access',     color:'text-cyan-400',   bg:'rgba(6,182,212,0.12)'  },
              { icon:Users,       title:'Cohort Batches',  desc:'Learn with peers in focused batches',    color:'text-fuchsia-400',bg:'rgba(217,70,239,0.12)' },
              { icon:Calendar,    title:'Flexible Timing', desc:'Morning, evening & weekend slots',       color:'text-amber-400',  bg:'rgba(245,158,11,0.12)' },
            ].map((h, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.93 }} whileInView={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.09 }} viewport={{ once:true }}
                className="rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 group"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: h.bg }}>
                  <h.icon className={`w-5 h-5 ${h.color}`} />
                </div>
                <h3 className="font-black text-white text-sm mb-1">{h.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}

            {/* CTA card spanning full width */}
            <motion.div
              initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="col-span-2 rounded-2xl p-5 text-center relative overflow-hidden"
              style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(217,70,239,0.08),rgba(79,70,229,0.12))', border:'1px solid rgba(124,58,237,0.25)' }}>
              <Sparkles className="absolute top-3 right-4 w-5 h-5 text-violet-500/20" />
              <Zap className="absolute bottom-3 left-4 w-4 h-4 text-fuchsia-500/20" />
              <p className="text-gray-300 text-sm font-semibold mb-1">
                🎓 Next batch starts <strong className="text-white">Monday</strong>
              </p>
              <p className="text-gray-500 text-xs mb-4">Only 47 seats remaining — filling fast!</p>
              <Link href="/register" className="btn-primary text-sm py-2.5 px-8 inline-flex">
                Reserve Your Seat Free
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
