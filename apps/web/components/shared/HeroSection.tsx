'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Star, Users, Award, BookOpen, Video, Zap, TrendingUp, CheckCircle2 } from 'lucide-react'

const features = ['Live Interactive Classes', 'AI Certificates', 'Earn via Affiliate', 'Expert Mentors']

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-fuchsia-600/8 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        {/* Grid */}
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)', backgroundSize:'40px 40px'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {/* Live badge */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
              className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-red-400 rounded-full live-dot" />
              <span className="text-red-400 text-sm font-semibold">Live Classes Happening Now</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">50,000+ Students</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Learn Live,{' '}
              <span className="shine-text">Earn Real</span>
              <br />& Grow Fast
            </motion.h1>

            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
              India's only EdTech platform with <strong className="text-white">live interactive classes</strong>,
              AI-generated certificates, and a built-in affiliate system so you can <strong className="text-violet-400">earn while you learn</strong>.
            </motion.p>

            {/* Features list */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              className="grid grid-cols-2 gap-2 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
              className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/register" className="btn-primary text-base px-8 py-4 text-center">
                Start Learning Free →
              </Link>
              <button className="flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-6 py-4 rounded-xl transition-all hover:bg-white/5 group">
                <div className="w-9 h-9 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:bg-violet-500/30 transition-all">
                  <Play className="w-4 h-4 ml-0.5 text-violet-400" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {['RS','PK','AM','SJ','NK'].map((a,i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-900 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{background:`hsl(${i*60+200},60%,45%)`}}>{a}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  <span className="text-amber-400 text-sm font-bold ml-1">4.9</span>
                </div>
                <p className="text-gray-500 text-xs">Trusted by 50,000+ learners</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Live class card visual */}
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:0.5 }}
            className="hidden lg:block relative">
            <div className="relative">
              {/* Main card */}
              <div className="border-gradient-card p-1">
                <div className="bg-dark-800 rounded-[14px] overflow-hidden">
                  {/* Class header */}
                  <div className="bg-gradient-to-r from-violet-900/60 to-indigo-900/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Full Stack Dev — Batch 12</p>
                        <p className="text-gray-400 text-xs">with Mentor Aryan Kapoor</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot inline-block" />LIVE
                    </span>
                  </div>
                  {/* Fake video */}
                  <div className="aspect-video bg-gradient-to-br from-dark-700 to-dark-900 relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize:'30px 30px'}} />
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-violet-500/30 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-violet-500/30">
                        <Play className="w-7 h-7 text-violet-300 ml-1" />
                      </div>
                      <p className="text-gray-400 text-sm">React Hooks — Live Session</p>
                    </div>
                    {/* Students count */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-300">
                      <Users className="w-3.5 h-3.5 text-violet-400" /><span>247 watching</span>
                    </div>
                  </div>
                  {/* Chat preview */}
                  <div className="p-4 space-y-2">
                    {[{u:'Rahul',m:'Sir, can you explain useEffect again?',c:'text-blue-400'},
                      {u:'Priya',m:'Great explanation! 🔥',c:'text-pink-400'},
                      {u:'Amit',m:'Getting certificate after this right?',c:'text-green-400'}].map((msg,i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={`font-semibold ${msg.c} flex-shrink-0`}>{msg.u}:</span>
                        <span className="text-gray-400">{msg.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 float bg-dark-800 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center"><Award className="w-4 h-4 text-amber-400" /></div>
                  <div><p className="text-white font-bold text-sm">Certificate</p><p className="text-gray-500 text-xs">Auto-generated</p></div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 float-delay bg-dark-800 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-400" /></div>
                  <div><p className="text-white font-bold text-sm">₹15,000</p><p className="text-gray-500 text-xs">Affiliate earned</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:Users, val:'50K+', label:'Active Learners', color:'text-violet-400', bg:'bg-violet-500/10' },
            { icon:BookOpen, val:'500+', label:'Expert Courses', color:'text-indigo-400', bg:'bg-indigo-500/10' },
            { icon:Award, val:'20K+', label:'Certificates', color:'text-amber-400', bg:'bg-amber-500/10' },
            { icon:Zap, val:'₹2Cr+', label:'Affiliate Earnings', color:'text-green-400', bg:'bg-green-500/10' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:border-violet-500/30 transition-all">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-white font-black text-lg leading-tight">{s.val}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
