'use client'
import { useQuery } from '@tanstack/react-query'
import { courseAPI } from '@/lib/api'
import Link from 'next/link'
import { Star, Users, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

function CourseCard({ course, i }: { course: any; i: number }) {
  const price = course.discountPrice || course.price
  const hasDiscount = course.discountPrice && course.discountPrice < course.price

  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      transition={{ delay:i*0.08 }} viewport={{ once:true }}>
      <Link href={`/courses/${course.slug}`}
        className="block bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-violet-500/40 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 group h-full">
        <div className="relative aspect-video overflow-hidden">
          <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${course.level === 'beginner' ? 'bg-green-500/80 text-white' : course.level === 'intermediate' ? 'bg-amber-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
            {course.level}
          </span>
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{course.rating?.toFixed(1)}</span>
            <span className="text-gray-300">({course.ratingCount})</span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-violet-400 font-semibold mb-1.5">{course.category}</p>
          <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors leading-snug">{course.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Users className="w-3 h-3" />
            <span>{course.enrolledCount} students</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">₹{price?.toLocaleString()}</span>
              {hasDiscount && <span className="text-xs text-gray-600 line-through">₹{course.price?.toLocaleString()}</span>}
            </div>
            {hasDiscount && (
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                {Math.round((1 - course.discountPrice/course.price)*100)}% off
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/[0.06]" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/[0.06] rounded w-1/3" />
        <div className="h-4 bg-white/[0.06] rounded" />
        <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        <div className="h-5 bg-white/[0.06] rounded w-1/2 mt-2" />
      </div>
    </div>
  )
}

export default function FeaturedCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => courseAPI.getAll({ limit:6, sort:'-enrolledCount' }).then(r => r.data)
  })

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.span initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
              className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              TOP COURSES
            </motion.span>
            <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className="text-4xl md:text-5xl font-black text-white">
              Learn from <span className="gradient-text">the Best</span>
            </motion.h2>
          </div>
          <Link href="/courses" className="hidden md:flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold text-sm transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop grid / Mobile horizontal scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)
            : data?.courses?.map((course: any, i: number) => <CourseCard key={course._id} course={course} i={i} />)
          }
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/courses" className="btn-secondary text-sm px-6 py-3 inline-flex items-center gap-2">
            View All Courses <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
