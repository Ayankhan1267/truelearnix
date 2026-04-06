'use client'
import { motion } from 'framer-motion'
import { Video, Users, Clock, Calendar, ChevronRight, Mic, MonitorPlay } from 'lucide-react'
import Link from 'next/link'

const classes = [
  { title:'Full Stack Web Dev — Batch 12', mentor:'Aryan Kapoor', students:247, time:'Today, 7:00 PM', status:'live', tag:'Web Dev', color:'from-violet-600 to-indigo-600' },
  { title:'Data Science with Python', mentor:'Priya Mehta', students:183, time:'Today, 9:00 PM', status:'upcoming', tag:'Data Science', color:'from-blue-600 to-cyan-600' },
  { title:'UI/UX Design Masterclass', mentor:'Sakshi Jain', students:95, time:'Tomorrow, 6:30 PM', status:'upcoming', tag:'Design', color:'from-pink-600 to-rose-600' },
  { title:'React Native — Mobile Apps', mentor:'Vikram Singh', students:142, time:'Tomorrow, 8:00 PM', status:'upcoming', tag:'Mobile Dev', color:'from-green-600 to-emerald-600' },
]

const highlights = [
  { icon:Mic, title:'Ask Questions Live', desc:'Real-time Q&A with expert mentors during every session' },
  { icon:MonitorPlay, title:'Watch Recordings', desc:'Missed a class? All sessions are recorded and available 24/7' },
  { icon:Users, title:'Batch Learning', desc:'Learn with peers in structured cohort-based batches' },
  { icon:Calendar, title:'Flexible Schedule', desc:'Morning, evening & weekend batches for working professionals' },
]

export default function LiveClassesSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <motion.span initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
              className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot" />LIVE CLASSES
            </motion.span>
            <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="text-4xl md:text-5xl font-black text-white">
              Learn Live with <span className="gradient-text">Expert Mentors</span>
            </motion.h2>
          </div>
          <Link href="/live-classes" className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold text-sm whitespace-nowrap transition-colors">
            View All Classes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Classes list */}
          <div className="space-y-4">
            {classes.map((cls, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
                transition={{ delay:i*0.1 }} viewport={{ once:true }}
                className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:border-violet-500/30 hover:bg-white/[0.06] transition-all group cursor-pointer">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center flex-shrink-0`}>
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{cls.tag}</span>
                    {cls.status === 'live' ? (
                      <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot inline-block" />LIVE NOW
                      </span>
                    ) : (
                      <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20 font-semibold">UPCOMING</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm truncate group-hover:text-violet-400 transition-colors">{cls.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>by {cls.mentor}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.students}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h, i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.1 }} viewport={{ once:true }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-violet-500/30 transition-all">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-3">
                  <h.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1.5">{h.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
            <div className="col-span-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-3">🎓 Next batch starts <strong className="text-white">Monday</strong></p>
              <Link href="/register" className="btn-primary text-sm py-2.5 px-6 inline-block">
                Reserve Your Seat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
