'use client'
import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { BarChart2, Target, MousePointerClick, TrendingUp, IndianRupee, Plus } from 'lucide-react'

export default function AdsTrackingPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.peptly.in/api'

  useEffect(() => {
    fetch(`${API}/crm/leads?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setLeads(d.leads || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const sources = ['meta_ads', 'google_ads', 'organic', 'referral', 'youtube', 'other']
  const sourceStats = sources.map(src => {
    const srcLeads = leads.filter(l => l.source === src)
    const converted = srcLeads.filter(l => l.stage === 'paid').length
    return { source: src, total: srcLeads.length, converted, rate: srcLeads.length > 0 ? ((converted/srcLeads.length)*100).toFixed(1) : '0' }
  }).filter(s => s.total > 0)

  const totalLeads = leads.length
  const converted = leads.filter(l => l.stage === 'paid').length
  const hot = leads.filter(l => l.aiScoreLabel === 'hot').length

  const SOURCE_LABELS: Record<string, string> = {
    meta_ads: 'Meta Ads (FB/IG)', google_ads: 'Google Ads', organic: 'Organic',
    referral: 'Referral', youtube: 'YouTube', other: 'Other'
  }
  const SOURCE_COLORS: Record<string, string> = {
    meta_ads: 'bg-blue-500', google_ads: 'bg-red-500', organic: 'bg-green-500',
    referral: 'bg-violet-500', youtube: 'bg-pink-500', other: 'bg-gray-500'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Target className="w-8 h-8 text-violet-400" /> Ads & Traffic Tracking</h1>
          <p className="text-gray-400 mt-1">Track lead sources, conversions and ad performance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: totalLeads, icon: MousePointerClick, color: 'text-blue-400' },
            { label: 'Converted', value: converted, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Hot Leads', value: hot, icon: Target, color: 'text-orange-400' },
            { label: 'Conversion Rate', value: totalLeads > 0 ? `${((converted/totalLeads)*100).toFixed(1)}%` : '0%', icon: BarChart2, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Source breakdown */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5">Lead Source Performance</h2>
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : sourceStats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No lead source data yet. Add UTM parameters to your ads.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sourceStats.sort((a,b) => b.total - a.total).map(s => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${SOURCE_COLORS[s.source] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium text-white">{SOURCE_LABELS[s.source] || s.source}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">{s.total} leads</span>
                      <span className="text-green-400">{s.converted} converted</span>
                      <span className="font-bold text-white">{s.rate}%</span>
                    </div>
                  </div>
                  <div className="h-6 bg-white/5 rounded-lg overflow-hidden flex">
                    <div className={`${SOURCE_COLORS[s.source] || 'bg-gray-500'} h-full rounded-lg flex items-center justify-center`}
                      style={{ width: `${(s.total/totalLeads)*100}%` }}>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UTM Guide */}
        <div className="card border border-violet-500/20 bg-violet-500/5">
          <h2 className="text-lg font-bold text-white mb-3">UTM Tracking Setup</h2>
          <p className="text-sm text-gray-400 mb-4">Add these parameters to your ad URLs to track performance:</p>
          <div className="bg-slate-800 rounded-xl p-4 font-mono text-xs text-green-400 break-all">
            https://peptly.in?ref=YOURCODE<br />
            &utm_source=meta_ads<br />
            &utm_medium=paid<br />
            &utm_campaign=digital_marketing_jan
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {['meta_ads', 'google_ads', 'youtube', 'organic', 'referral', 'whatsapp'].map(src => (
              <div key={src} className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-300">
                <span className="text-gray-500">utm_source=</span>{src}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
