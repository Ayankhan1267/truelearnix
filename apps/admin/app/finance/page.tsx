'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  TrendingUp, TrendingDown, DollarSign, Receipt,
  FileText, ArrowUpRight, ArrowDownRight,
  Plus, Trash2, X, Loader2,
  Wallet, BarChart3, PieChart,
  ShieldCheck, Calculator, BadgePercent, Coins
} from 'lucide-react'
import { format } from 'date-fns'

type Tab = 'overview' | 'pnl' | 'gst' | 'tds' | 'expenses'

const fmt = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const fmtShort = (n: number) => {
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

const EXPENSE_CATEGORIES = ['server','marketing','salary','tools','office','refund','legal','other']
const catColors: Record<string,string> = {
  server:'bg-blue-500/20 text-blue-400', marketing:'bg-pink-500/20 text-pink-400',
  salary:'bg-violet-500/20 text-violet-400', tools:'bg-cyan-500/20 text-cyan-400',
  office:'bg-amber-500/20 text-amber-400', refund:'bg-red-500/20 text-red-400',
  legal:'bg-orange-500/20 text-orange-400', other:'bg-gray-500/20 text-gray-400',
}
const tierColors: Record<string,string> = {
  starter:'text-sky-400 bg-sky-500/20', pro:'text-violet-400 bg-violet-500/20',
  elite:'text-amber-400 bg-amber-500/20', supreme:'text-rose-400 bg-rose-500/20', free:'text-gray-400 bg-gray-500/20'
}

function GrowthBadge({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-lg ${positive ? 'text-green-400 bg-green-500/15' : 'text-red-400 bg-red-500/15'}`}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, sub, growth, color, border }: any) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} border ${border} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white/70" />
        </div>
        {growth !== undefined && <GrowthBadge value={growth} />}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-white/60 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function FinanceDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [period, setPeriod] = useState('mtd')
  const [pnlYear, setPnlYear] = useState(new Date().getFullYear())
  const [gstYear, setGstYear] = useState(new Date().getFullYear())
  const [tdsYear, setTdsYear] = useState(new Date().getFullYear())
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expForm, setExpForm] = useState({ title:'', category:'server', amount:'', gstPaid:'', vendor:'', invoiceNumber:'', date: format(new Date(),'yyyy-MM-dd'), notes:'' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const qc = useQueryClient()

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['finance-overview', period],
    queryFn: () => adminAPI.financeOverview(period).then(r => r.data),
  })
  const { data: pnlData, isLoading: loadingPnl } = useQuery({
    queryKey: ['finance-pnl', pnlYear],
    queryFn: () => adminAPI.financePnl(pnlYear).then(r => r.data),
    enabled: tab === 'pnl',
  })
  const { data: gstData, isLoading: loadingGst } = useQuery({
    queryKey: ['finance-gst', gstYear],
    queryFn: () => adminAPI.financeGst(gstYear).then(r => r.data),
    enabled: tab === 'gst',
  })
  const { data: tdsData, isLoading: loadingTds } = useQuery({
    queryKey: ['finance-tds', tdsYear],
    queryFn: () => adminAPI.financeTds(tdsYear).then(r => r.data),
    enabled: tab === 'tds',
  })
  const { data: expData, isLoading: loadingExp } = useQuery({
    queryKey: ['finance-expenses'],
    queryFn: () => adminAPI.financeExpenses().then(r => r.data),
    enabled: tab === 'expenses',
  })

  const s = overview?.summary || {}

  const saveExpense = async () => {
    if (!expForm.title || !expForm.category || !expForm.amount) return toast.error('Title, category, amount required')
    setSaving(true)
    try {
      await adminAPI.addExpense({ ...expForm, amount: Number(expForm.amount), gstPaid: Number(expForm.gstPaid) || 0 })
      toast.success('Expense added')
      setShowExpenseModal(false)
      setExpForm({ title:'', category:'server', amount:'', gstPaid:'', vendor:'', invoiceNumber:'', date: format(new Date(),'yyyy-MM-dd'), notes:'' })
      qc.invalidateQueries({ queryKey: ['finance-expenses'] })
      qc.invalidateQueries({ queryKey: ['finance-overview'] })
    } catch { toast.error('Failed to add') } finally { setSaving(false) }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    setDeletingId(id)
    try {
      await adminAPI.deleteExpense(id)
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['finance-expenses'] })
      qc.invalidateQueries({ queryKey: ['finance-overview'] })
    } catch { toast.error('Failed') } finally { setDeletingId('') }
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pnl', label: 'P&L Report', icon: TrendingUp },
    { id: 'gst', label: 'GST', icon: BadgePercent },
    { id: 'tds', label: 'TDS', icon: ShieldCheck },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-violet-400" /> Finance Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Revenue, GST, TDS, P&L — complete financial picture</p>
          </div>
          {tab === 'expenses' && (
            <button onClick={() => setShowExpenseModal(true)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-2xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Period selector */}
            <div className="flex flex-wrap gap-2">
              {[['mtd','This Month'],['ytd','This Year'],['30d','Last 30d'],['90d','Last 90d'],['7d','Last 7d'],['all','All Time']].map(([v,l]) => (
                <button key={v} onClick={() => setPeriod(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${period === v ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                  {l}
                </button>
              ))}
            </div>

            {loadingOverview ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"/>)}</div>
            ) : (
              <>
                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={DollarSign} label="Gross Revenue" value={fmtShort(s.grossRevenue||0)} sub={`${s.salesCount||0} sales`} growth={s.revenueGrowth} color="from-violet-500/20 to-violet-600/5" border="border-violet-500/25" />
                  <KpiCard icon={TrendingUp} label="Net Revenue (ex-GST)" value={fmtShort(s.netRevenue||0)} color="from-blue-500/20 to-blue-600/5" border="border-blue-500/25" />
                  <KpiCard icon={TrendingDown} label="Net Profit / Loss" value={fmtShort(s.netProfit||0)} sub="After all deductions" color={s.netProfit >= 0 ? "from-green-500/20 to-green-600/5" : "from-red-500/20 to-red-600/5"} border={s.netProfit >= 0 ? "border-green-500/25" : "border-red-500/25"} />
                  <KpiCard icon={BarChart3} label="Gross Profit" value={fmtShort(s.grossProfit||0)} color="from-emerald-500/20 to-emerald-600/5" border="border-emerald-500/25" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={BadgePercent} label="GST Collected" value={fmtShort(s.gstCollected||0)} sub={`Input credit: ${fmt(s.gstPaidOnExpenses||0)}`} color="from-orange-500/20 to-orange-600/5" border="border-orange-500/25" />
                  <KpiCard icon={ShieldCheck} label="TDS Deducted (2%)" value={fmtShort(s.tdsDeducted||0)} sub={`On ${fmt(s.paidCommissions||0)} commissions`} color="from-red-500/20 to-red-600/5" border="border-red-500/25" />
                  <KpiCard icon={Coins} label="Commissions Due" value={fmtShort(s.totalCommissions||0)} sub={`${s.pendingCommCount||0} pending (${fmtShort(s.pendingComm||0)})`} color="from-amber-500/20 to-amber-600/5" border="border-amber-500/25" />
                  <KpiCard icon={Wallet} label="Withdrawals Paid" value={fmtShort(s.withdrawalsPaid||0)} sub={`${s.pendingWithdCount||0} pending (${fmtShort(s.pendingWithd||0)})`} color="from-pink-500/20 to-pink-600/5" border="border-pink-500/25" />
                </div>

                {/* P&L Summary card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-violet-400"/>P&L Summary</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Gross Revenue', value: s.grossRevenue||0, color:'text-green-400', plus: true },
                        { label: 'GST Collected', value: s.gstCollected||0, color:'text-orange-400', indent: true, plus: false, note:'Payable to Govt' },
                        { label: '(-) Commissions Paid', value: s.totalCommissions||0, color:'text-red-400', plus: false },
                        { label: '(-) Withdrawals Processed', value: s.withdrawalsPaid||0, color:'text-red-400', plus: false },
                        { label: '(-) Operating Expenses', value: s.totalExpenses||0, color:'text-red-400', plus: false, growth: s.expenseGrowth },
                        { label: '(-) TDS Deducted (2%)', value: s.tdsDeducted||0, color:'text-red-300', plus: false, note:'Govt deposit' },
                        { label: 'Net Profit', value: s.netProfit||0, color: s.netProfit>=0?'text-green-400':'text-red-400', plus: false, bold: true },
                      ].map((row,i) => (
                        <div key={i} className={`flex items-center justify-between py-2 ${i<6?'border-b border-white/5':''} ${row.bold?'mt-2 pt-3 border-t-2 border-white/10':''}`}>
                          <span className={`text-sm ${row.bold?'font-bold text-white':'text-gray-400'} ${row.indent?'ml-4':''}`}>{row.label}{row.note&&<span className="text-xs text-gray-600 ml-2">({row.note})</span>}</span>
                          <div className="flex items-center gap-2">
                            {row.growth!==undefined && <GrowthBadge value={row.growth}/>}
                            <span className={`font-semibold ${row.bold?'text-lg':''} ${row.color}`}>{fmt(row.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier breakdown */}
                  <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 p-5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-violet-400"/>Revenue by Tier</h3>
                    {(overview?.tierBreakdown||[]).length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">No sales yet</p>
                    ) : (
                      <div className="space-y-3">
                        {(overview?.tierBreakdown||[]).map((t:any) => {
                          const pct = s.grossRevenue>0 ? Math.round((t.total/s.grossRevenue)*100) : 0
                          return (
                            <div key={t._id}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${tierColors[t._id]||'text-gray-400 bg-gray-500/20'}`}>{t._id}</span>
                                <span className="text-white font-semibold">{fmt(t.total)} <span className="text-gray-500 font-normal">({t.count})</span></span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{width:`${pct}%`}}/>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Active Affiliates</span><span className="text-white font-semibold">{s.activeAffiliates||0}</span></div>
                      <div className="flex justify-between text-sm mt-1"><span className="text-gray-400">Net GST Payable</span><span className="text-orange-400 font-semibold">{fmt(s.netGstPayable||0)}</span></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── P&L REPORT TAB ────────────────────────────────────────────────────── */}
        {tab === 'pnl' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select value={pnlYear} onChange={e => setPnlYear(Number(e.target.value))} className="input w-32 text-sm">
                {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-gray-400 text-sm">Profit & Loss Statement</span>
            </div>

            {loadingPnl ? <div className="h-64 bg-white/5 rounded-2xl animate-pulse"/> : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium w-24">Month</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Gross Rev.</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">GST Coll.</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Net Rev.</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Commission</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">TDS (2%)</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Withdrawals</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Expenses</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pnlData?.pnl||[]).map((row:any, i:number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{row.month}</td>
                          <td className="px-3 py-3 text-right text-gray-300">{row.grossRevenue>0?fmt(row.grossRevenue):'-'}</td>
                          <td className="px-3 py-3 text-right text-orange-400">{row.gstCollected>0?fmt(row.gstCollected):'-'}</td>
                          <td className="px-3 py-3 text-right text-blue-400">{row.netRevenue>0?fmt(row.netRevenue):'-'}</td>
                          <td className="px-3 py-3 text-right text-amber-400">{row.commissions>0?fmt(row.commissions):'-'}</td>
                          <td className="px-3 py-3 text-right text-red-400">{row.tds>0?fmt(row.tds):'-'}</td>
                          <td className="px-3 py-3 text-right text-pink-400">{row.withdrawals>0?fmt(row.withdrawals):'-'}</td>
                          <td className="px-3 py-3 text-right text-gray-400">{row.expenses>0?fmt(row.expenses):'-'}</td>
                          <td className={`px-4 py-3 text-right font-bold ${row.netProfit>=0?'text-green-400':'text-red-400'}`}>
                            {row.netProfit!==0?fmt(row.netProfit):'-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {pnlData?.totals && (
                      <tfoot>
                        <tr className="bg-violet-500/10 border-t-2 border-violet-500/30">
                          <td className="px-4 py-3 text-white font-bold">TOTAL</td>
                          <td className="px-3 py-3 text-right text-white font-bold">{fmt(pnlData.totals.grossRevenue)}</td>
                          <td className="px-3 py-3 text-right text-orange-400 font-bold">{fmt(pnlData.totals.gstCollected)}</td>
                          <td className="px-3 py-3 text-right text-blue-400 font-bold">{fmt(pnlData.totals.netRevenue)}</td>
                          <td className="px-3 py-3 text-right text-amber-400 font-bold">{fmt(pnlData.totals.commissions)}</td>
                          <td className="px-3 py-3 text-right text-red-400 font-bold">{fmt(pnlData.totals.tds)}</td>
                          <td className="px-3 py-3 text-right text-pink-400 font-bold">{fmt(pnlData.totals.withdrawals)}</td>
                          <td className="px-3 py-3 text-right text-gray-300 font-bold">{fmt(pnlData.totals.expenses)}</td>
                          <td className={`px-4 py-3 text-right text-lg font-black ${pnlData.totals.netProfit>=0?'text-green-400':'text-red-400'}`}>{fmt(pnlData.totals.netProfit)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GST TAB ──────────────────────────────────────────────────────────── */}
        {tab === 'gst' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select value={gstYear} onChange={e => setGstYear(Number(e.target.value))} className="input w-32 text-sm">
                {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-gray-400 text-sm">GST Summary (18% on package sales)</span>
            </div>

            {loadingGst ? <div className="h-64 bg-white/5 rounded-2xl animate-pulse"/> : (
              <>
                {/* GST summary cards */}
                {gstData?.totals && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label:'GST Collected (Output)', value: gstData.totals.gstCollected, color:'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                      { label:'Input GST Credit', value: gstData.totals.inputCredit, color:'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                      { label:'Net GST Payable', value: gstData.totals.netGstPayable, color:'text-red-400 bg-red-500/10 border-red-500/20' },
                      { label:'Taxable Sales (Net)', value: gstData.totals.netSales, color:'text-green-400 bg-green-500/10 border-green-500/20' },
                    ].map((c,i) => (
                      <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
                        <p className="text-lg font-black">{fmt(c.value)}</p>
                        <p className="text-xs opacity-80 mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-white/5 border-b border-white/10">
                          <th className="text-left px-4 py-3 text-gray-400 font-medium">Month</th>
                          <th className="text-right px-3 py-3 text-gray-400 font-medium">Taxable Sales</th>
                          <th className="text-right px-3 py-3 text-gray-400 font-medium">GST Collected</th>
                          <th className="text-right px-3 py-3 text-gray-400 font-medium">Input Credit</th>
                          <th className="text-right px-4 py-3 text-gray-400 font-medium">Net Payable</th>
                        </tr></thead>
                        <tbody>
                          {(gstData?.gstReport||[]).map((row:any,i:number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                              <td className="px-4 py-3 text-white">{row.month}</td>
                              <td className="px-3 py-3 text-right text-gray-300">{row.netSales>0?fmt(row.netSales):'-'}</td>
                              <td className="px-3 py-3 text-right text-orange-400">{row.gstCollected>0?fmt(row.gstCollected):'-'}</td>
                              <td className="px-3 py-3 text-right text-blue-400">{row.inputCredit>0?fmt(row.inputCredit):'-'}</td>
                              <td className={`px-4 py-3 text-right font-semibold ${row.netGstPayable>0?'text-red-400':'text-green-400'}`}>{row.netGstPayable!==0?fmt(row.netGstPayable):'-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-5">
                    <h3 className="font-bold text-white mb-4 text-sm">GST by Package Tier</h3>
                    <div className="space-y-3">
                      {(gstData?.tierGst||[]).map((t:any,i:number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${tierColors[t._id]||'text-gray-400 bg-gray-500/20'}`}>{t._id}</span>
                          <div className="text-right">
                            <p className="text-white text-sm font-semibold">{fmt(t.gstCollected)}</p>
                            <p className="text-gray-500 text-xs">{t.count} sales</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                      <p>GST Rate: 18% (IGST/CGST+SGST)</p>
                      <p className="mt-1">HSN/SAC: 999293 (Ed-Tech)</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TDS TAB ──────────────────────────────────────────────────────────── */}
        {tab === 'tds' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select value={tdsYear} onChange={e => setTdsYear(Number(e.target.value))} className="input w-32 text-sm">
                {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-gray-400 text-sm">TDS u/s 194H — 2% on affiliate commissions</span>
            </div>

            {loadingTds ? <div className="h-64 bg-white/5 rounded-2xl animate-pulse"/> : (
              <>
                {tdsData?.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label:'Total Commission Paid', value: tdsData.summary.totalCommission, color:'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      { label:'TDS @ 2%', value: tdsData.summary.totalTds, color:'text-red-400 bg-red-500/10 border-red-500/20' },
                      { label:'Net Payable to Affiliates', value: tdsData.summary.netPayable, color:'text-green-400 bg-green-500/10 border-green-500/20' },
                      { label:'Affiliates with TDS', value: tdsData.summary.affiliateCount, format:'count', color:'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                    ].map((c,i) => (
                      <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
                        <p className="text-lg font-black">{c.format==='count' ? c.value : fmt(c.value as number)}</p>
                        <p className="text-xs opacity-80 mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-white/5 border-b border-white/10">
                        <th className="text-left px-4 py-3 text-gray-400 font-medium">Affiliate</th>
                        <th className="text-left px-3 py-3 text-gray-400 font-medium">Email</th>
                        <th className="text-center px-3 py-3 text-gray-400 font-medium">Tier</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">Total Commission</th>
                        <th className="text-right px-3 py-3 text-gray-400 font-medium">TDS 2%</th>
                        <th className="text-right px-4 py-3 text-gray-400 font-medium">Net Payable</th>
                      </tr></thead>
                      <tbody>
                        {(tdsData?.tdsData||[]).map((row:any,i:number) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                            <td className="px-4 py-3 text-white font-medium">{row.user?.name||'—'}</td>
                            <td className="px-3 py-3 text-gray-400 text-xs">{row.user?.email}</td>
                            <td className="px-3 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${tierColors[row.user?.packageTier]||'text-gray-400 bg-gray-500/20'}`}>{row.user?.packageTier}</span></td>
                            <td className="px-3 py-3 text-right text-amber-400 font-semibold">{fmt(row.totalCommission)}</td>
                            <td className="px-3 py-3 text-right text-red-400 font-semibold">{fmt(row.tdsAmount)}</td>
                            <td className="px-4 py-3 text-right text-green-400 font-semibold">{fmt(row.netPayable)}</td>
                          </tr>
                        ))}
                        {(tdsData?.tdsData||[]).length===0 && (
                          <tr><td colSpan={6} className="text-center py-12 text-gray-400">No TDS data for {tdsYear}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EXPENSES TAB ─────────────────────────────────────────────────────── */}
        {tab === 'expenses' && (
          <div className="space-y-4">
            {/* Category breakdown */}
            {(expData?.byCategory||[]).length>0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(expData.byCategory||[]).map((c:any,i:number) => (
                  <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${catColors[c._id]||catColors.other}`}>{c._id}</span>
                    </div>
                    <p className="text-white font-bold">{fmt(c.total)}</p>
                    <p className="text-gray-500 text-xs">{c.count} entries</p>
                  </div>
                ))}
              </div>
            )}

            {loadingExp ? <div className="h-64 bg-white/5 rounded-2xl animate-pulse"/> : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-4 py-3 text-gray-400">Title</th>
                      <th className="text-left px-3 py-3 text-gray-400">Category</th>
                      <th className="text-left px-3 py-3 text-gray-400">Vendor</th>
                      <th className="text-right px-3 py-3 text-gray-400">Amount</th>
                      <th className="text-right px-3 py-3 text-gray-400">GST Paid</th>
                      <th className="text-left px-3 py-3 text-gray-400">Date</th>
                      <th className="px-4 py-3"></th>
                    </tr></thead>
                    <tbody>
                      {(expData?.expenses||[]).map((e:any,i:number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                          <td className="px-4 py-3">
                            <p className="text-white font-medium">{e.title}</p>
                            {e.notes && <p className="text-gray-500 text-xs">{e.notes}</p>}
                          </td>
                          <td className="px-3 py-3"><span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${catColors[e.category]||catColors.other}`}>{e.category}</span></td>
                          <td className="px-3 py-3 text-gray-400 text-xs">{e.vendor||'—'}</td>
                          <td className="px-3 py-3 text-right text-white font-semibold">{fmt(e.amount)}</td>
                          <td className="px-3 py-3 text-right text-blue-400">{e.gstPaid>0?fmt(e.gstPaid):'-'}</td>
                          <td className="px-3 py-3 text-gray-400 text-xs">{format(new Date(e.date),'dd MMM yyyy')}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteExpense(e._id)} disabled={deletingId===e._id}
                              className="text-red-400 hover:bg-red-500/10 rounded-lg p-1.5 transition-all">
                              {deletingId===e._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(expData?.expenses||[]).length===0 && (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">No expenses recorded. Add your first expense.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowExpenseModal(false)}/>
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Add Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input value={expForm.title} onChange={e => setExpForm(p=>({...p,title:e.target.value}))} placeholder="e.g. AWS Server Cost" className="input w-full"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Category *</label>
                  <select value={expForm.category} onChange={e => setExpForm(p=>({...p,category:e.target.value}))} className="input w-full">
                    {EXPENSE_CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date *</label>
                  <input type="date" value={expForm.date} onChange={e => setExpForm(p=>({...p,date:e.target.value}))} className="input w-full"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
                  <input type="number" value={expForm.amount} onChange={e => setExpForm(p=>({...p,amount:e.target.value}))} placeholder="0" className="input w-full"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">GST Paid (₹)</label>
                  <input type="number" value={expForm.gstPaid} onChange={e => setExpForm(p=>({...p,gstPaid:e.target.value}))} placeholder="0" className="input w-full"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendor</label>
                  <input value={expForm.vendor} onChange={e => setExpForm(p=>({...p,vendor:e.target.value}))} placeholder="Vendor name" className="input w-full"/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Invoice #</label>
                  <input value={expForm.invoiceNumber} onChange={e => setExpForm(p=>({...p,invoiceNumber:e.target.value}))} placeholder="INV-001" className="input w-full"/>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                  <textarea value={expForm.notes} onChange={e => setExpForm(p=>({...p,notes:e.target.value}))} rows={2} className="input w-full resize-none" placeholder="Optional notes..."/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowExpenseModal(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={saveExpense} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving...</> : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
