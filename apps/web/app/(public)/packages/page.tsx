'use client'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState, MouseEvent, TouchEvent, useEffect, useCallback } from 'react'
import { packageAPI } from '@/lib/api'
import { Check, Zap, Shield, Sparkles, Crown, Flame, Rocket, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    tier: 'starter', name: 'Starter', price: 4999, rate: 10, badge: '',
    icon: Rocket,
    gradient: 'from-blue-600 via-blue-700 to-cyan-700',
    glow: 'rgba(59,130,246,0.5)',
    glowSoft: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.4)',
    accent: '#60a5fa',
    iconBg: 'from-blue-500/30 to-cyan-500/20',
    btnGrad: '#2563eb,#0891b2',
    decorColor: 'rgba(59,130,246,0.08)',
  },
  {
    tier: 'pro', name: 'Pro', price: 9999, rate: 15, badge: 'Most Popular',
    icon: Flame,
    gradient: 'from-violet-600 via-purple-700 to-fuchsia-700',
    glow: 'rgba(139,92,246,0.6)',
    glowSoft: 'rgba(139,92,246,0.2)',
    border: 'rgba(139,92,246,0.5)',
    accent: '#a78bfa',
    iconBg: 'from-violet-500/30 to-fuchsia-500/20',
    btnGrad: '#7c3aed,#d946ef',
    decorColor: 'rgba(139,92,246,0.1)',
  },
  {
    tier: 'elite', name: 'Elite', price: 19999, rate: 22, badge: '',
    icon: Star,
    gradient: 'from-orange-600 via-orange-700 to-red-700',
    glow: 'rgba(234,88,12,0.5)',
    glowSoft: 'rgba(234,88,12,0.15)',
    border: 'rgba(234,88,12,0.4)',
    accent: '#fb923c',
    iconBg: 'from-orange-500/30 to-red-500/20',
    btnGrad: '#ea580c,#dc2626',
    decorColor: 'rgba(234,88,12,0.08)',
  },
  {
    tier: 'supreme', name: 'Supreme', price: 29999, rate: 30, badge: 'Best Value',
    icon: Crown,
    gradient: 'from-yellow-500 via-amber-600 to-orange-600',
    glow: 'rgba(245,158,11,0.6)',
    glowSoft: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.5)',
    accent: '#fbbf24',
    iconBg: 'from-yellow-500/30 to-amber-500/20',
    btnGrad: '#d97706,#ea580c',
    decorColor: 'rgba(245,158,11,0.08)',
  },
]

const FEATURES: Record<string, string[]> = {
  starter: ['All course access', 'Live classes (basic)', 'Community access', 'Certificate generation', 'Earn Panel (10% income)', 'Email support'],
  pro: ['Everything in Starter', 'AI Coach access', 'Job Engine', '15% income share', 'Priority support', 'Personal brand builder'],
  elite: ['Everything in Pro', '22% income share', 'Mentor 1:1 sessions', 'Advanced analytics', 'Early access to courses', 'WhatsApp support'],
  supreme: ['Everything in Elite', '30% Max income share', 'Done-For-You system', 'Dedicated success manager', 'Exclusive mastermind', 'Lifetime updates'],
}

const SALE_TIERS = ['starter', 'pro', 'elite', 'supreme']
const SALE_PRICES = { starter: 4999, pro: 9999, elite: 19999, supreme: 29999 }
const SALE_RATES  = { starter: 10,   pro: 15,   elite: 22,    supreme: 30 }

