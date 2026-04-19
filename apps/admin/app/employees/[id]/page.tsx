'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import {
  ArrowLeft, Users, CalendarDays, CheckSquare, Target,
  TrendingUp, Clock, AlertCircle, CheckCircle2, Circle,
  Flame, Award, BarChart3, Mail, Phone, Briefcase,
  ChevronRight, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  low:    { color: 'text-gray-400',   bg: 'bg-gray-500/15',   label: 'Low' },
  medium: { color: 'text-blue-400',   bg: 'bg-blue-500/15',   label: 'Medium' },
  high:   { color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'High' },
  urgent: { color: 'text-red-400',    bg: 'bg-red-500/15',    label: 'Urgent' },
}

const TASK_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  'todo':        { color: 'text-gray-400',   bg: 'bg-gray-500/15',   label: 'To Do',      icon: Circle },
  'in-progress': { color: 'text-blue-400',   bg: 'bg-blue-500/15',   label: 'In Progress',icon: RefreshCw },
  'review':      { color: 'text-yellow-400', bg: 'bg-yellow-500/15', label: 'Review',     icon: AlertCircle },
  'done':        { color: 'text-green-400',  bg: 'bg-green-500/15',  label: 'Done',       icon: CheckCircle2 },
}

const GOAL_STATUS_CONFIG: Record<string, { color: string; bg: string; bar: string }> = {
  'on-track':  { color: 'text-green-400',  bg: 'bg-green-500/15',  bar: 'bg-green-500' },
  'at-risk':   { color: 'text-yellow-400', bg: 'bg-yellow-500/15', bar: 'bg-yellow-500' },
  'behind':    { color: 'text-red-400',    bg: 'bg-red-500/15',    bar: 'bg-red-500' },
  'completed': { color: 'text-violet-400', bg: 'bg-violet-500/15', bar: 'bg-violet-500' },
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-800/60 border border-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-white text-sm font-semibold mt-0.5">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

export default function EmployeePerformancePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['emp-performance', id],
    queryFn: () => adminAPI.employeePerformance(id).then(r => r.data),
  })

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )

  if (isError || !data?.employee) return (
    <AdminLayout>
      <div className="text-center py-20 text-gray-500">
        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Employee not found</p>
      </div>
    </AdminLayout>
  )

  const { employee: emp, attendance, attendanceTrend, tasks, goals } = data

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">

        {/* Back */}
        <button onClick={() => router.push('/employees')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>

        {/* Employee Header */}
        <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center ring-2 ring-violet-500/30 flex-shrink-0 overflow-hidden">
              {emp.avatar
                ? <img src={emp.avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-violet-400 font-black text-2xl">{emp.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-white">{emp.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${emp.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {emp.employeeId && <span className="text-gray-500 text-xs font-mono">{emp.employeeId}</span>}
                <span className="text-gray-400 text-sm capitalize">{emp.department} · {emp.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-gray-500 text-xs"><Mail className="w-3 h-3" />{emp.email}</span>
                {emp.phone && <span className="flex items-center gap-1 text-gray-500 text-xs"><Phone className="w-3 h-3" />{emp.phone}</span>}
                {emp.joiningDate && <span className="flex items-center gap-1 text-gray-500 text-xs"><Briefcase className="w-3 h-3" />Joined {format(new Date(emp.joiningDate), 'dd MMM yyyy')}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Attendance ──────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-bold">Attendance — {MONTH_NAMES[(attendance.month - 1)]} {attendance.year}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Attendance" value={`${attendance.pct}%`} sub="this month" color={attendance.pct >= 85 ? 'text-green-400' : attendance.pct >= 70 ? 'text-yellow-400' : 'text-red-400'} />
            <StatCard label="Present" value={attendance.present} color="text-green-400" />
            <StatCard label="Half Day" value={attendance.halfDay} color="text-yellow-400" />
            <StatCard label="Leave" value={attendance.leave} color="text-blue-400" />
            <StatCard label="Absent" value={attendance.absent} color="text-red-400" />
          </div>

          {/* 3-month trend */}
          {attendanceTrend?.length > 0 && (
            <div className="mt-3 bg-slate-800/60 border border-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium mb-3">3-Month Trend</p>
              <div className="flex items-end gap-4">
                {attendanceTrend.map((t: any) => (
                  <div key={`${t.month}-${t.year}`} className="flex-1 text-center">
                    <div className="flex items-end justify-center gap-0.5 h-16 mb-1">
                      <div className="w-full rounded-t-md transition-all"
                        style={{ height: `${Math.max(4, t.pct)}%`, background: t.pct >= 85 ? '#22c55e' : t.pct >= 70 ? '#eab308' : '#ef4444', opacity: 0.8 }} />
                    </div>
                    <p className="text-white text-sm font-bold">{t.pct}%</p>
                    <p className="text-gray-500 text-xs">{MONTH_NAMES[t.month - 1]} {t.year}</p>
                    <p className="text-gray-600 text-[10px]">{t.present}P · {t.absent}A</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Tasks ───────────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-bold">Tasks</h2>
            <span className="text-gray-500 text-sm">({tasks.total} total)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <StatCard label="To Do" value={tasks.todo} color="text-gray-400" />
            <StatCard label="In Progress" value={tasks.inProgress} color="text-blue-400" />
            <StatCard label="Review" value={tasks.review} color="text-yellow-400" />
            <StatCard label="Done" value={tasks.done} sub={`${tasks.completionPct}% complete`} color="text-green-400" />
          </div>

          {/* Progress bar */}
          {tasks.total > 0 && (
            <div className="bg-slate-800/60 border border-white/5 rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Overall Completion</span>
                <span className="text-white text-sm font-bold">{tasks.completionPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${tasks.completionPct}%` }} />
              </div>
            </div>
          )}

          {/* Recent tasks */}
          {tasks.recent?.length > 0 && (
            <div className="bg-slate-800/60 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Recent Tasks</p>
              </div>
              <div className="divide-y divide-white/5">
                {tasks.recent.map((task: any) => {
                  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG['todo']
                  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['medium']
                  const StatusIcon = statusCfg.icon
                  return (
                    <div key={task._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusCfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{task.title}</p>
                        {task.dueDate && <p className="text-gray-500 text-xs mt-0.5">Due {format(new Date(task.dueDate), 'dd MMM yyyy')}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${priCfg.color} ${priCfg.bg}`}>{priCfg.label}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${statusCfg.color} ${statusCfg.bg}`}>{statusCfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tasks.total === 0 && (
            <div className="text-center py-8 text-gray-500 bg-slate-800/40 border border-white/5 rounded-xl">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks assigned yet</p>
            </div>
          )}
        </div>

        {/* ── Goals / OKR ─────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-bold">Goals / OKR</h2>
            <span className="text-gray-500 text-sm">({goals?.length || 0} goals)</span>
          </div>

          {goals?.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal: any) => {
                const cfg = GOAL_STATUS_CONFIG[goal.status] || GOAL_STATUS_CONFIG['on-track']
                return (
                  <div key={goal._id} className="bg-slate-800/60 border border-white/5 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">{goal.title}</p>
                        {goal.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{goal.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-gray-600 text-xs">{goal.quarter} {goal.year}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${cfg.color} ${cfg.bg}`}>
                            {goal.status?.replace('-', ' ')}
                          </span>
                          {goal.dueDate && <span className="text-gray-600 text-xs">Due {format(new Date(goal.dueDate), 'dd MMM yyyy')}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xl font-black ${cfg.color}`}>{goal.progress}%</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cfg.bar}`}
                        style={{ width: `${goal.progress}%` }} />
                    </div>
                    {goal.keyResults?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {goal.keyResults.map((kr: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-400 flex-1 truncate">{kr.title}</span>
                            <span className="text-gray-500 font-mono">{kr.current}/{kr.target} {kr.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-slate-800/40 border border-white/5 rounded-xl">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No goals assigned yet</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
