'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Video, Award, DollarSign, ArrowRight } from 'lucide-react'

const STEP_META = [
  { icon: UserPlus,   color: 'from-violet-500 to-indigo-500',  glow: 'rgba(124,58,237,0.4)',  solid: '#7c3aed' },
  { icon: Search,     color: 'from-indigo-500 to-blue-500',    glow: 'rgba(99,102,241,0.4)',  solid: '#6366f1' },
  { icon: Video,      color: 'from-blue-500 to-cyan-500',      glow: 'rgba(59,130,246,0.4)',  solid: '#3b82f6' },
  { icon: Award,      color: 'from-amber-500 to-orange-500',   glow: 'rgba(245,158,11,0.4)',  solid: '#f59e0b' },
  { icon: DollarSign, color: 'from-green-500 to-emerald-500',  glow: 'rgba(34,197,94,0.4)',   solid: '#22c55e' },
]

const DEFAULT_STEPS = [
  { title: 'Create Account',  desc: 'Sign up free in 30 seconds. No credit card needed.' },
  { title: 'Choose Course',   desc: 'Browse 500+ expert-curated courses across tech, design & business.' },
  { title: 'Join Live Class', desc: 'Attend live interactive sessions with real mentors. Ask questions, get instant answers.' },
  { title: 'Get Certified',   desc: 'Complete quizzes & assignments. Download your AI-generated certificate instantly.' },
  { title: 'Earn Money',      desc: 'Help others learn skills — earn income on every successful enrollment.' },
]

export default function HowItWorks() {
  const [stepData, setStepData] = useState(DEFAULT_STEPS)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/steps`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.steps?.length) setStepData(d.data.steps) })
      .catch(() => {})
  }, [])

  const steps = stepData.map((s, i) => ({ ...s, ...STEP_META[i % STEP_META.length], step: `0${i + 1}` }))
  return (
    <section className="py-10 md:py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.05) 50%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-7 md:mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="section-label mb-5">
            SIMPLE PROCESS
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight text-3d">
            From Zero to{' '}
            <span className="gradient-text">Certified Pro</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            5 simple steps to transform your career and start earning
          </p>
        </div>

        {/* Desktop: horizontal 3D flow */}
        <div className="hidden md:grid grid-cols-5 gap-5 relative scene-3d">
          <div className="absolute top-[38px] left-[calc(10%+20px)] right-[calc(10%+20px)] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0), rgba(124,58,237,0.6), rgba(99,102,241,0.6), rgba(34,197,94,0.5), rgba(34,197,94,0))' }} />

          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 40, rotateX: -25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.13, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              viewport={{ once: true }}
              className="relative text-center group">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[5rem] font-black leading-none pointer-events-none select-none"
                style={{ color: 'rgba(255,255,255,0.025)' }}>{s.step}</div>
              <div className="relative mx-auto w-[76px] h-[76px] mb-5">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.color} translate-y-2 opacity-30 blur-sm`} />
                <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 12px 40px ${s.glow}, 0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`, animation: `float3d ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>
                  <s.icon className="w-9 h-9 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
                </div>
              </div>
              <h3 className="font-black text-white mb-2 text-sm">{s.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-8 -right-3 z-10">
                  <ArrowRight className="w-5 h-5 text-violet-500/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: horizontal auto-scroll marquee */}
        <div className="md:hidden">
          {/* Connector dots row */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.solid }} />
                {i < steps.length - 1 && <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />}
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-6 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #050709, transparent)' }} />
            <div className="absolute inset-y-0 right-0 w-6 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(270deg, #050709, transparent)' }} />

            {/* Snap-scroll container */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {steps.map((s, i) => (
                  <div key={i}
                    className="flex-shrink-0 w-[220px] rounded-2xl p-5 text-center"
                    style={{ scrollSnapAlign: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.solid}33` }}>
                    {/* Step icon */}
                    <div className="relative mx-auto w-14 h-14 mb-4">
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${s.color} translate-y-1.5 opacity-30 blur-sm`} />
                      <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}
                        style={{ boxShadow: `0 8px 24px ${s.glow}` }}>
                        <s.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-600 mb-1">{s.step}</div>
                    <h3 className="font-black text-white text-sm mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Swipe hint */}
          <p className="text-center text-gray-600 text-[10px] mt-3 tracking-wide">← swipe to see all steps →</p>
        </div>

      </div>
    </section>
  )
}
