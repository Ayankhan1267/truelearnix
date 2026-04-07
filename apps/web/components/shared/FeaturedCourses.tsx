'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, Users, ArrowRight, BookOpen, Zap, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

const categories = ['All', 'Web Dev', 'Data Science', 'Design', 'Mobile Dev', 'Marketing', 'Cloud']

const courses = [
  {
    id: 1, slug: 'full-stack-web-dev',
    title: 'Full Stack Web Development Bootcamp',
    category: 'Web Dev', level: 'intermediate',
    rating: 4.9, ratingCount: 2840, enrolledCount: 12400,
    price: 4999, discountPrice: 999,
    icon: '💻', color: 'from-violet-600 to-indigo-600', glow: 'rgba(124,58,237,0.35)',
    badge: '🔥 Bestseller',
    skills: ['React', 'Node.js', 'MongoDB', 'Next.js'],
  },
  {
    id: 2, slug: 'data-science-python',
    title: 'Data Science & Machine Learning with Python',
    category: 'Data Science', level: 'beginner',
    rating: 4.8, ratingCount: 1920, enrolledCount: 8700,
    price: 3999, discountPrice: 799,
    icon: '📊', color: 'from-blue-600 to-cyan-600', glow: 'rgba(6,182,212,0.3)',
    badge: '⚡ Trending',
    skills: ['Python', 'Pandas', 'ML', 'Deep Learning'],
  },
  {
    id: 3, slug: 'ui-ux-design-masterclass',
    title: 'UI/UX Design Masterclass — Figma to Launch',
    category: 'Design', level: 'beginner',
    rating: 4.9, ratingCount: 1560, enrolledCount: 6200,
    price: 3499, discountPrice: 699,
    icon: '🎨', color: 'from-pink-600 to-rose-600', glow: 'rgba(236,72,153,0.3)',
    badge: '🏆 Top Rated',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
  },
  {
    id: 4, slug: 'react-native-mobile',
    title: 'React Native — Build iOS & Android Apps',
    category: 'Mobile Dev', level: 'intermediate',
    rating: 4.7, ratingCount: 980, enrolledCount: 4100,
    price: 4499, discountPrice: 899,
    icon: '📱', color: 'from-green-600 to-emerald-600', glow: 'rgba(16,185,129,0.3)',
    badge: null,
    skills: ['React Native', 'Expo', 'Firebase', 'App Store'],
  },
  {
    id: 5, slug: 'digital-marketing-pro',
    title: 'Digital Marketing — SEO, Ads & Social Media',
    category: 'Marketing', level: 'beginner',
    rating: 4.8, ratingCount: 2100, enrolledCount: 9800,
    price: 2999, discountPrice: 599,
    icon: '📢', color: 'from-amber-600 to-orange-600', glow: 'rgba(245,158,11,0.3)',
    badge: '⚡ Trending',
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics'],
  },
  {
    id: 6, slug: 'aws-cloud-devops',
    title: 'AWS Cloud & DevOps — Certification Track',
    category: 'Cloud', level: 'advanced',
    rating: 4.9, ratingCount: 760, enrolledCount: 3200,
    price: 5999, discountPrice: 1199,
    icon: '☁️', color: 'from-teal-500 to-cyan-600', glow: 'rgba(6,182,212,0.3)',
    badge: '🎓 Certified',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  },
]

function CourseCard({ c, i }: { c: typeof courses[0]; i: number }) {
  const discount = Math.round((1 - c.discountPrice / c.price) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      viewport={{ once: true }}
      className="flex-shrink-0 w-[280px] sm:w-auto flex flex-col rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Card header — colored skill banner */}
      <div className={`relative bg-gradient-to-br ${c.color} p-5 flex items-center justify-between`}
        style={{ boxShadow: `inset 0 -30px 40px rgba(0,0,0,0.35)` }}>
        <span className="text-4xl">{c.icon}</span>
        <div className="text-right">
          {c.badge && (
            <span className="text-xs font-black bg-black/30 text-white px-2.5 py-1 rounded-full">{c.badge}</span>
          )}
        </div>
        {/* Skill chips */}
        <div className="absolute bottom-2 left-3 flex gap-1 flex-wrap max-w-[85%]">
          {c.skills.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] font-bold bg-black/40 text-white/80 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-black mb-1.5" style={{ color: '#a78bfa' }}>{c.category}</span>
        <h3 className="font-black text-white text-sm leading-snug mb-3 flex-1 group-hover:text-violet-300 transition-colors line-clamp-2">
          {c.title}
        </h3>

        {/* Rating + students */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-black text-amber-400">{c.rating}</span>
            <span className="text-gray-600">({c.ratingCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />{c.enrolledCount.toLocaleString()}
          </div>
          <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${
            c.level === 'beginner' ? 'bg-green-500/15 text-green-400' :
            c.level === 'intermediate' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
          }`}>{c.level}</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white">₹{c.discountPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-600 line-through">₹{c.price.toLocaleString()}</span>
            </div>
            <span className="text-xs font-black text-green-400">{discount}% off</span>
          </div>
          <Link href={`/courses/${c.slug}`}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
            <ShoppingCart className="w-3.5 h-3.5" />Enroll
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedCourses() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? courses : courses.filter(c => c.category === active)

  return (
    <section className="py-14 md:py-24 relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(99,102,241,0.04), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="section-label mb-4">
              <BookOpen className="w-3.5 h-3.5" />TOP COURSES
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-black text-white leading-tight"
              style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Learn Top{' '}
              <span className="gradient-text">In-Demand Skills</span>
            </motion.h2>
          </div>
          <Link href="/courses" className="hidden md:flex items-center gap-1.5 text-violet-400 hover:text-white font-bold text-sm transition-colors group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category filter chips — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 md:mb-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`flex-shrink-0 text-xs font-black px-4 py-2 rounded-full transition-all ${
                active === cat
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={active === cat ? {
                background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => <CourseCard key={c.id} c={c} i={i} />)}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="sm:hidden scroll-track">
          {filtered.map((c, i) => <CourseCard key={c.id} c={c} i={i} />)}
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden text-center mt-6">
          <Link href="/courses" className="btn-secondary text-sm inline-flex items-center gap-2">
            View All Courses <Zap className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
