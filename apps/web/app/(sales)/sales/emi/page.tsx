'use client'
import { useQuery } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { Loader2, CheckCircle, Clock, AlertCircle, IndianRupee, Calendar, TrendingUp } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0)

function StatusBadge({ status }: { status: string }) {
  if (status === 'paid') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">Paid</span>
  if (status === 'overdue') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">Overdue</span>
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">Pending</span>
}

function CommBadge({ paid }: { paid: boolean }) {
  if (paid) return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3 h-3" />Credited</span>
  return <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />Pending</span>
}

export default function SalesEmiPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['sales-emi-commissions'],
    queryFn: () => salesAPI.emiCommissions().then(r => r.data),
  })

  const installments: any[] = data?.installments || []

  // Group by customer
  const grouped: Record<string, any[]> = {}
  installments.forEach(inst => {
    const key = inst.customerName || inst.packageName || 'Unknown'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(inst)
  })

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">EMI Commissions</h1>
        <p className="text-gray-400 text-sm mt-1">Track installment-wise earnings from your EMI orders</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Total Commission</p>
              <p className="text-xl font-bold text-white">₹{fmt(data?.totalCommission)}</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-4 border border-green-500/10">
              <p className="text-xs text-gray-500 mb-1">Earned</p>
              <p className="text-xl font-bold text-green-400">₹{fmt(data?.earnedCommission)}</p>
            </div>
            <div className="bg-dark-800 rounded-2xl p-4 border border-amber-500/10">
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-xl font-bold text-amber-400">₹{fmt(data?.pendingCommission)}</p>
            </div>
          </div>

          {installments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No EMI commissions yet</p>
              <p className="text-xs mt-1">Create EMI orders to start earning per-installment commissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([customer, insts]) => {
                const total = insts[0]?.totalInstallments || insts.length
                const paid = insts.filter(i => i.status === 'paid').length
                const totalComm = insts.reduce((s, i) => s + (i.commissionAmount || 0), 0)
                const earnedComm = insts.filter(i => i.commissionPaid).reduce((s, i) => s + (i.commissionAmount || 0), 0)

                return (
                  <div key={customer} className="bg-dark-800 rounded-2xl border border-white/5 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{customer}</p>
                        <p className="text-xs text-gray-500">{insts[0]?.packageName} · {paid}/{total} installments paid</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Commission</p>
                        <p className="text-sm font-bold text-green-400">₹{fmt(earnedComm)} <span className="text-gray-600 font-normal">/ ₹{fmt(totalComm)}</span></p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-4 pt-3">
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(paid / total) * 100}%` }} />
                      </div>
                    </div>

                    {/* Installments grid */}
                    <div className="p-4">
                      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(total, 4)}, 1fr)` }}>
                        {insts.sort((a, b) => a.installmentNumber - b.installmentNumber).map((inst: any) => (
                          <div key={inst._id} className={`rounded-xl p-3 border text-center ${
                            inst.status === 'paid'
                              ? 'bg-green-500/10 border-green-500/20'
                              : inst.status === 'overdue'
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-white/3 border-white/8'
                          }`}>
                            <p className="text-xs text-gray-500 mb-1">#{inst.installmentNumber}</p>
                            <p className={`text-sm font-bold ${inst.status === 'paid' ? 'text-green-300' : 'text-white'}`}>
                              ₹{fmt(inst.amount)}
                            </p>
                            <div className="mt-1.5">
                              <StatusBadge status={inst.status} />
                            </div>
                            {inst.commissionAmount > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <p className="text-xs text-gray-500">Comm. ₹{fmt(inst.commissionAmount)}</p>
                                <div className="mt-0.5 flex justify-center">
                                  <CommBadge paid={inst.commissionPaid} />
                                </div>
                              </div>
                            )}
                            {inst.status !== 'paid' && inst.dueDate && (
                              <p className="text-xs text-gray-600 mt-1">
                                Due {new Date(inst.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
