'use client'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const plans = [
  {
    name:'Free', price:'₹0', period:'forever', desc:'Start your journey',
    features:['5 Free courses access','Community forum','Basic certificates','5 quiz attempts/month'],
    cta:'Get Started Free', href:'/register', highlight:false, badge:null
  },
  {
    name:'Pro', price:'₹999', period:'/month', desc:'For serious learners',
    features:['All 500+ courses','Live class access','Premium AI certificates','Unlimited quizzes','Download recordings','Priority support','Affiliate program (10%)','Mock interviews'],
    cta:'Start Pro Now', href:'/register?plan=pro', highlight:true, badge:'Most Popular'
  },
  {
    name:'Mentor', price:'₹1,999', period:'/month', desc:'Teach & earn',
    features:['Everything in Pro','Create & sell courses','Host live classes','Student analytics dashboard','70% revenue share','Dedicated mentor support','Custom course branding'],
    cta:'Become a Mentor', href:'/register?role=mentor', highlight:false, badge:'For Educators'
  }
]

export default function PricingSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            PRICING PLANS
          </motion.span>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-4xl md:text-5xl font-black text-white mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </motion.h2>
          <p className="text-gray-400">Start free, upgrade when ready. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.1 }} viewport={{ once:true }}
              className={`relative rounded-3xl p-8 ${plan.highlight
                ? 'bg-gradient-to-b from-violet-600/30 to-indigo-600/20 border border-violet-500/50 shadow-[0_0_60px_rgba(139,92,246,0.2)] md:scale-105'
                : 'bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30'} transition-all`}>

              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${plan.highlight ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white' : 'bg-white/10 text-gray-300 border border-white/10'}`}>
                  {plan.highlight && <Zap className="w-3 h-3 inline mr-1" />}{plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f,j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-400' : 'text-gray-500'}`} />{f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={`block text-center py-3.5 rounded-2xl font-bold text-sm transition-all ${plan.highlight ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30' : 'border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
