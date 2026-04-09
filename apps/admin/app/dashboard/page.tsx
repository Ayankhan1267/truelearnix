'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Users, DollarSign, TrendingUp, Flame, UserCheck, Coins,
  Clock, ArrowUpRight, ArrowDownRight, BookOpen, Video,
  ShoppingCart, RefreshCw, CheckCircle, XCircle, Eye,
  GraduationCap, Target, Zap, LifeBuoy, Bell, Package,
  ChevronRight, Activity
} from 'lucide-react'
import Link from 'next/link'

const PKG_COLORS: Record<string, string> = {
  starter: '#3b82f6',
  pro: '#8b5cf6',
  elite: '#f59e0b',
  supreme: '#f43f5e',
  free: '#6b7280',
}

const PKG_GRADIENTS: Record<string, string> = {
  starter: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  pro: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
  elite: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  supreme: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
}

function KPICard({ icon: Icon, label, value, change, color, gradient, onClick }: any) {
  return (
    <div onClick={onClick} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient || 'from-slate-800/80 to-slate-800/40 border-white/10'} border p-5 cursor-pointer group hover:scale-[1.02] transition-all duration-200`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'radial-gradient(circle at top right, rgba(124,58,237,0.08), transparent 60%)' }} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-1 rounded-full ${change >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 40, w = data.length * 8
  const points = data.map((v, i) => `${i * 8},${h - ((v - min) / range) * (h - 4) - 2}`)
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const qc = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('30d')

  const { data: dash } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminAPI.analyticsDashboard().then(r => r.data) })
  const { data: basicDash } = useQuery({ queryKey: ['admin-basic-dashboard'], queryFn: () => adminAPI.dashboard().then(r => r.data) })
  const { data: pending, refetch: refetchPending } = useQuery({ queryKey: ['pending-courses'], queryFn: () => adminAPI.pendingCourses().then(r => r.data) })
  const { data: revData } = useQuery({ queryKey: ['analytics-revenue', period], queryFn: () => adminAPI.analyticsRevenue(period).then(r => r.data) })
  const { data: userData } = useQuery({ queryKey: ['analytics-users', period], queryFn: () => adminAPI.analyticsUsers(period).then(r => r.data) })

  const stats = dash?.stats || basicDash?.stats || {}
  const pkgDist = dash?.packageDistribution || []
  const recentActivity = dash?.recentActivity || basicDash?.recentPayments || []

  const revChartData = (revData?.data || revData?.revenue || []).map((d: any) => ({
    date: d.date?.slice(5) || d.label || '',
    revenue: d.revenue || d.amount || 0,
  }))
  const userChartData = (userData?.data || userData?.users || []).map((d: any) => ({
    date: d.date?.slice(5) || d.label || '',
    users: d.count || d.users || 0,
  }))

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
      qc.invalidateQueries({ queryKey: ['admin-basic-dashboard'] }),
      qc.invalidateQueries({ queryKey: ['pending-courses'] }),
      qc.invalidateQueries({ queryKey: ['analytics-revenue'] }),
      qc.invalidateQueries({ queryKey: ['analytics-users'] }),
    ])
    setRefreshing(false)
  }

  const approveCourse = async (id: string) => {
    try { await adminAPI.approveCourse(id); toast.success('Course approved'); refetchPending() }
    catch { toast.error('Failed') }
  }
  const rejectCourse = async (id: string) => {
    const reason = prompt('Rejection reason:')
    if (!reason) return
    try { await adminAPI.rejectCourse(id, reason); toast.success('Course rejected'); refetchPending() }
    catch { toast.error('Failed') }
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(99,102,241,0.15) 50%, rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(124,58,237,0.25)'
        }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.12), transparent 60%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-violet-300 text-sm font-medium">{greeting} 👋</p>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Platform Overview</h1>
              <p className="text-gray-400 text-sm mt-1">{now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 border border-white/5">
                {[['7d','7D'],['30d','30D'],['90d','90D']].map(([v,l]) => (
                  <button key={v} onClick={() => setPeriod(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === v ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{l}
                  </button>
                ))}
              </div>
              <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>
          {/* Mini sparklines in header */}
          <div className="absolute right-8 bottom-4 opacity-20 hidden md:flex gap-2">
            <MiniSparkline data={revChartData.map((d: any) => d.revenue)} color="#8b5cf6" />
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          <KPICard
            icon={Users} label="Total Users"
            value={(stats.totalUsers || 0).toLocaleString()}
            change={stats.userGrowth}
            color="bg-blue-500/20 text-blue-400"
            gradient="from-blue-900/30 to-slate-800/40 border-blue-500/20"
            onClick={() => window.location.href = '/users'}
          />
          <KPICard
            icon={DollarSign} label="Revenue This Month"
            value={`₹${((stats.revenueThisMonth || 0) / 1000).toFixed(1)}K`}
            change={stats.revenueGrowth}
            color="bg-green-500/20 text-green-400"
            gradient="from-green-900/30 to-slate-800/40 border-green-500/20"
            onClick={() => window.location.href = '/finance'}
          />
          <KPICard
            icon={TrendingUp} label="Total Revenue"
            value={`₹${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`}
            color="bg-violet-500/20 text-violet-400"
            gradient="from-violet-900/30 to-slate-800/40 border-violet-500/20"
            onClick={() => window.location.href = '/analytics'}
          />
          <KPICard
            icon={Flame} label="Hot Leads"
            value={stats.hotLeads || 0}
            color="bg-orange-500/20 text-orange-400"
            gradient="from-orange-900/30 to-slate-800/40 border-orange-500/20"
            onClick={() => window.location.href = '/crm'}
          />
          <KPICard
            icon={UserCheck} label="Affiliates"
            value={stats.totalAffiliates || 0}
            color="bg-pink-500/20 text-pink-400"
            gradient="from-pink-900/30 to-slate-800/40 border-pink-500/20"
            onClick={() => window.location.href = '/learners'}
          />
          <KPICard
            icon={Coins} label="Commissions Paid"
            value={`₹${((stats.commissionsPaid || 0) / 1000).toFixed(1)}K`}
            color="bg-cyan-500/20 text-cyan-400"
            gradient="from-cyan-900/30 to-slate-800/40 border-cyan-500/20"
            onClick={() => window.location.href = '/finance'}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-400" /> Revenue Trend
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total: <span className="text-violet-400 font-semibold">
                    ₹{(revChartData.reduce((s: number, d: any) => s + d.revenue, 0) / 1000).toFixed(1)}K
                  </span>
                </p>
              </div>
            </div>
            {revChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v > 999 ? (v/1000).toFixed(0)+'K' : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-600 text-sm">No revenue data for this period</p>
              </div>
            )}
          </div>

          {/* Package Distribution */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" /> Package Split
            </h2>
            {pkgDist.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pkgDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count">
                      {pkgDist.map((p: any, i: number) => (
                        <Cell key={i} fill={PKG_COLORS[p._id?.toLowerCase()] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any, name: any) => [val, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pkgDist.map((p: any) => {
                    const total = pkgDist.reduce((s: number, x: any) => s + (x.count || 0), 0)
                    const pct = total > 0 ? Math.round((p.count / total) * 100) : 0
                    return (
                      <div key={p._id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PKG_COLORS[p._id?.toLowerCase()] || '#6b7280' }} />
                          <span className="text-gray-300 capitalize">{p._id || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{p.count}</span>
                          <span className="text-gray-500">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center gap-2">
                <Package className="w-8 h-8 text-gray-600" />
                <p className="text-gray-600 text-sm">No package data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── User Growth + Recent Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* User Growth */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" /> User Growth
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  +<span className="text-green-400 font-semibold">
                    {userChartData.reduce((s: number, d: any) => s + d.users, 0)}
                  </span> new users
                </p>
              </div>
            </div>
            {userChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={userChartData} barSize={8}>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" name="New Users" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-600 text-sm">No user data for this period</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" /> Recent
              </h2>
              <Link href="/finance" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentActivity.slice(0, 6).map((item: any, i: number) => (
                <div key={item._id || i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-400 text-xs font-bold">
                      {(item.user?.name || item.name || '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.user?.name || item.name || 'User'}</p>
                    <p className="text-gray-500 text-[10px] truncate">{item.description || item.course?.title || item.action || 'Activity'}</p>
                  </div>
                  {item.amount && (
                    <span className="text-green-400 text-xs font-bold flex-shrink-0">₹{item.amount}</span>
                  )}
                </div>
              ))}
              {!recentActivity.length && (
                <div className="text-center py-6">
                  <Activity className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Pending + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Pending Approvals */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" /> Pending Approvals
                {pending?.courses?.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                    {pending.courses.length}
                  </span>
                )}
              </h2>
              <Link href="/courses" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                All Courses <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {!pending?.courses?.length ? (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pending.courses.slice(0, 5).map((course: any) => (
                  <div key={course._id} className="flex items-center gap-3 p-3 bg-slate-700/40 hover:bg-slate-700/60 rounded-xl transition-colors">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-14 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-violet-400" />
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">by {course.mentor?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => approveCourse(course._id)}
                        className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => rejectCourse(course._id)}
                        className="flex items-center gap-1 text-xs bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-5 md:p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { href: '/users',        icon: Users,       label: 'Manage Users',      color: 'text-blue-400',   bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
                { href: '/learners',     icon: GraduationCap,label:'All Learners',      color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/20' },
                { href: '/courses',      icon: BookOpen,    label: 'Review Courses',     color: 'text-indigo-400', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20' },
                { href: '/live-classes', icon: Video,       label: 'Live Classes',       color: 'text-green-400',  bg: 'bg-green-500/10 hover:bg-green-500/20' },
                { href: '/finance',      icon: ShoppingCart,label: 'Purchases',          color: 'text-amber-400',  bg: 'bg-amber-500/10 hover:bg-amber-500/20' },
                { href: '/support',      icon: LifeBuoy,    label: 'Support Tickets',    color: 'text-rose-400',   bg: 'bg-rose-500/10 hover:bg-rose-500/20' },
                { href: '/analytics',    icon: TrendingUp,  label: 'Analytics',          color: 'text-cyan-400',   bg: 'bg-cyan-500/10 hover:bg-cyan-500/20' },
                { href: '/notifications',icon: Bell,        label: 'Notifications',      color: 'text-orange-400', bg: 'bg-orange-500/10 hover:bg-orange-500/20' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${item.bg} transition-all group`}>
                  <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
