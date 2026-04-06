'use client'
import { motion } from 'framer-motion'
import { UserPlus, Search, Video, Award, DollarSign, ArrowRight } from 'lucide-react'

const steps = [
  { icon: UserPlus, step: '01', title: 'Create Account', desc: 'Sign up free in 30 seconds. No credit card needed.', color: 'from-violet-500 to-indigo-500', shadow: 'shadow-violet-500/20' },
  { icon: Search, step: '02', title: 'Choose Course', desc: 'Browse 500+ expert-curated courses across tech, design & business.', color: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20' },
  { icon: Video, step: '03', title: 'Join Live Classes', desc: 'Attend live interactive sessions with real mentors. Ask questions, get answers.', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
  { icon: Award, step: '04', title: 'Get Certified', desc: 'Complete quizzes & assignments. Download your AI-generated certificate.', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
  { icon: DollarSign, step: '05', title: 'Earn Money', desc: 'Refer friends via your affiliate link. Earn commissions on every enrollment.', color: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20' },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            SIMPLE PROCESS
          </motion.span>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-4xl md:text-5xl font-black text-white mb-4">
            From Zero to <span className="gradient-text">Certified Pro</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">5 simple steps to transform your career</p>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:grid grid-cols-5 gap-4 relative">
          {/* Connector line */}
          <div className="absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0" />

          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.12 }} viewport={{ once:true }}
              className="relative text-center group">
              {/* Step circle */}
              <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg ${s.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-9 h-9 text-white" />
              </div>
              <div className="absolute top-0 right-4 text-5xl font-black text-white/[0.04]">{s.step}</div>
              <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>

              {i < steps.length - 1 && (
                <div className="absolute top-9 -right-3 z-10 w-6 h-6 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-violet-500/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative pl-12">
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-500/50 to-transparent" />
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              transition={{ delay:i*0.1 }} viewport={{ once:true }}
              className="relative mb-8 last:mb-0">
              {/* Node */}
              <div className={`absolute -left-12 w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-gray-600">{s.step}</span>
                  <h3 className="font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
