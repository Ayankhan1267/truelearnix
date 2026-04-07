'use client'
import Link from 'next/link'
import { Check, Zap, Crown, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Free',
    icon: GraduationCap,
    price: '₹0',
    period: 'forever',
    desc: 'Start your journey — no strings attached',
    features: ['5 Free courses access', 'Community forum access', 'Basic certificates', '5 quiz attempts/month', 'Email support'],
    cta: 'Get Started Free',
    href: '/register',
    highlight: false,
    badge: null,
    iconColor: 'text-gray-400',
    iconBg: 'rgba(255,255,255,0.08)',
  },
  {
    name: 'Pro',
    icon: Zap,
    price: '₹999',
    period: '/month',
    desc: 'Everything you need to accelerate your career',
    features: ['All 500+ courses unlimited', 'Live class access daily', 'Premium AI certificates', 'Unlimited quizzes & tests', 'Download all recordings', 'Priority support 24/7', 'Affiliate program (10%)', 'Mock interviews & mentoring'],
    cta: 'Start Pro Now',
    href: '/register?plan=pro',
    highlight: true,
    badge: 'Most Popular',
    iconColor: 'text-violet-300',
    iconBg: 'rgba(124,58,237,0.25)',
  },
  {
    name: 'Mentor',
    icon: Crown,
    price: '₹1,999',
    period: '/month',
    desc: 'Teach, earn, and build your personal brand',
    features: ['Everything in Pro', 'Create & sell courses', 'Host your live classes', 'Student analytics dashboard', '70% revenue share', 'Dedicated mentor manager', 'Custom course branding', 'Early feature access'],
    cta: 'Become a Mentor',
    href: '/register?role=mentor',
    highlight: false,
    badge: 'For Educators',
    iconColor: 'text-amber-400',
    iconBg: 'rgba(245,158,11,0.15)',
  },
]

function PlanCard({ plan, i }: { plan: typeof plans[0]; i: number }) {
  const PlanIcon = plan.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      viewport={{ once: true }}
      className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
        plan.highlight ? 'md:-translate-y-3 md:scale-[1.03]' : 'hover:border-violet-500/25'
      }`}
      style={plan.highlight ? {
        background: 'linear-gradient(160deg, rgba(124,58,237,0.2), rgba(79,70,229,0.12), rgba(124,58,237,0.08))',
        border: '1px solid rgba(124,58,237,0.45)',
        boxShadow: '0 0 80px rgba(124,58,237,0.18), inset 0 0 80px rgba(124,58,237,0.04)',
      } : {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap"
          style={plan.highlight ? {
            background: 'linear-gradient(90deg, #7c3aed, #6366f1)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(124,58,237,0.5)',
          } : {
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#d1d5db',
          }}>
          {plan.highlight && <Zap className="w-3 h-3 inline mr-1" />}
          {plan.badge}
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: plan.iconBg }}>
          <PlanIcon className={`w-5 h-5 ${plan.iconColor}`} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{plan.name}</h3>
          <p className="text-gray-500 text-xs">{plan.desc}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className={`text-5xl font-black ${plan.highlight ? 'gradient-text' : 'text-white'}`}>
          {plan.price}
        </span>
        <span className="text-gray-500 text-sm">{plan.period}</span>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-7">
        {plan.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-400' : 'text-gray-600'}`} />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={plan.href}
        className={`block text-center py-3.5 rounded-2xl font-black text-sm transition-all ${
          plan.highlight
            ? 'btn-primary'
            : 'border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-violet-500/30'
        }`}>
        {plan.cta}
      </Link>
    </motion.div>
  )
}

export default function PricingSection() {
  return (
    <section className="py-14 md:py-24 px-4 relative" id="pricing">
      {/* Background glow — contained separately */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="section-label mb-5">
            PRICING PLANS
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Simple,{' '}
            <span className="gradient-text">Transparent</span> Pricing
          </motion.h2>
          <p className="text-gray-400">Start free, upgrade when ready. No hidden fees. Cancel anytime.</p>
        </div>

        {/* Desktop — 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => <PlanCard key={i} plan={plan} i={i} />)}
        </div>

        {/* Mobile — stacked cards */}
        <div className="md:hidden flex flex-col gap-4">
          {plans.map((plan, i) => <PlanCard key={i} plan={plan} i={i} />)}
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-600 text-xs mt-8">
          All plans include SSL security • No hidden charges • Indian payment methods accepted (UPI, Cards, Net Banking)
        </p>
      </div>
    </section>
  )
}
