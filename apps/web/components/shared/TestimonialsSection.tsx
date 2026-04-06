'use client'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonials = [
  { name:'Rahul Sharma', role:'Full Stack Dev @ TCS', avatar:'RS', review:'TruLearnix live classes changed everything. Got placed at TCS within 2 months of completing the course!', rating:5, earned:'', color:'from-violet-500 to-indigo-500' },
  { name:'Priya Singh', role:'Data Scientist', avatar:'PS', review:'The AI certificate is literally accepted everywhere. 40% salary hike after completing Data Science course.', rating:5, earned:'40% hike', color:'from-pink-500 to-rose-500' },
  { name:'Amit Kumar', role:'UI/UX Designer', avatar:'AK', review:'Best platform for design. And the affiliate program is insane — I earned ₹15,000 referring just 5 friends!', rating:5, earned:'₹15K earned', color:'from-blue-500 to-cyan-500' },
  { name:'Sneha Patel', role:'Digital Marketer', avatar:'SP', review:'Live classes with actual Q&A sessions make all the difference. Not just recorded videos like others.', rating:5, earned:'₹25K earned', color:'from-green-500 to-emerald-500' },
  { name:'Vikash Gupta', role:'React Native Dev', avatar:'VG', review:'The mock interviews and live projects helped me build an actual portfolio. Now working remotely!', rating:5, earned:'', color:'from-amber-500 to-orange-500' },
  { name:'Neha Joshi', role:'Cloud Engineer @ AWS', avatar:'NJ', review:'Got AWS certified through TruLearnix. The structured path and hands-on labs are world-class.', rating:5, earned:'Got certified', color:'from-teal-500 to-cyan-500' },
  { name:'Rohan Verma', role:'Freelancer', avatar:'RV', review:'From ₹0 to ₹50K/month freelancing after completing the Web Dev bootcamp. Life-changing platform!', rating:5, earned:'₹50K/month', color:'from-purple-500 to-violet-500' },
  { name:'Divya Nair', role:'Product Manager', avatar:'DN', review:'The mentorship sessions are incredibly personalized. My mentor actually knows my name and progress!', rating:5, earned:'', color:'from-red-500 to-pink-500' },
]

function TestCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-80 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-violet-500/30 hover:bg-white/[0.06] transition-all mx-3">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(t.rating)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
        {t.earned && (
          <span className="ml-auto text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            {t.earned}
          </span>
        )}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.review}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{t.avatar}</div>
        <div>
          <p className="font-semibold text-white text-sm">{t.name}</p>
          <p className="text-xs text-gray-500">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const doubled = [...testimonials, ...testimonials]
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <motion.span initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
          SUCCESS STORIES
        </motion.span>
        <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-4xl md:text-5xl font-black text-white mb-4">
          Real Students, <span className="gradient-text">Real Results</span>
        </motion.h2>
        <p className="text-gray-400 max-w-xl mx-auto">Join thousands who transformed careers with TruLearnix</p>
      </div>

      {/* Auto-scrolling marquee row 1 */}
      <div className="relative mb-4 overflow-hidden">
        <div className="flex marquee-track">
          {doubled.map((t, i) => <TestCard key={i} t={t} />)}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative overflow-hidden">
        <div className="flex marquee-track" style={{ animationDirection:'reverse', animationDuration:'40s' }}>
          {[...doubled].reverse().map((t, i) => <TestCard key={i} t={t} />)}
        </div>
      </div>
    </section>
  )
}
