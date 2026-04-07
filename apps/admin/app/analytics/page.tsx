'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight } from 'lucide-react'

const periods = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

function BarChart({ data, valueKey, labelKey, color = 'bg-violet-500' }: any) {
  const max = Math.max(...data.map((d: any) => d[valueKey] || 0), 1)
  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {data.map((d: any, i: number) => {
        const pct = Math.round((d[valueKey] / max) * 100)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {d[labelKey]}: {typeof d[valueKey] === 'number' && d[valueKey] > 1000 ? `₹${(d[valueKey]/1000).toFixed(1)}K` : d[valueKey]}
            </div>
            <div className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity`} style={{ height: `${Math.max(pct, 2)}%` }} />
            <span className="text-[9px] text-gray-500 truncate w-full text-center">{d[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [revPeriod, setRevPeriod] = useState('30d')
  const [userPeriod, setUserPeriod] = useState('30d')

  const { data: revData } = useQuery({
    queryKey: ['analytics-revenue', revPeriod],
    queryFn: () => adminAPI.analyticsRevenue(revPeriod).then(r => r.data)
  })
  const { data: userData } = useQuery({
    queryKey: ['analytics-users', userPeriod],
    queryFn: () => adminAPI.analyticsUsers(userPeriod).then(r => r.data)
  })
  const { data: economics } = useQuery({
    queryKey: ['unit-economics'],
    queryFn: () => adminAPI.unitEconomics().then(r => r.data)
  })

  const revChartData = revData?.data || revData?.revenue || []
  const userChartData = userData?.data || userData?.users || []

  const totalRev = revChartData.reduce((s: number, d: any) => s + (d.revenue || d.amount || 0), 0)
  const totalUsers = userChartData.reduce((s: number, d: any) => s + (d.count || d.users || 0), 0)

  const cac = economics?.cac || 0
  const ltv = economics?.ltv || 0
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : '—'
  const payback = economics?.paybackMonths || (cac > 0 && ltv > 0 ? Math.ceil(cac / (ltv / 12)) : 0)

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Unit Economics */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Unit Economics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={Target} label="CAC" value={`₹${cac.toLocaleString()}`} sub="Customer Acq. Cost" color="bg-blue-500/20 text-blue-400" />
            <MetricCard icon={TrendingUp} label="LTV" value={`₹${ltv.toLocaleString()}`} sub="Lifetime Value" color="bg-green-500/20 text-green-400" />
            <MetricCard icon={ArrowUpRight} label="LTV:CAC Ratio" value={`${ltvCac}x`} sub={Number(ltvCac) >= 3 ? 'Healthy' : 'Needs improvement'} color="bg-violet-500/20 text-violet-400" />
            <MetricCard icon={DollarSign} label="Payback Period" value={`${payback}mo`} sub="Months to recover CAC" color="bg-amber-500/20 text-amber-400" />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Revenue Over Time</h2>
              <p className="text-gray-400 text-sm mt-0.5">Total: ₹{(totalRev / 1000).toFixed(1)}K</p>
            </div>
            <div className="flex gap-1 bg-slate-700/50 rounded-xl p-1">
              {periods.map(p => (
                <button key={p.value} onClick={() => setRevPeriod(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${revPeriod === p.value ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {revChartData.length > 0 ? (
            <BarChart data={revChartData} valueKey="revenue" labelKey="date" color="bg-violet-500" />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500 text-sm">No data available</div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">User Growth</h2>
              <p className="text-gray-400 text-sm mt-0.5">+{totalUsers} new users</p>
            </div>
            <div className="flex gap-1 bg-slate-700/50 rounded-xl p-1">
              {periods.map(p => (
                <button key={p.value} onClick={() => setUserPeriod(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${userPeriod === p.value ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {userChartData.length > 0 ? (
            <BarChart data={userChartData} valueKey="count" labelKey="date" color="bg-green-500" />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500 text-sm">No data available</div>
          )}
        </div>

        {/* Revenue vs Users combined stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-violet-400" /> Revenue Breakdown
            </h3>
            <div className="space-y-3">
              {revChartData.slice(-5).reverse().map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300 text-sm">{d.date || d.label || `Period ${i + 1}`}</span>
                  <span className="text-white font-semibold text-sm">₹{(d.revenue || d.amount || 0).toLocaleString()}</span>
                </div>
              ))}
              {revChartData.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No data</p>}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" /> User Signups
            </h3>
            <div className="space-y-3">
              {userChartData.slice(-5).reverse().map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300 text-sm">{d.date || d.label || `Period ${i + 1}`}</span>
                  <span className="text-white font-semibold text-sm">+{d.count || d.users || 0}</span>
                </div>
              ))}
              {userChartData.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No data</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
