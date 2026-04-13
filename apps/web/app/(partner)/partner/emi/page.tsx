'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnerAPI, phonepeAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Coins, Users, TrendingUp, Lock, Wallet, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS: Record<string, { cls: string; label: string; icon: any }> = {
  paid:    { cls: 'bg-green-500/15 text-green-400 border-green-500/25',  label: 'Paid',    icon: CheckCircle2 },
  pending: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', label: 'Pending', icon: Clock },
  overdue: { cls: 'bg-red-500/15 text-red-400 border-red-500/25',        label: 'Overdue', icon: AlertTriangle },
  failed:  { cls: 'bg-gray-500/15 text-gray-400 border-gray-500/25',     label: 'Failed',  icon: Clock },
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PartnerEmiPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [walletPaying, setWalletPaying] = useState<string | null>(null)
  const walletBalance = (user as any)?.wallet || 0

  const walletPayMut = useMutation({
    mutationFn: (installmentId: string) => phonepeAPI.payEmiFromWallet({ installmentId }),
    onMutate: (id) => setWalletPaying(id),
    onSuccess: (res) => {
      const d = res.data
      if (d.fullyPaid) {
        toast.success(d.message || 'Installment paid from wallet!')
        qc.invalidateQueries({ queryKey: ['partner-my-emi'] })
      } else {
        toast.success(`₹${d.walletUsed} deducted. Redirecting for remaining ₹${d.remaining}...`)
        setTimeout(() => { window.location.href = d.redirectUrl }, 1000)
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
    onSettled: () => setWalletPaying(null),
  })

  // Partner's OWN EMI plan
  const { data: myEmiData } = useQuery({
    queryKey: ['partner-my-emi'],
    queryFn: () => phonepeAPI.getEmiStatus().then(r => r.data),
    staleTime: 30000,
  })

  // EMI commissions from referred users
  const { data: commData, isLoading: commLoading } = useQuery({
    queryKey: ['partner-emi-commissions'],
    queryFn: () => partnerAPI.emiCommissions().then(r => r.data),
    staleTime: 60000,
  })

  const myInstallments: any[] = myEmiData?.installments || []
  const isSuspended = myEmiData?.isSuspended

  // Group my installments by package
  const myGroups: Record<string, any[]> = {}
  for (const inst of myInstallments) {
    const key = inst.packagePurchase?._id || inst.packagePurchase || 'unknown'
    if (!myGroups[key]) myGroups[key] = []
    myGroups[key].push(inst)
  }

  const commInstallments: any[] = commData?.installments || []
  const stats = commData?.stats || {}

  // Group commissions by referred user
  const byUser: Record<string, any[]> = {}
  for (const inst of commInstallments) {
    const uid = inst.user?._id || 'unknown'
    if (!byUser[uid]) byUser[uid] = []
    byUser[uid].push(inst)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">EMI</h1>
        <p className="text-dark-400 text-sm mt-1">Your EMI plan and commissions from referred members</p>
      </div>

      {/* ── My EMI Plan ── */}
      {myInstallments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-400" />
            <h2 className="text-white font-semibold">My EMI Plan</h2>
            {isSuspended && (
              <span className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Access Suspended
              </span>
            )}
          </div>

          {isSuspended && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">Your dashboard access is suspended due to an overdue installment. Pay it to restore access.</p>
            </div>
          )}

          {Object.entries(myGroups).map(([ppId, insts]) => {
            const sorted = [...insts].sort((a, b) => a.installmentNumber - b.installmentNumber)
            const pkg = sorted[0]?.packagePurchase
            const pkgName = pkg?.packageTier
              ? `${pkg.packageTier.charAt(0).toUpperCase() + pkg.packageTier.slice(1)} Package`
              : 'Package'
            const paidCount = sorted.filter(i => i.status === 'paid').length
            const paidAmt = sorted.filter(i => i.status === 'paid').reduce((s: number, i: any) => s + i.amount, 0)
            const remaining = sorted.reduce((s: number, i: any) => s + i.amount, 0) - paidAmt

            return (
              <div key={ppId} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-dark-700 flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">{pkgName} — 4 Installments</p>
                  <div className="flex items-center gap-3 text-xs text-dark-400">
                    <span>{paidCount}/4 paid</span>
                    {remaining > 0 && <span className="text-amber-400">{fmt(remaining)} remaining</span>}
                  </div>
                </div>
                {walletBalance > 0 && sorted.some((i: any) => i.status !== 'paid') && (
                  <div className="px-5 py-2 bg-amber-500/5 border-b border-amber-500/15 flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-amber-300 text-xs">Wallet {fmt(walletBalance)} available — use to pay EMI</p>
                  </div>
                )}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sorted.map((inst: any) => {
                    const s = STATUS[inst.status] || STATUS.pending
                    const Icon = s.icon
                    const payLink = inst.paymentLink || `/pay/emi/${inst._id}`
                    const canPay = inst.status !== 'paid'
                    const walletCovers = Math.min(walletBalance, inst.amount)
                    const remainingAfterWallet = inst.amount - walletCovers

                    return (
                      <div key={inst._id} className={`rounded-xl border p-3 ${s.cls}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs opacity-75">Inst {inst.installmentNumber}/4</p>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-bold text-sm">{fmt(inst.amount)}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {inst.status === 'paid' && inst.paidAt
                            ? `Paid ${fmtDate(inst.paidAt)}`
                            : `Due ${fmtDate(inst.dueDate)}`}
                        </p>
                        {inst.walletAmountUsed > 0 && inst.status === 'paid' && (
                          <p className="text-xs opacity-50 mt-0.5">₹{inst.walletAmountUsed} from wallet</p>
                        )}
                        {canPay && (
                          <div className="mt-2.5 space-y-1.5">
                            {walletBalance > 0 && (
                              <button
                                onClick={() => walletPayMut.mutate(inst._id)}
                                disabled={walletPaying === inst._id}
                                className="w-full flex flex-col items-center py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors disabled:opacity-60"
                              >
                                {walletPaying === inst._id
                                  ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing...</span>
                                  : <><span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Wallet Pay</span>
                                    <span className="opacity-60 font-normal text-[10px]">
                                      {walletCovers >= inst.amount ? fmt(walletCovers) : `${fmt(walletCovers)} + ${fmt(remainingAfterWallet)} UPI`}
                                    </span></>
                                }
                              </button>
                            )}
                            <Link href={payLink}
                              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
                              <CreditCard className="w-3 h-3" /> {walletBalance > 0 ? 'Pay UPI' : 'Pay Now'}
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Commissions from referred users ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <h2 className="text-white font-semibold">EMI Commissions from Referrals</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <Users className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-lg">{stats.totalInstallments || 0}</p>
            <p className="text-dark-400 text-xs">Installments</p>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <p className="text-amber-400 font-bold text-lg">{fmt(stats.totalEarnedCommission || 0)}</p>
            <p className="text-dark-400 text-xs">Earned</p>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <p className="text-blue-400 font-bold text-lg">{fmt(stats.totalPendingCommission || 0)}</p>
            <p className="text-dark-400 text-xs">Upcoming</p>
          </div>
        </div>

        {commLoading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
        ) : commInstallments.length === 0 ? (
          <div className="bg-dark-800 rounded-2xl border border-dark-700 py-12 text-center">
            <Coins className="w-10 h-10 text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400 text-sm font-medium">No EMI commissions yet</p>
            <p className="text-dark-500 text-xs mt-1">When your referred members pay EMI installments, commissions appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(byUser).map(([uid, userInsts]) => {
              const user = userInsts[0]?.user
              const sorted = [...userInsts].sort((a, b) => a.installmentNumber - b.installmentNumber)
              const earned = sorted.filter((i: any) => i.partnerCommissionPaid).reduce((s: number, i: any) => s + (i.partnerCommissionAmount || 0), 0)
              const pending = sorted.filter((i: any) => !i.partnerCommissionPaid && i.partnerCommissionAmount > 0).reduce((s: number, i: any) => s + (i.partnerCommissionAmount || 0), 0)

              return (
                <div key={uid} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                  <div className="px-5 py-3 border-b border-dark-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{user?.name || 'Unknown'}</p>
                        <p className="text-dark-400 text-xs">{user?.phone || user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {earned > 0 && <span className="text-green-400 font-semibold">+{fmt(earned)} earned</span>}
                      {pending > 0 && <span className="text-blue-400 font-semibold">{fmt(pending)} upcoming</span>}
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sorted.map((inst: any) => {
                      const s = STATUS[inst.status] || STATUS.pending
                      return (
                        <div key={inst._id} className={`rounded-xl border p-3 ${s.cls}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs opacity-75">Inst {inst.installmentNumber}/{inst.totalInstallments}</p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="font-bold text-sm">{fmt(inst.amount)}</p>
                          <p className="text-xs opacity-60 mt-0.5">
                            {inst.status === 'paid' && inst.paidAt ? fmtDate(inst.paidAt) : `Due ${fmtDate(inst.dueDate)}`}
                          </p>
                          {inst.partnerCommissionAmount > 0 && (
                            <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${inst.partnerCommissionPaid ? 'text-green-400' : 'opacity-50'}`}>
                              <Coins className="w-3 h-3" />
                              {fmt(inst.partnerCommissionAmount)}
                              {inst.partnerCommissionPaid ? ' ✓' : ' (due)'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
