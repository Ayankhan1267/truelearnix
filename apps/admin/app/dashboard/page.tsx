'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { Users, DollarSign, TrendingUp, Flame, UserCheck, Coins, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, change, color }: any) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

function SimpleBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const qc = useQueryClient()
  const { data: dash } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminAPI.analyticsDashboard().then(r => r.data) })
  const { data: basicDash } = useQuery({ queryKey: ['admin-basic-dashboard'], queryFn: () => adminAPI.dashboard().then(r => r.data) })
  const { data: pending, refetch: refetchPending } = useQuery({ queryKey: ['pending-courses'], queryFn: () => adminAPI.pendingCourses().then(r => r.data) })

  const stats = dash?.stats || basicDash?.stats || {}
  const pkgDist = dash?.packageDistribution || []
  const maxPkg = Math.max(...pkgDist.map((p: any) => p.count || 0), 1)

  const pkgColors: Record<string, string> = {
    starter: 'bg-blue-500',
    pro: 'bg-violet-500',
    elite: 'bg-amber-500',
    supreme: 'bg-rose-500',
  }

  const approveCourse = async (id: string) => {
    try {
      await adminAPI.approveCourse(id)
      toast.success('Course approved')
      refetchPending()
    } catch { toast.error('Failed') }
  }

  const rejectCourse = async (id: string) => {
    const reason = prompt('Rejection reason:')
    if (!reason) return
    try {
      await adminAPI.rejectCourse(id, reason)
      toast.success('Course rejected')
      refetchPending()
    } catch { toast.error('Failed') }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Total Users" value={(stats.totalUsers || 0).toLocaleString()} color="bg-blue-500/20 text-blue-400" change={stats.userGrowth} />
          <StatCard icon={DollarSign} label="Revenue This Month" value={`₹${((stats.revenueThisMonth || 0)/1000).toFixed(1)}K`} color="bg-green-500/20 text-green-400" change={stats.revenueGrowth} />
          <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${((stats.totalRevenue || 0)/1000).toFixed(1)}K`} color="bg-violet-500/20 text-violet-400" />
          <StatCard icon={Flame} label="Hot Leads" value={stats.hotLeads || 0} color="bg-orange-500/20 text-orange-400" />
          <StatCard icon={UserCheck} label="Affiliates" value={stats.totalAffiliates || 0} color="bg-pink-500/20 text-pink-400" />
          <StatCard icon={Coins} label="Commissions Paid" value={`₹${((stats.commissionsPaid || 0)/1000).toFixed(1)}K`} color="bg-cyan-500/20 text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package distribution */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-6">Package Distribution</h2>
            {pkgDist.length > 0 ? (
              <div className="space-y-4">
                {pkgDist.map((p: any) => (
                  <SimpleBar key={p._id} label={p._id || 'Unknown'} value={p.count} max={maxPkg} color={pkgColors[p._id?.toLowerCase()] || 'bg-gray-500'} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {['Starter', 'Pro', 'Elite', 'Supreme'].map((name, i) => (
                  <SimpleBar key={name} label={name} value={0} max={1} color={Object.values(pkgColors)[i]} />
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {(dash?.recentActivity || basicDash?.recentPayments || []).slice(0, 6).map((item: any, i: number) => (
                <div key={item._id || i} className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-400 text-xs font-bold">{(item.user?.name || item.name || '?')[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.user?.name || item.name || 'User'}</p>
                    <p className="text-gray-400 text-xs truncate">{item.description || item.course?.title || item.action || 'Activity'}</p>
                  </div>
                  {item.amount && <span className="text-green-400 text-xs font-semibold">₹{item.amount}</span>}
                </div>
              ))}
              {(!dash?.recentActivity && !basicDash?.recentPayments) && (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending courses */}
        {(pending?.courses?.length > 0) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Pending Course Approvals
                <span className="badge bg-yellow-500/20 text-yellow-400 ml-1">{pending.courses.length}</span>
              </h2>
              <a href="/courses" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View All</a>
            </div>
            <div className="space-y-3">
              {pending.courses.slice(0, 5).map((course: any) => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {course.thumbnail && <img src={course.thumbnail} alt="" className="w-12 h-8 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium text-white text-sm">{course.title}</p>
                      <p className="text-xs text-gray-400">by {course.mentor?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveCourse(course._id)}
                      className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                      Approve
                    </button>
                    <button onClick={() => rejectCourse(course._id)}
                      className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
