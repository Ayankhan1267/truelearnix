'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  UserCheck, Users, IndianRupee, ShoppingBag, TrendingUp,
  Search, RefreshCw, X, CheckCircle, ChevronRight, Loader2,
  UserPlus, ClipboardList, Eye, Phone, MessageCircle, BarChart2, Target
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  token_paid: 'bg-blue-500/20 text-blue-400',
  partial:    'bg-orange-500/20 text-orange-400',
  paid:       'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
}

const STAGE_COLOR: Record<string, string> = {
  new:         'bg-gray-500/20 text-gray-400',
  contacted:   'bg-blue-500/20 text-blue-400',
  interested:  'bg-yellow-500/20 text-yellow-400',
  demo_done:   'bg-purple-500/20 text-purple-400',
  negotiating: 'bg-orange-500/20 text-orange-400',
  paid:        'bg-green-500/20 text-green-400',
  lost:        'bg-red-500/20 text-red-400',
}

export default function SalesTeamPage() {
  const [tab, setTab] = useState<'team' | 'orders' | 'leads'>('team')
  const [salespersons, setSalespersons] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Assign leads modal
  const [assignModal, setAssignModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [assignTo, setAssignTo] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Performance modal
  const [perfModal, setPerfModal] = useState(false)
  const [perfData, setPerfData] = useState<any>(null)
  const [perfLoading, setPerfLoading] = useState(false)

  useEffect(() => { fetchStats() }, [])
  useEffect(() => {
    if (tab === 'team') fetchTeam()
    else if (tab === 'orders') fetchOrders()
    else fetchLeads()
  }, [tab, search, statusFilter, page])

  const fetchStats = async () => {
    try { const r = await adminAPI.salesStats(); setStats(r.data.stats) } catch {}
  }

  const fetchTeam = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.salespersons({ search, page, limit: 15 })
      setSalespersons(r.data.salespersons || [])
      setTotalPages(r.data.pages || 1)
    } catch { toast.error('Failed to load team') }
    finally { setLoading(false) }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.salesOrders({ status: statusFilter, page, limit: 20 })
      setOrders(r.data.orders || [])
      setTotalPages(r.data.pages || 1)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.crmLeads({ search, page, limit: 20 })
      setLeads(r.data.leads || [])
      setTotalPages(r.data.pages || 1)
    } catch { toast.error('Failed to load leads') }
    finally { setLoading(false) }
  }

  const handleAssignLeads = async () => {
    if (!selectedLeads.length || !assignTo) return toast.error('Select leads and salesperson')
    setAssigning(true)
    try {
      await adminAPI.assignLeads(selectedLeads, assignTo)
      toast.success(`${selectedLeads.length} lead(s) assigned!`)
      setSelectedLeads([])
      setAssignModal(false)
      fetchLeads()
    } catch { toast.error('Failed to assign') }
    finally { setAssigning(false) }
  }

  const toggleLead = (id: string) =>
    setSelectedLeads(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const [perfSpId, setPerfSpId] = useState('')
  const [perfStageFilter, setPerfStageFilter] = useState('')
  const [perfDateFilter, setPerfDateFilter] = useState('')
  const [perfTab, setPerfTab] = useState<'overview' | 'leads'>('overview')

  const getAuthHeader = () => ({
    Authorization: `Bearer ${typeof window !== 'undefined' ? (document.cookie.match(/adminToken=([^;]+)/)?.[1] || localStorage.getItem('adminToken') || '') : ''}`
  })

  const openPerformance = async (spId: string) => {
    setPerfLoading(true); setPerfModal(true); setPerfData(null)
    setPerfSpId(spId); setPerfStageFilter(''); setPerfDateFilter(''); setPerfTab('overview')
    try {
      const r = await api.get(`/admin/salespersons/${spId}/performance`, { headers: getAuthHeader() })
      setPerfData(r.data)
    } catch { toast.error('Failed to load performance') }
    finally { setPerfLoading(false) }
  }

  const refetchPerfLeads = async (spId: string, stage: string, date: string) => {
    try {
      const r = await api.get(`/admin/salespersons/${spId}/performance?stage=${stage}&dateFilter=${date}`, { headers: getAuthHeader() })
      setPerfData((prev: any) => prev ? { ...prev, assignedLeads: r.data.assignedLeads } : r.data)
    } catch {}
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-blue-400" /> Sales Team
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your sales team, orders and leads</p>
          </div>
          <button onClick={() => { fetchStats(); if (tab === 'team') fetchTeam(); else if (tab === 'orders') fetchOrders(); else fetchLeads() }}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Salespersons', value: stats.totalSalespersons || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Paid Orders', value: stats.paidOrders || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Total Revenue', value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit">
          {(['team', 'orders', 'leads'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(1); setSearch('') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t === 'team' ? 'Sales Team' : t === 'orders' ? 'Orders' : 'Assign Leads'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {(tab === 'team' || tab === 'leads') && (
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder={tab === 'team' ? 'Search by name or email...' : 'Search leads...'}
                className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm border border-white/10 outline-none focus:border-blue-500" />
            </div>
          )}
          {tab === 'orders' && (
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 outline-none min-w-40">
              <option value="">All Status</option>
              {['pending','token_paid','partial','paid','cancelled'].map(s => (
                <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>
              ))}
            </select>
          )}
          {tab === 'leads' && selectedLeads.length > 0 && (
            <button onClick={() => setAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
              <UserPlus className="w-4 h-4" /> Assign {selectedLeads.length} Lead(s)
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-400" /></div>
        ) : (
          <>
            {/* ── Team Tab ── */}
            {tab === 'team' && (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
                {salespersons.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    <p className="text-gray-400">No salespersons found</p>
                    <p className="text-gray-600 text-sm mt-1">Create a user with role "salesperson" from Users page</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-700/30">
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Salesperson</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Code</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Orders</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Converted</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Earnings</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Status</th>
                          <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {salespersons.map((s: any) => (
                          <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                                  {s.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-sm">{s.name}</p>
                                  <p className="text-gray-500 text-xs">{s.email}</p>
                                  {s.phone && <p className="text-gray-600 text-xs">{s.phone}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <span className="font-mono text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-lg">{s.affiliateCode || '—'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-white font-semibold">{s.totalOrders || 0}</p>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <p className="text-green-400 font-semibold">{s.paidOrders || 0}</p>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <p className="text-white font-semibold">₹{(s.totalEarnings || 0).toLocaleString()}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${s.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {s.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button onClick={() => openPerformance(s._id)}
                                className="p-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-colors" title="View Performance">
                                <BarChart2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Orders Tab ── */}
            {tab === 'orders' && (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    <p className="text-gray-400">No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-700/30">
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Customer</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Package</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Amount</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Status</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Salesperson</th>
                          <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((o: any) => (
                          <tr key={o._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4">
                              <p className="text-white font-semibold text-sm">{o.customer?.name}</p>
                              <p className="text-gray-500 text-xs">{o.customer?.phone}</p>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <p className="text-white text-sm">{o.packageTier || '—'}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-white font-bold">₹{(o.totalAmount || 0).toLocaleString()}</p>
                              {o.paymentType === 'emi' && (
                                <p className="text-xs text-purple-400">EMI · Paid ₹{(o.paidAmount || 0).toLocaleString()}</p>
                              )}
                              {o.paymentType === 'token' && (
                                <p className="text-xs text-blue-400">Token ₹{(o.tokenAmount || 0).toLocaleString()} · Paid ₹{(o.paidAmount || 0).toLocaleString()}</p>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium capitalize ${STATUS_COLOR[o.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                {o.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <p className="text-gray-300 text-sm">{o.salesperson?.name || '—'}</p>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <p className="text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Leads Tab ── */}
            {tab === 'leads' && (
              <div className="space-y-3">
                {leads.length === 0 ? (
                  <div className="text-center py-16 bg-slate-800/60 rounded-2xl border border-white/5">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    <p className="text-gray-400">No leads found</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{selectedLeads.length > 0 ? `${selectedLeads.length} selected` : 'Select leads to assign to a salesperson'}</p>
                      {selectedLeads.length > 0 && (
                        <button onClick={() => setSelectedLeads([])} className="text-xs text-gray-400 hover:text-white">Clear selection</button>
                      )}
                    </div>
                    <div className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-slate-700/30">
                              <th className="px-5 py-3.5 w-10">
                                <input type="checkbox"
                                  checked={selectedLeads.length === leads.length && leads.length > 0}
                                  onChange={e => setSelectedLeads(e.target.checked ? leads.map((l: any) => l._id) : [])}
                                  className="rounded" />
                              </th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Lead</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Stage</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Assigned To</th>
                              <th className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Source</th>
                              <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Contact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {leads.map((l: any) => (
                              <tr key={l._id}
                                onClick={() => toggleLead(l._id)}
                                className={`cursor-pointer transition-colors ${selectedLeads.includes(l._id) ? 'bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}>
                                <td className="px-5 py-4">
                                  <input type="checkbox" checked={selectedLeads.includes(l._id)}
                                    onChange={() => toggleLead(l._id)}
                                    onClick={e => e.stopPropagation()}
                                    className="rounded" />
                                </td>
                                <td className="px-5 py-4">
                                  <p className="text-white font-semibold text-sm">{l.name}</p>
                                  <p className="text-gray-500 text-xs">{l.phone}</p>
                                </td>
                                <td className="px-5 py-4 hidden md:table-cell">
                                  <span className={`text-xs px-2 py-1 rounded-lg font-medium capitalize ${STAGE_COLOR[l.stage] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {l.stage?.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  {l.assignedTo ? (
                                    <span className="text-xs text-green-300 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5 text-green-400" /> {l.assignedTo.name || 'Assigned'}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">Unassigned</span>
                                  )}
                                </td>
                                <td className="px-5 py-4 hidden sm:table-cell">
                                  <span className="text-xs text-gray-500 capitalize">{l.source?.replace('_', ' ')}</span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <a href={`tel:${l.phone}`} className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors" title="Call">
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <a href={`https://wa.me/${l.phone?.replace(/[^0-9]/g,'').replace(/^0/,'91')}`} target="_blank" rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors" title="WhatsApp">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400 hover:text-white border border-white/10'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Performance Modal */}
      {perfModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl my-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{perfData?.salesperson?.name || 'Salesperson'}</h2>
                  <p className="text-gray-500 text-xs">Sales Performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {perfData?.salesperson?.phone && (
                  <>
                    <a href={`tel:${perfData.salesperson.phone}`}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`https://wa.me/${perfData.salesperson.phone?.replace(/[^0-9]/g,'').replace(/^0/,'91')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </>
                )}
                <button onClick={() => setPerfModal(false)} className="p-2 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {perfLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-violet-400" /></div>
            ) : perfData ? (
              <div className="p-5 space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Total Leads', value: perfData.totalLeads || 0, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
                    { label: 'Paid This Month', value: perfData.monthOrders || 0, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/15' },
                    { label: 'Total Earned', value: `₹${((perfData.totalCommissions || 0) / 1000).toFixed(1)}k`, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/15' },
                    { label: 'This Month Comm.', value: `₹${((perfData.monthCommissions || 0) / 1000).toFixed(1)}k`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/15' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 border ${s.bg}`}>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit">
                  {(['overview', 'leads'] as const).map(t => (
                    <button key={t} onClick={() => setPerfTab(t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${perfTab === t ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                      {t === 'overview' ? 'Orders' : 'Leads Pipeline'}
                    </button>
                  ))}
                </div>

                {/* Overview tab */}
                {perfTab === 'overview' && (
                  <>
                    {/* Pipeline summary */}
                    {Object.keys(perfData.leadsByStage || {}).length > 0 && (() => {
                      const total = perfData.totalLeads || 1
                      const paidC = perfData.leadsByStage?.paid || 0
                      const convRate = Math.round((paidC / total) * 100)
                      return (
                        <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lead Pipeline</p>
                            <span className="text-xs text-green-400 font-bold">{convRate}% Conversion</span>
                          </div>
                          <div className="space-y-1.5">
                            {(['new','contacted','interested','demo_done','negotiating','paid','lost'] as const).map(s => {
                              const cnt = perfData.leadsByStage?.[s] || 0
                              if (!cnt) return null
                              const pct = Math.max(5, Math.round((cnt / total) * 100))
                              const meta = STAGE_COLOR[s] || 'bg-gray-500/20 text-gray-400'
                              const bars: Record<string,string> = { new:'bg-slate-500',contacted:'bg-blue-500',interested:'bg-amber-500',demo_done:'bg-purple-500',negotiating:'bg-orange-500',paid:'bg-green-500',lost:'bg-red-500' }
                              return (
                                <div key={s} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 w-20 flex-shrink-0 capitalize">{s.replace('_',' ')}</span>
                                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${bars[s]} rounded-full`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-white w-5 text-right">{cnt}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${convRate}%` }} />
                          </div>
                        </div>
                      )
                    })()}

                    {/* Recent Orders */}
                    {perfData.orders?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Recent Orders</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {perfData.orders.map((o: any) => (
                            <div key={o._id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                              <div>
                                <p className="text-white text-sm font-semibold">{o.customer?.name}</p>
                                <p className="text-gray-500 text-xs capitalize">{o.packageTier} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold text-sm">₹{(o.totalAmount || 0).toLocaleString()}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${STATUS_COLOR[o.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                  {o.status?.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Leads tab */}
                {perfTab === 'leads' && (
                  <div className="space-y-3">
                    {/* Lead filters */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Stage filter */}
                      <div className="flex gap-1 flex-wrap">
                        {['', 'new','contacted','interested','demo_done','negotiating','paid','lost'].map(s => (
                          <button key={s} onClick={() => {
                            setPerfStageFilter(s)
                            refetchPerfLeads(perfSpId, s, perfDateFilter)
                          }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                              perfStageFilter === s
                                ? (s ? `${STAGE_COLOR[s]} border-current` : 'bg-violet-600 text-white border-violet-500')
                                : 'border-white/10 text-gray-500 hover:text-gray-300'
                            }`}>
                            {s ? s.replace('_',' ') : 'All'}
                          </button>
                        ))}
                      </div>
                      {/* Date filter */}
                      <div className="flex gap-1 ml-auto">
                        {[{l:'Today',v:'today'},{l:'7d',v:'7d'},{l:'30d',v:'30d'},{l:'All',v:''}].map(df => (
                          <button key={df.v} onClick={() => {
                            setPerfDateFilter(df.v)
                            refetchPerfLeads(perfSpId, perfStageFilter, df.v)
                          }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              perfDateFilter === df.v ? 'bg-slate-600 text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}>
                            {df.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lead list */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {(perfData.assignedLeads || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No leads found</div>
                      ) : (perfData.assignedLeads || []).map((l: any) => (
                        <div key={l._id} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-xs font-black text-blue-300 flex-shrink-0">
                            {l.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{l.name}</p>
                            <p className="text-gray-500 text-xs">{l.phone} {l.city ? `· ${l.city}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold capitalize ${STAGE_COLOR[l.stage] || 'bg-gray-500/20 text-gray-400'}`}>
                              {l.stage?.replace('_',' ') || 'new'}
                            </span>
                            <a href={`tel:${l.phone}`}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                              <Phone className="w-3 h-3" />
                            </a>
                            <a href={`https://wa.me/${l.phone?.replace(/[^0-9]/g,'').replace(/^0/,'91')}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 text-center">{(perfData.assignedLeads || []).length} leads shown</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Assign Leads Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Assign Leads</h2>
              <button onClick={() => setAssignModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-white font-semibold">{selectedLeads.length} lead(s) selected</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium uppercase tracking-wide">Assign to Salesperson</label>
              <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 text-sm border border-white/10 outline-none focus:border-blue-500">
                <option value="">— Select Salesperson —</option>
                {salespersons.map(s => (
                  <option key={s._id} value={s._id}>{s.name} · {s.totalOrders || 0} orders</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white">Cancel</button>
              <button onClick={handleAssignLeads} disabled={assigning || !assignTo}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
