'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { DollarSign, ShoppingCart, Coins, Check, X } from 'lucide-react'
import { format } from 'date-fns'

type Tab = 'purchases' | 'commissions' | 'withdrawals'

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    success: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
    approved: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-violet-500/20 text-violet-400',
  }
  return map[status?.toLowerCase()] || 'bg-gray-500/20 text-gray-400'
}

const tierColors: Record<string, string> = {
  starter: 'text-sky-400 bg-sky-500/20',
  pro: 'text-violet-400 bg-violet-500/20',
  elite: 'text-amber-400 bg-amber-500/20',
  supreme: 'text-rose-400 bg-rose-500/20',
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('purchases')
  const qc = useQueryClient()

  const { data: purchases } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: () => adminAPI.purchases({ limit: 50 }).then(r => r.data),
    enabled: tab === 'purchases'
  })
  const { data: commissions } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => adminAPI.commissions({ limit: 50 }).then(r => r.data),
    enabled: tab === 'commissions'
  })
  const { data: withdrawals, refetch: refetchW } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => adminAPI.withdrawals({ limit: 50 }).then(r => r.data),
    enabled: tab === 'withdrawals'
  })

  const handleWithdrawal = async (id: string, action: 'approve' | 'reject') => {
    try {
      await adminAPI.processWithdrawal(id, { status: action === 'approve' ? 'approved' : 'rejected' })
      toast.success(`Withdrawal ${action}d`)
      refetchW()
    } catch { toast.error('Action failed') }
  }

  const purchaseList = purchases?.purchases || purchases?.data || []
  const commissionList = commissions?.commissions || commissions?.data || []
  const withdrawalList = withdrawals?.withdrawals || withdrawals?.data || []

  const totalRev = purchaseList.reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const thisMonth = purchaseList.filter((p: any) => {
    const d = new Date(p.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalComm = commissionList.reduce((s: number, c: any) => s + (c.amount || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
            </div>
            <p className="text-2xl font-black text-white">₹{(totalRev / 1000).toFixed(1)}K</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">This Month</p>
            </div>
            <p className="text-2xl font-black text-white">₹{(thisMonth / 1000).toFixed(1)}K</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-gray-400 text-sm">Commissions Paid</p>
            </div>
            <p className="text-2xl font-black text-white">₹{(totalComm / 1000).toFixed(1)}K</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-white/10 rounded-2xl p-1 w-fit">
          {(['purchases', 'commissions', 'withdrawals'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Purchases */}
        {tab === 'purchases' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-700/30">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">User</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Package Tier</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {purchaseList.map((p: any) => (
                    <tr key={p._id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{p.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{p.user?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge capitalize ${tierColors[(p.packageTier || '').toLowerCase()] || 'bg-gray-500/20 text-gray-400'}`}>
                          {p.packageTier || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-green-400 font-semibold">₹{(p.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${statusBadge(p.status)} capitalize`}>{p.status || 'unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchaseList.length === 0 && <div className="text-center py-12 text-gray-500">No purchases found</div>}
            </div>
          </div>
        )}

        {/* Commissions */}
        {tab === 'commissions' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-700/30">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Level</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Earner</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">From (Buyer)</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {commissionList.map((c: any) => (
                    <tr key={c._id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <span className={`badge ${c.level === 1 ? 'bg-green-500/20 text-green-400' : c.level === 2 ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                          Level {c.level || 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white">{c.earner?.name || c.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{c.earner?.email || c.user?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white">{c.buyer?.name || c.fromUser?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{c.buyer?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-green-400 font-semibold">₹{(c.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${statusBadge(c.status)} capitalize`}>{c.status || 'pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commissionList.length === 0 && <div className="text-center py-12 text-gray-500">No commissions found</div>}
            </div>
          </div>
        )}

        {/* Withdrawals */}
        {tab === 'withdrawals' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-700/30">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">User</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Method</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Details</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawalList.map((w: any) => (
                    <tr key={w._id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="text-white">{w.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{w.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-white font-semibold">₹{(w.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-300 capitalize">{w.method || w.paymentMethod || '—'}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs max-w-[150px] truncate">
                        {w.accountDetails || w.upiId || w.bankAccount || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{w.createdAt ? format(new Date(w.createdAt), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${statusBadge(w.status)} capitalize`}>{w.status || 'pending'}</span>
                      </td>
                      <td className="px-5 py-4">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleWithdrawal(w._id, 'approve')}
                              className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleWithdrawal(w._id, 'reject')}
                              className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawalList.length === 0 && <div className="text-center py-12 text-gray-500">No withdrawals found</div>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
