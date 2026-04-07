'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletAPI, userAPI } from '@/lib/api'
import { Wallet, TrendingUp, ArrowDownRight, Loader2, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MentorEarnings() {
  const qc = useQueryClient()
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'upi', upiId: '' })

  const { data: walletData } = useQuery({ queryKey: ['wallet'], queryFn: () => walletAPI.get().then(r => r.data) })
  const { data: user } = useQuery({ queryKey: ['user-me'], queryFn: () => userAPI.me().then(r => r.data.user) })
  const { data: txData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletAPI.transactions().then(r => r.data),
  })

  const withdrawMutation = useMutation({
    mutationFn: (data: any) => walletAPI.withdraw(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      setShowWithdraw(false)
      toast.success('Withdrawal requested!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const balance = walletData?.wallet || user?.wallet || 0
  const transactions = txData?.transactions || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Earnings</h1>
        <p className="text-gray-400 mt-1">Track your revenue from courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{balance.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Wallet Balance</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{user?.totalEarnings?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400">Total Earned</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{user?.totalWithdrawn?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400">Total Withdrawn</p>
          </div>
        </div>
      </div>

      {/* Withdraw */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Withdraw Earnings</h2>
          <button onClick={() => setShowWithdraw(!showWithdraw)} className="btn-outline text-sm">
            Request Withdrawal
          </button>
        </div>
        {showWithdraw && (
          <div className="bg-dark-700 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (₹)</label>
                <input value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                  type="number" className="input" placeholder="Min ₹500" min="500" max={balance} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Method</label>
                <select value={withdrawForm.method} onChange={e => setWithdrawForm(f => ({ ...f, method: e.target.value }))} className="input">
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
            {withdrawForm.method === 'upi' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">UPI ID</label>
                <input value={withdrawForm.upiId} onChange={e => setWithdrawForm(f => ({ ...f, upiId: e.target.value }))}
                  className="input" placeholder="yourname@upi" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => withdrawMutation.mutate({ ...withdrawForm, amount: Number(withdrawForm.amount) })}
                disabled={withdrawMutation.isPending || !withdrawForm.amount}
                className="btn-primary flex items-center gap-2 text-sm">
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
                Withdraw
              </button>
              <button onClick={() => setShowWithdraw(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{tx.description}</p>
                  <p className="text-xs text-gray-400">{tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM yyyy') : '—'}</p>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
