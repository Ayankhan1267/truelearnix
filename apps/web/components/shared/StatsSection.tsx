'use client'
import { motion } from 'framer-motion'
import { Users, BookOpen, Award, TrendingUp, Star, Globe, Video, Zap } from 'lucide-react'

const stats = [
  { icon: Users, value: '50,000+', label: 'Active Students', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Video, value: '1,200+', label: 'Live Sessions Done', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { icon: BookOpen, value: '500+', label: 'Expert Courses', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Award, value: '20,000+', label: 'Certificates Issued', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: TrendingUp, value: '₹2Cr+', label: 'Affiliate Earnings', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { icon: Star, value: '4.9/5', label: 'Platform Rating', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: Globe, value: '50+', label: 'Cities Covered', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: Zap, value: '98%', label: 'Completion Rate', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
]

export default function StatsSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background gradient line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.07 }} viewport={{ once:true }}
              className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center hover:scale-105 transition-transform`}>
              <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[11px] text-gray-500 leading-tight">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
