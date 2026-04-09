'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Trophy, Star, Shield, Zap, Award, TrendingUp, Globe, Cpu, Camera } from 'lucide-react'

const row1 = [
  { icon: Trophy,    color: 'text-amber-400',   bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.2)',  glow: 'rgba(245,158,11,0.08)',  title: 'Best EdTech Startup',      org: 'Inc42 Awards',          year: '2024' },
  { icon: Globe,     color: 'text-blue-400',    bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.08)', title: 'Google for Startups',      org: 'Accelerator India',     year: '2024' },
  { icon: Shield,    color: 'text-violet-400',  bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.2)', glow: 'rgba(124,58,237,0.08)', title: 'DPIIT Recognised',         org: 'Startup India',         year: '2023' },
  { icon: Award,     color: 'text-fuchsia-400', bg: 'rgba(217,70,239,0.12)', border: 'rgba(217,70,239,0.2)', glow: 'rgba(217,70,239,0.08)', title: 'Top 30 Under 30',          org: 'YourStory',             year: '2024' },
  { icon: TrendingUp,color: 'text-green-400',   bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.08)', title: 'Fastest Growing EdTech',   org: 'Economic Times',        year: '2024' },
  { icon: Cpu,       color: 'text-cyan-400',    bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.2)',  glow: 'rgba(6,182,212,0.08)',  title: 'AWS EdTech Partner',       org: 'Amazon Web Services',   year: '2023' },
]

const row2 = [
  { icon: Star,   color: 'text-amber-400',  bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.2)',  glow: 'rgba(245,158,11,0.08)',  title: '4.9★ Platform Rating',     org: 'Google Play Store',     year: '2024' },
  { icon: Trophy, color: 'text-violet-400', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.2)', glow: 'rgba(124,58,237,0.08)', title: 'EdTech Emerging Award',    org: 'NASSCOM',               year: '2024' },
  { icon: Globe,  color: 'text-indigo-400', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.08)', title: 'Microsoft Startup',        org: 'Microsoft for Startups', year: '2023' },
  { icon: Zap,    color: 'text-orange-400', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.2)', glow: 'rgba(249,115,22,0.08)', title: 'Innovation Hub Partner',   org: 'IIT Delhi',             year: '2024' },
  { icon: Shield, color: 'text-green-400',  bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.08)', title: 'ISO 27001 Certified',      org: 'Information Security',  year: '2024' },
  { icon: Award,  color: 'text-pink-400',   bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.2)', glow: 'rgba(236,72,153,0.08)', title: 'Top EdTech Platform',      org: 'Business Standard',     year: '2024' },
]

// Founder / award photos — upload as img-1.jpg … img-5.jpg in /public/achievements/
const founderPhotos = [
  { src: '/achievements/img-1.jpg', caption: 'Award Night 2024',        sub: 'Inc42 Summit, Bangalore'      },
  { src: '/achievements/img-2.jpg', caption: 'Google for Startups',     sub: 'Accelerator Demo Day, Delhi'  },
  { src: '/achievements/img-3.jpg', caption: 'NASSCOM EdTech Award',    sub: 'Annual Conference 2024'       },
  { src: '/achievements/img-4.jpg', caption: 'YourStory 30 Under 30',   sub: 'Recognition Ceremony, Mumbai' },
  { src: '/achievements/img-5.jpg', caption: 'Startup India Award',     sub: 'DPIIT Event, New Delhi'       },
]

