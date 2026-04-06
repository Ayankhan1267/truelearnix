'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Star, Users, Award, BookOpen, Video, Zap, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

const features = [
  'Live Interactive Classes Daily',
  'AI-Generated Certificates',
  'Earn via Affiliate Program',
  'Expert Industry Mentors',
]

export default function HeroSection() {
  return (
    <section className="hero-bg noise relative min-h-screen flex items-center overflow-hidden" style={{ background: '#050709' }}>
      {/* Animated grid overlay */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Extra glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Live pill */}
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-full px-4 py-2 mb-7"
            >
              <span className="w-2 h-2 bg-red-400 rounded-full live-dot" />
              <span className="text-red-400 text-sm font-bold tracking-wide">Live Classes Running Now</span>
              <span className="hidden sm:flex items-center gap-1 text-gray-600 text-xs">
                <span>•</span>
                <span className="text-gray-500">50K+ Students</span>
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="font-black leading-[1.05] mb-6 tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
            >
              <span className="text-white">Learn Live,</span>{' '}
              <span className="gradient-shift-text">Earn Real</span>
              <br />
              <span className="text-white">&amp; </span>
              <span className="gradient-text">Grow Fast</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl"
            >
              India's only EdTech platform combining{' '}
              <strong className="text-white">live interactive classes</strong>,
              AI-generated certificates &amp; a built-in affiliate system — so you can{' '}
              <strong className="text-violet-400">earn while you learn</strong>.
            </motion.p>

            {/* Feature checklist */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 mb-9"
            >
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link href="/register" className="btn-primary text-base px-9 py-4 text-center group">
                Start Learning Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-outline text-base px-7 py-4 group">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/30 transition-all flex-shrink-0">
                  <Play className="w-3.5 h-3.5 ml-0.5 text-violet-400" />
                </div>
                Watch Demo
              </button>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="flex items-center gap-5 flex-wrap"
            >
              <div className="flex -space-x-2.5">
                {['RS', 'PK', 'AM', 'SJ', 'NK'].map((a, i) => (
                  <div key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#050709] flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                    style={{ background: `hsl(${i * 55 + 200},65%,48%)` }}
                  >{a}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-amber-400 text-sm font-black ml-1">4.9</span>
                </div>
                <p className="text-gray-500 text-xs">Trusted by 50,000+ learners across India</p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — Live class visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:block relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)', filter: 'blur(30px)' }} />

            {/* Main card with animated border */}
            <div className="animated-border relative">
              <div className="rounded-[19px] overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #0d0f1a, #0a0c14)' }}>

                {/* Class header */}
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.15), rgba(79,70,229,0.10))' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                      <Video className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Full Stack Dev — Batch 12</p>
                      <p className="text-gray-500 text-xs">with Mentor Aryan Kapoor</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot" />
                    LIVE
                  </span>
                </div>

                {/* Video area */}
                <div className="relative aspect-video flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #0d1120, #0a0c14)' }}>
                  <div className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
                      backgroundSize: '28px 28px'
                    }} />
                  {/* Center play button */}
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-violet-500/25 border border-violet-500/40 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                      style={{ boxShadow: '0 0 40px rgba(124,58,237,0.35)' }}>
                      <Play className="w-9 h-9 text-white ml-1" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">React Hooks Deep Dive</p>
                    <p className="text-gray-600 text-xs mt-1">Session 8 of 24</p>
                  </div>
                  {/* Watchers badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-300"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span className="font-semibold">247 watching</span>
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-4 right-4 rounded-xl px-3 py-2 text-xs text-gray-300"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <span className="font-semibold">1:24:35</span>
                  </div>
                </div>

                {/* Live chat */}
                <div className="p-4 space-y-2.5 border-t border-white/[0.06]">
                  {[
                    { u: 'Rahul', m: 'Sir, can you explain useEffect again?', c: 'text-blue-400' },
                    { u: 'Priya', m: 'Great explanation! 🔥 Finally understood!', c: 'text-pink-400' },
                    { u: 'Amit', m: 'Getting certificate after this right?', c: 'text-green-400' },
                  ].map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={`font-bold ${msg.c} flex-shrink-0`}>{msg.u}:</span>
                      <span className="text-gray-400">{msg.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — Certificate */}
            <div className="absolute -top-5 -right-5 float rounded-2xl px-4 py-3 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #1a1f35, #131826)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Certificate</p>
                  <p className="text-gray-500 text-xs">AI-Generated</p>
                </div>
              </div>
            </div>

            {/* Floating badge — Earnings */}
            <div className="absolute -bottom-5 -left-5 float-2 rounded-2xl px-4 py-3 shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0f1f18, #0a1410)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">₹15,000</p>
                  <p className="text-gray-500 text-xs">Affiliate Earned</p>
                </div>
              </div>
            </div>

            {/* Floating badge — Students */}
            <div className="absolute top-1/2 -left-7 float-3 rounded-2xl px-3 py-2.5 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #160c2d, #0d0a1e)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-black text-xs">50K+</p>
                  <p className="text-gray-600 text-[10px]">Learners</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── STATS BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: Users, val: '50K+', label: 'Active Learners', color: 'text-violet-400', glow: 'rgba(124,58,237,0.15)' },
            { icon: BookOpen, val: '500+', label: 'Expert Courses', color: 'text-indigo-400', glow: 'rgba(99,102,241,0.15)' },
            { icon: Award, val: '20K+', label: 'Certificates Issued', color: 'text-amber-400', glow: 'rgba(245,158,11,0.15)' },
            { icon: Zap, val: '₹2Cr+', label: 'Affiliate Earnings', color: 'text-green-400', glow: 'rgba(34,197,94,0.15)' },
          ].map((s, i) => (
            <div key={i}
              className="flex items-center gap-3 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-200 cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.glow }}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-white font-black text-xl leading-tight">{s.val}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
