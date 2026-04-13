'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { phonepeAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Wallet, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS: Record<string, { cls: string; icon: any }> = {
  paid:    { cls: 'bg-green-500/15 text-green-400 border-green-500/25',   icon: CheckCircle2 },
  pending: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: Clock },
  overdue: { cls: 'bg-red-500/15 text-red-400 border-red-500/25',          icon: AlertTriangle },
  failed:  { cls: 'bg-gray-500/15 text-gray-400 border-gray-500/25',       icon: Clock },
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function InstallmentCard({ inst, walletBalance, onWalletPay, walletPaying }: {
  inst: any; walletBalance: number; onWalletPay: (id: string) => void; walletPaying: string | null
}) {
  const s = STATUS[inst.status] || STATUS.pending
  const Icon = s.icon
  const canPay = inst.status !== 'paid'
  const payLink = inst.paymentLink || `/pay/emi/${inst._id}`

  // Wallet breakdown — account for amount already paid from wallet
  const alreadyWalletPaid = inst.walletAmountUsed || 0
  const stillNeeded = inst.amount - alreadyWalletPaid
  const walletCovers = Math.min(walletBalance, stillNeeded)
  const remainingAfterWallet = stillNeeded - walletCovers
  const hasWallet = walletBalance > 0 && canPay && stillNeeded > 0

  return (
    <div className={`rounded-xl border p-3.5 ${s.cls}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs opacity-75">Installment {inst.installmentNumber}/4</p>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="font-bold text-base">{fmt(inst.amount)}</p>
      {alreadyWalletPaid > 0 && inst.status !== 'paid' && (
        <p className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
          <Wallet className="w-3 h-3" /> ₹{alreadyWalletPaid.toLocaleString('en-IN')} wallet paid · <span className="font-semibold">{fmt(stillNeeded)} remaining</span>
        </p>
      )}
      <p className="text-xs opacity-60 mt-0.5">
        {inst.status === 'paid' && inst.paidAt ? `Paid ${fmtDate(inst.paidAt)}` : `Due ${fmtDate(inst.dueDate)}`}
      </p>
      {inst.walletAmountUsed > 0 && inst.status === 'paid' && (
        <p className="text-xs opacity-50 mt-0.5 flex items-center gap-1">
          <Wallet className="w-3 h-3" /> ₹{inst.walletAmountUsed} from wallet
        </p>
      )}

      {canPay && (
        <div className="mt-3 space-y-2">
          {/* Wallet pay option */}
          {hasWallet && (
            <button
              onClick={() => onWalletPay(inst._id)}
              disabled={walletPaying === inst._id}
              className="w-full flex flex-col items-center justify-center py-2 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {walletPaying === inst._id ? (
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing...</span>
              ) : (
                <>
                  <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Pay from Wallet</span>
                  <span className="opacity-60 font-normal mt-0.5">
                    {walletCovers >= stillNeeded
                      ? `${fmt(walletCovers)} from wallet`
                      : `${fmt(walletCovers)} wallet + ${fmt(remainingAfterWallet)} via UPI`}
                  </span>
                </>
              )}
            </button>
          )}
          {/* PhonePe direct pay */}
          <Link href={payLink}
            className="flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
            <CreditCard className="w-3 h-3" />
            {hasWallet ? 'Pay Full via UPI' : 'Pay Now'}
          </Link>
        </div>
      )}
    </div>
  )
}

export default function StudentEmiPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [walletPaying, setWalletPaying] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['student-emi'],
    queryFn: () => phonepeAPI.getEmiStatus().then(r => r.data),
    staleTime: 30000,
  })

  const walletPayMut = useMutation({
    mutationFn: (installmentId: string) => phonepeAPI.payEmiFromWallet({ installmentId }),
    onMutate: (id) => setWalletPaying(id),
    onSuccess: (res) => {
      const d = res.data
      if (d.fullyPaid) {
        toast.success(d.message || 'Installment paid from wallet!')
        qc.invalidateQueries({ queryKey: ['student-emi'] })
      } else {
        // Partial — redirect to PhonePe for remaining
        toast.success(`₹${d.walletUsed} deducted. Redirecting for remaining ₹${d.remaining}...`)
        setTimeout(() => { window.location.href = d.redirectUrl }, 1000)
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
    onSettled: () => setWalletPaying(null),
  })

  const installments: any[] = data?.installments || []
  const isSuspended = data?.isSuspended
  const walletBalance = (user as any)?.wallet || 0

  // Group by packagePurchase
  const groups: Record<string, any[]> = {}
  for (const inst of installments) {
    const key = inst.packagePurchase?._id || inst.packagePurchase || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(inst)
  }

  const paidCount = installments.filter(i => i.status === 'paid').length
  const paidAmt = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalAmt = installments.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My EMI Plan</h1>
        <p className="text-dark-400 text-sm mt-1">Track and pay your installments</p>
      </div>

      {isSuspended && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Access Suspended</p>
            <p className="text-red-400/70 text-xs mt-0.5">Pay your overdue installment to restore full access.</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {installments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <p className="text-white font-bold text-lg">{paidCount}/4</p>
            <p className="text-dark-400 text-xs mt-0.5">Paid</p>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <p className="text-green-400 font-bold text-lg">{fmt(paidAmt)}</p>
            <p className="text-dark-400 text-xs mt-0.5">Amount Paid</p>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <p className="text-amber-400 font-bold text-lg">{fmt(Math.max(0, totalAmt - paidAmt))}</p>
            <p className="text-dark-400 text-xs mt-0.5">Remaining</p>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <p className="text-violet-400 font-bold text-lg">{fmt(walletBalance)}</p>
            <p className="text-dark-400 text-xs mt-0.5">Wallet Balance</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      ) : installments.length === 0 ? (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 py-16 text-center">
          <CreditCard className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400 font-medium">No EMI plan found</p>
          <p className="text-dark-500 text-sm mt-1">You haven't purchased any package with EMI</p>
        </div>
      ) : (
        Object.entries(groups).map(([ppId, groupInsts]) => {
          const sorted = [...groupInsts].sort((a, b) => a.installmentNumber - b.installmentNumber)
          const pkg = sorted[0]?.packagePurchase
          const pkgName = pkg?.packageTier
            ? `${pkg.packageTier.charAt(0).toUpperCase() + pkg.packageTier.slice(1)} Package`
            : 'Package'

          return (
            <div key={ppId} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-400" />
                  <p className="text-white font-semibold text-sm">{pkgName}</p>
                </div>
                <span className="text-dark-400 text-xs">{sorted.filter(i => i.status === 'paid').length}/4 paid</span>
              </div>
              {walletBalance > 0 && sorted.some(i => i.status !== 'paid') && (
                <div className="px-5 py-2 bg-amber-500/5 border-b border-amber-500/15 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-amber-300 text-xs">Wallet balance {fmt(walletBalance)} available — use it to pay installments</p>
                </div>
              )}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sorted.map((inst: any) => (
                  <InstallmentCard
                    key={inst._id}
                    inst={inst}
                    walletBalance={walletBalance}
                    onWalletPay={(id) => walletPayMut.mutate(id)}
                    walletPaying={walletPaying}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