function AchievementCard({ item }: { item: typeof row1[0] }) {
  const Icon = item.icon
  return (
    <div
      className="flex-shrink-0 flex items-center gap-4 mx-3 px-5 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-default"
      style={{
        background: `linear-gradient(135deg, ${item.glow}, rgba(255,255,255,0.01))`,
        border: `1px solid ${item.border}`,
        backdropFilter: 'blur(12px)',
        minWidth: '260px',
        boxShadow: `0 4px 24px ${item.glow}`,
      }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: item.bg, boxShadow: `0 0 20px ${item.glow}` }}>
        <Icon className={`w-5 h-5 ${item.color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-white font-black text-sm leading-tight truncate">{item.title}</p>
        <p className="text-gray-500 text-xs mt-0.5 truncate">{item.org}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] font-black px-2 py-1 rounded-lg ml-auto"
        style={{ background: item.bg, color: item.color.replace('text-', '') }}>
        {item.year}
      </span>
    </div>
  )
}

function PhotoCard({ photo }: { photo: typeof founderPhotos[0] }) {
  return (
    <div
      className="flex-shrink-0 mx-3 rounded-2xl overflow-hidden relative group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03]"
      style={{
        width: '260px',
        height: '320px',
        border: '1px solid rgba(124,58,237,0.25)',
        boxShadow: '0 8px 40px rgba(124,58,237,0.1)',
      }}
    >
      {/* Photo */}
      <Image
        src={photo.src}
        alt={photo.caption}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="260px"
      />

      {/* Always-visible subtle gradient at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(4,5,10,0.95) 0%, rgba(4,5,10,0.5) 50%, transparent 100%)' }}
      />

      {/* Hover glow border */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.6)', background: 'rgba(124,58,237,0.04)' }}
      />

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.8)' }} />
          <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider">Moment</span>
        </div>
        <p className="text-white font-black text-sm leading-tight">{photo.caption}</p>
        <p className="text-gray-500 text-xs mt-0.5">{photo.sub}</p>
      </div>

      {/* Top-right camera icon */}
      <div className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'rgba(124,58,237,0.5)', backdropFilter: 'blur(8px)' }}>
        <Camera className="w-3.5 h-3.5 text-violet-300" />
      </div>
    </div>
  )
}

export default function AchievementsSection() {
  const r1 = [...row1, ...row1]
  const r2 = [...row2, ...row2]
  const photos = [...founderPhotos, ...founderPhotos]

  return (
    <section className="relative py-8 sm:py-12 overflow-hidden" style={{ background: '#04050a' }}>

      {/* BG orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-60px] left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] right-1/4 w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.03) 0%, transparent 70%)' }} />
      </div>

      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(217,70,239,0.3), transparent)' }} />

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-10 px-4"
      >
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
          style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)' }}>
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 text-xs font-black tracking-wide uppercase">Awards & Recognition</span>
        </div>
        <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight">
          Recognised by <span className="gradient-text">India's Best</span>
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          Trusted by top organisations, backed by leading partners, and celebrated across the industry.
        </p>
      </motion.div>

      {/* ── Award text sliders ── */}
      <div className="relative z-10 space-y-4">
        <div className="absolute inset-y-0 left-0 w-24 sm:w-40 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #04050a 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-40 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, #04050a 0%, transparent 100%)' }} />

        <div className="overflow-hidden">
          <div className="marquee-fwd" style={{ animationDuration: '36s' }}>
            {r1.map((item, i) => <AchievementCard key={i} item={item} />)}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-rev" style={{ animationDuration: '42s' }}>
            {r2.map((item, i) => <AchievementCard key={i} item={item} />)}
          </div>
        </div>
      </div>

      {/* ── Founder photo gallery ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        className="relative z-10 mt-12"
      >
        {/* Gallery label */}
        <div className="flex items-center justify-center gap-3 mb-6 px-4">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Camera className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Our Moments</span>
          </div>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
        </div>

        {/* Photo slider */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 sm:w-32 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #04050a 0%, transparent 100%)' }} />
          <div className="absolute inset-y-0 right-0 w-20 sm:w-32 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(270deg, #04050a 0%, transparent 100%)' }} />

          <div className="marquee-fwd py-3" style={{ animationDuration: '30s' }}>
            {photos.map((photo, i) => <PhotoCard key={i} photo={photo} />)}
          </div>
        </div>
      </motion.div>

      {/* ── Bottom stat strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mt-12 mx-auto max-w-3xl px-4"
      >
        <div className="grid grid-cols-3 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { val: '12+', label: 'Awards Won',          color: 'text-amber-400'  },
            { val: '8',   label: 'Industry Partners',    color: 'text-violet-400' },
            { val: '3',   label: 'Global Recognitions',  color: 'text-cyan-400'  },
          ].map((s, i) => (
            <div key={i} className="text-center py-5"
              style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <p className={`font-black text-xl sm:text-2xl ${s.color}`}>{s.val}</p>
              <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), rgba(217,70,239,0.2), transparent)' }} />
    </section>
  )
}
