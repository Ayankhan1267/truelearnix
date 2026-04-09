'use client'
import { useQuery } from '@tanstack/react-query'
import { mentorAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  BookOpen, Users, Wallet, TrendingUp, ChevronRight, Video,
  ExternalLink, GraduationCap, ArrowUpRight, Star, Clock,
  Zap, Target, Award, CheckCircle, Play, BarChart2, Plus
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

function StatCard({ icon: Icon, label, value, sub, gradient, iconColor }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 group hover:scale-[1.02] transition-all duration-200`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-4 translate-x-4" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
      <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-white/35 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function MentorDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['mentor-dashboard'],
    queryFn: () => mentorAPI.dashboard().then(r => r.data)
  })

  const stats = data?.stats || {}
  const assignedCourses = data?.assignedCourses || []
  const recentEnrollments = data?.recentEnrollments || []

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  // Mock sparkline for earnings (last 7 days visual)
  const earningsSparkData = [2000, 3500, 2800, 4200, 3800, 5000, stats.monthlyEarnings || 0].map((v, i) => ({ v }))

  return (
    <div className="space-y-6 pb-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 50%, rgba(217,70,239,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-300 text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">{user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary-400" /> Mentor Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(user as any)?.isAffiliate && (
              <Link href="/partner/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-semibold hover:bg-amber-500/25 transition-all">
                <TrendingUp className="w-4 h-4" /> Partner Panel <ExternalLink className="w-3 h-3" />
              </Link>
            )}
            <Link href="/mentor/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white text-sm font-semibold transition-all">
              <Plus className="w-4 h-4" /> New Course
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={BookOpen} label="Assigned Courses" value={isLoading ? '—' : stats.totalCourses || 0}
          gradient="from-blue-600/25 to-blue-900/10 border border-blue-500/20"
          iconColor="text-blue-400" sub="Active courses"
        />
        <StatCard
          icon={Users} label="Total Students" value={isLoading ? '—' : stats.totalStudents || 0}
          gradient="from-green-600/25 to-green-900/10 border border-green-500/20"
          iconColor="text-green-400" sub="Enrolled learners"
        />
        <StatCard
          icon={TrendingUp} label="Monthly Earnings" value={isLoading ? '—' : `₹${(stats.monthlyEarnings || 0).toLocaleString()}`}
          gradient="from-violet-600/25 to-violet-900/10 border border-violet-500/20"
          iconColor="text-violet-400" sub="This month"
        />
        <StatCard
          icon={Wallet} label="Wallet Balance" value={isLoading ? '—' : `₹${(stats.wallet || 0).toLocaleString()}`}
          gradient="from-amber-600/25 to-amber-900/10 border border-amber-500/20"
          iconColor="text-amber-400" sub="Available to withdraw"
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Assigned Courses — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-dark-800 border border-white/5 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-400" /> Assigned Courses
              </h2>
              <Link href="/mentor/courses" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : assignedCourses.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No courses assigned yet</p>
                <p className="text-gray-600 text-xs mt-1">Admin will assign courses to you</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedCourses.slice(0, 5).map((item: any, i: number) => {
                  const course = item.courseId
                  if (!course) return null
                  const enrolled = course.enrolledCount || 0
                  const max = item.maxStudents || 100
                  const pct = Math.min(Math.round((enrolled / max) * 100), 100)
                  return (
                    <Link key={i} href="/mentor/courses"
                      className="flex items-center gap-4 p-3.5 bg-dark-700/50 hover:bg-dark-700 rounded-xl transition-all group border border-white/0 hover:border-primary-500/15">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate group-hover:text-primary-300 transition-colors">{course.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">{enrolled}/{max} students</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Earnings Trend Mini */}
          <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" /> Earnings Overview
              </h2>
              <Link href="/mentor/earnings" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium">
                Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-2xl font-black text-white">₹{(stats.monthlyEarnings || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">This month</p>
                <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Growing
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={70}>
                  <AreaChart data={earningsSparkData}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} fill="url(#earnGrad)" dot={false} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, 'Earnings']} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-4">

          {/* Recent Students */}
          <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" /> Recent Students
              </h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : recentEnrollments.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No students yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentEnrollments.map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 text-xs font-bold">{e.user?.name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{e.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{e.course?.title}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500/50 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
            <h2 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Quick Access
            </h2>
            <div className="space-y-1">
              {[
                { href: '/mentor/courses',  icon: BookOpen,  label: 'My Courses',    color: 'text-blue-400' },
                { href: '/mentor/students', icon: Users,     label: 'My Students',   color: 'text-green-400' },
                { href: '/mentor/classes',  icon: Video,     label: 'Live Classes',  color: 'text-violet-400' },
                { href: '/mentor/earnings', icon: TrendingUp,label: 'Earnings',      color: 'text-amber-400' },
                { href: '/mentor/profile',  icon: Award,     label: 'My Profile',    color: 'text-pink-400' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group">
                  <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors flex-1">{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Earn Program CTA if not affiliate */}
          {!(user as any)?.isAffiliate && (
            <div className="rounded-2xl p-5" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))',
              border: '1px solid rgba(99,102,241,0.25)'
            }}>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Unlock Earn Program</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">Get a package and earn commissions on top of your teaching income.</p>
              <Link href="/student/upgrade" className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-400 hover:text-violet-300 font-semibold">
                View Packages <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
