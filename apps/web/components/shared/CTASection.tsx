'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Video, Award } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px]" />
      </div>
      <div className="max-w-4xl mx-auto relative">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="rounded-3xl overflow-hidden border border-violet-500/20"
          style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(99,102,241,0.12))' }}>
          {/* Top banner */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 py-2 px-4 text-center">
            <p className="text-white text-xs font-semibold">🎉 Limited Offer — First month FREE with code <strong>LEARN2024</strong></p>
          </div>
          <div className="p-10 md:p-14 text-center">
            <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
              {[{icon:Video,label:'Live Classes'},{icon:Award,label:'AI Certificate'},{icon:Zap,label:'Earn Affiliate'}].map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <f.icon className="w-4 h-4 text-violet-400" />{f.label}
                </div>
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Ready to <span className="gradient-text">Transform</span><br />Your Career?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join 50,000+ learners. Start with free courses, attend live classes, earn certificates, and grow your income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-10 py-4 flex items-center justify-center gap-2">
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/courses" className="btn-secondary text-lg px-10 py-4 text-center">
                Browse Courses
              </Link>
            </div>
            <p className="text-gray-600 text-xs mt-6">No credit card required • Cancel anytime • 30-day money back guarantee</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
