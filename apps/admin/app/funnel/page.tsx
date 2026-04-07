'use client'
import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { TrendingDown, Users, ShoppingCart, CreditCard, Award, ArrowDown } from 'lucide-react'

export default function FunnelPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.peptly.in/api'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, purchasesRes, leadsRes] = await Promise.all([
          fetch(`${API}/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/purchases?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/crm/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const [u, p, l] = await Promise.all([usersRes.json(), purchasesRes.json(), leadsRes.json()])
        setData({ users: u, purchases: p, leads: l })
      } catch {}
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const totalUsers = data?.users?.users?.total || 0
  const totalLeads = data?.users?.leads?.total || 0
  const hotLeads = data?.users?.leads?.hot || 0
  const totalPurchases = data?.purchases?.total || 0
  const totalRevenue = data?.users?.revenue?.total || 0

  const stages = [
    { label: 'Visitors / Leads', value: totalLeads, icon: Users, color: 'bg-blue-500', pct: 100 },
    { label: 'Registered Users', value: totalUsers, icon: Users, color: 'bg-indigo-500', pct: totalLeads > 0 ? Math.round((totalUsers/totalLeads)*100) : 0 },
    { label: 'Hot Leads', value: hotLeads, icon: TrendingDown, color: 'bg-orange-500', pct: totalLeads > 0 ? Math.round((hotLeads/totalLeads)*100) : 0 },
    { label: 'Purchases', value: totalPurchases, icon: ShoppingCart, color: 'bg-violet-500', pct: totalUsers > 0 ? Math.round((totalPurchases/Math.max(totalUsers,1))*100) : 0 },
    { label: 'Revenue (₹)', value: `₹${totalRevenue?.toLocaleString('en-IN')}`, icon: CreditCard, color: 'bg-green-500', pct: null },
  ]

  const tierData = data?.users?.packages || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><TrendingDown className="w-8 h-8 text-violet-400" /> Funnel Tracking</h1>
          <p className="text-gray-400 mt-1">Visualize your lead-to-customer conversion funnel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel */}
            <div className="lg:col-span-2 card">
              <h2 className="text-lg font-bold text-white mb-6">Conversion Funnel</h2>
              <div className="space-y-3">
                {stages.map((s, i) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <s.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{s.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">{s.value}</span>
                        {s.pct !== null && <span className="text-xs text-gray-400 ml-2">({s.pct}%)</span>}
                      </div>
                    </div>
                    <div className="h-10 bg-white/5 rounded-xl overflow-hidden relative">
                      <div className={`h-full ${s.color} rounded-xl transition-all duration-500 flex items-center justify-center`}
                        style={{ width: `${s.pct ?? 60}%` }}>
                        <span className="text-white text-xs font-bold">{s.pct !== null ? `${s.pct}%` : ''}</span>
                      </div>
                    </div>
                    {i < stages.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Package breakdown */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Package Distribution</h2>
              <div className="space-y-3">
                {tierData.length > 0 ? tierData.map((t: any) => (
                  <div key={t._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                    <span className="text-sm text-white capitalize font-medium">{t._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((t.count/Math.max(totalUsers,1))*100, 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-white">{t.count}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-8">No package data yet</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Conversion Tips</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• Follow up hot leads within 2 hours</p>
                  <p>• Offer limited-time discounts to warm leads</p>
                  <p>• Use WhatsApp for faster conversions</p>
                  <p>• Free webinar → paid package upsell</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