/* ── Single Card ── */
function PackageCard({ t, active }: { t: typeof TIERS[0]; active?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = t.icon
  const isPopular = t.badge === 'Most Popular'

  const applyTilt = (x: number, y: number, rect: DOMRect) => {
    const card = cardRef.current; if (!card) return
    const cx = rect.width / 2, cy = rect.height / 2
    const rotY = ((x - cx) / cx) * 12
    const rotX = -((y - cy) / cy) * 10
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px) scale(1.03)`
    card.style.boxShadow = `0 30px 80px ${t.glow}, 0 10px 30px rgba(0,0,0,0.6), 0 0 0 1px ${t.border}`
    const shine = card.querySelector('.card-shine') as HTMLElement
    if (shine) { shine.style.opacity = '1'; shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 60%)` }
  }

  const resetTilt = () => {
    const card = cardRef.current; if (!card) return
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'
    card.style.boxShadow = `0 8px 32px ${t.glowSoft}, 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`
    const shine = card.querySelector('.card-shine') as HTMLElement
    if (shine) shine.style.opacity = '0'
  }

  return (
    <div className="relative scene-3d pt-5 flex flex-col h-full">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${t.glow}, transparent 70%)` }} />

      {/* Badge */}
      {t.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <div className="px-4 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${t.accent}, ${isPopular ? '#d946ef' : '#f97316'})`, boxShadow: `0 4px 20px ${t.glow}` }}>
            <Sparkles className="w-3 h-3" /> {t.badge}
          </div>
        </div>
      )}

      {/* Card body */}
      <div ref={cardRef}
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); applyTilt(e.clientX - r.left, e.clientY - r.top, r) }}
        onMouseLeave={resetTilt}
        onTouchMove={e => { const r = cardRef.current!.getBoundingClientRect(); const t2 = e.touches[0]; applyTilt(t2.clientX - r.left, t2.clientY - r.top, r) }}
        onTouchEnd={resetTilt}
        className="relative rounded-3xl overflow-hidden flex flex-col flex-1 cursor-default"
        style={{
          background: 'rgba(10,10,20,0.9)',
          border: `1px solid ${active ? t.border : 'rgba(255,255,255,0.07)'}`,
          boxShadow: `0 8px 32px ${t.glowSoft}, 0 2px 8px rgba(0,0,0,0.4)`,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.3s ease',
          transformStyle: 'preserve-3d',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Shine */}
        <div className="card-shine absolute inset-0 rounded-3xl pointer-events-none z-10 opacity-0 transition-opacity duration-200" />

        {/* Decorative circle bg */}
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${t.decorColor}, transparent 70%)` }} />
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${t.decorColor}, transparent 70%)` }} />

        {/* Top gradient bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${t.gradient} flex-shrink-0`} />

        {/* Top wash */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${t.glowSoft} 0%, transparent 100%)` }} />

        <div className="relative z-10 flex flex-col flex-1 p-5 sm:p-7">
          {/* Icon + Name */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.iconBg} flex items-center justify-center flex-shrink-0`}
              style={{ boxShadow: `0 4px 20px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`, border: `1px solid ${t.border}` }}>
              <Icon className="w-6 h-6" style={{ color: t.accent }} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3" style={{ color: t.accent }} />
                <span className="text-xs font-bold" style={{ color: t.accent }}>{t.rate}% Income Rate</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-5 pb-5 border-b border-white/8">
            <span className="text-4xl font-black leading-none block"
              style={{ background: `linear-gradient(135deg, #fff 30%, ${t.accent})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{t.price.toLocaleString()}
            </span>
            <p className="text-xs text-gray-500 mt-1">one-time • GST extra • no recurring fee</p>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 flex-1 mb-6">
            {FEATURES[t.tier].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: t.glowSoft, border: `1px solid ${t.border}` }}>
                  <Check className="w-2.5 h-2.5" style={{ color: t.accent }} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href={`/packages/${t.tier}`}
            className="block w-full text-center py-3.5 rounded-2xl font-black text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${t.btnGrad})`, boxShadow: `0 4px 24px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`, color: '#fff' }}>
            Get {t.name} →
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile Slider ── */
function MobileSlider() {
  const [active, setActive] = useState(1) // start on Pro (popular)
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const scrollToCard = useCallback((index: number) => {
    const slider = sliderRef.current
    if (!slider) return
    const cardWidth = slider.offsetWidth * 0.78 + 16
    slider.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
    setActive(index)
  }, [])

  // Snap on scroll end
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    let timeout: ReturnType<typeof setTimeout>
    const onScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const cardWidth = slider.offsetWidth * 0.78 + 16
        const idx = Math.round(slider.scrollLeft / cardWidth)
        setActive(Math.min(Math.max(idx, 0), TIERS.length - 1))
      }, 80)
    }
    slider.addEventListener('scroll', onScroll, { passive: true })
    // init scroll to card 1 (Pro)
    setTimeout(() => scrollToCard(1), 100)
    return () => { slider.removeEventListener('scroll', onScroll); clearTimeout(timeout) }
  }, [scrollToCard])

  return (
    <div className="block lg:hidden mb-14">
      {/* Slider track */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-[11%]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {TIERS.map((t, i) => (
          <div
            key={t.tier}
            className="snap-center flex-shrink-0 transition-all duration-300"
            style={{
              width: '78%',
              opacity: active === i ? 1 : 0.55,
              transform: active === i ? 'scale(1)' : 'scale(0.93)',
            }}
            onClick={() => active !== i && scrollToCard(i)}
          >
            <PackageCard t={t} active={active === i} />
          </div>
        ))}
      </div>

      {/* Dot + Arrow nav */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => scrollToCard(Math.max(active - 1, 0))}
          disabled={active === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-2">
          {TIERS.map((t, i) => (
            <button key={t.tier} onClick={() => scrollToCard(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? 24 : 7,
                height: 7,
                background: active === i ? t.accent : 'rgba(255,255,255,0.2)',
                boxShadow: active === i ? `0 0 8px ${t.glow}` : 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => scrollToCard(Math.min(active + 1, TIERS.length - 1))}
          disabled={active === TIERS.length - 1}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Active tier name label */}
      <p className="text-center text-xs font-bold mt-3 transition-all" style={{ color: TIERS[active].accent }}>
        {TIERS[active].name} Plan
      </p>
    </div>
  )
}

/* ── Main Page ── */
export default function PackagesPage() {
  useQuery({ queryKey: ['packages-public'], queryFn: () => packageAPI.getAll().then(r => r.data) })

  return (
    <div className="min-h-screen bg-dark-900 py-14 sm:py-20 px-4 relative overflow-hidden">
      {/* Bg orbs */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-0 right-1/4 w-56 sm:w-80 h-56 sm:h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16 px-2">
          <span className="section-label mb-4 inline-flex">
            <Sparkles className="w-3.5 h-3.5" /> Pricing Plans
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-4 mb-4 leading-tight text-3d">
            Choose Your <span className="gradient-shift-text">Plan</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg">
            Your package tier determines your income share rate.{' '}
            <span className="text-white font-semibold">Higher tier = more earnings</span> when you help others learn.
          </p>
        </div>

        {/* Mobile: slider */}
        <MobileSlider />

        {/* Desktop: 4-col grid */}
        <div className="hidden lg:grid grid-cols-4 gap-8 mb-20 items-stretch">
          {TIERS.map((t, i) => (
            <div key={t.tier} style={{ animationDelay: `${i * 0.08}s` }}>
              <PackageCard t={t} active />
            </div>
          ))}
        </div>

        {/* Commission Matrix */}
        <div className="card section-3d-shadow mb-12 sm:mb-16">
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-white">Income Matrix</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Your tier % × price = your income per referral (Level 1)</p>
          </div>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-semibold">Tier</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-gray-400 font-semibold">Rate</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-blue-400 font-semibold">Starter</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-violet-400 font-semibold">Pro</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-orange-400 font-semibold">Elite</th>
                  <th className="text-center py-3 px-2 sm:px-4 text-yellow-400 font-semibold">Supreme</th>
                </tr>
              </thead>
              <tbody>
                {SALE_TIERS.map(myTier => {
                  const myRate = SALE_RATES[myTier as keyof typeof SALE_RATES]
                  const t = TIERS.find(x => x.tier === myTier)!
                  return (
                    <tr key={myTier} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 px-2 sm:px-4">
                        <span className="font-bold text-white capitalize flex items-center gap-1.5">
                          <t.icon className="w-3.5 h-3.5" style={{ color: t.accent }} /> {myTier}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center font-black" style={{ color: t.accent }}>{myRate}%</td>
                      {SALE_TIERS.map(st => (
                        <td key={st} className="py-3 px-2 sm:px-4 text-center text-white font-semibold">
                          ₹{Math.round(SALE_PRICES[st as keyof typeof SALE_PRICES] * myRate / 100).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 sm:p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <p className="text-xs sm:text-sm text-primary-300">
              <span className="font-bold">3-Level MLM:</span> Level 1 = your tier % | Level 2 = 5% fixed | Level 3 = 2% fixed
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-white text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3 sm:space-y-4">
            {[
              { q: 'How is income calculated?', a: 'Your income rate is determined by YOUR OWN package tier. If you hold Supreme (30%) and someone buys Starter (₹4,999) through your link, you earn ₹1,500.' },
              { q: 'When do I get Partner access?', a: 'Immediately after payment is confirmed. Your Partner Panel is auto-unlocked, a personal partner link is assigned, and a welcome message is sent.' },
              { q: 'What are the partner earning levels?', a: 'Level 1 = direct referrals (your tier%). Level 2 = their referrals (5%). Level 3 = L2 referrals (2%). All credited to your wallet automatically.' },
              { q: 'When is income paid out?', a: 'Income is credited to your wallet in real-time on every sale. Withdraw anytime (min ₹500) via UPI or bank — processed within 24-48 hours.' },
              { q: 'Is GST applicable?', a: 'Yes, 18% GST is applicable on all package purchases. A GST invoice will be emailed after payment.' },
            ].map(faq => (
              <div key={faq.q} className="card hover:border-primary-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm sm:text-base mb-1">{faq.q}</p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <p className="text-gray-500 text-sm">Have questions? <Link href="/" className="text-primary-400 hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  )
}
