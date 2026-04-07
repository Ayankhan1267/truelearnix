'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { walletAPI } from '@/lib/api'
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'

const catColor: Record<string, string> = {
  affiliate_commission: 'text-green-400',
  course_sale: 'text-blue-400',
  withdrawal: 'text-red-400',
  refund: 'text-yellow-400',
  bonus: 'text-purple-400',
}

export default function WalletPage() {
  const [page, setPage] = useState(1)
  const { data: walletData } = useQuery({ queryKey: ['wallet'], queryFn: () => walletAPI.get().then(r => r.data) })
  const { data: txData } = useQuery({ queryKey: ['transactions', page], queryFn: () => walletAPI.transactions({ page, limit: 15 }).then(r => r.data) })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1">Your earnings and transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-500/30 col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary-400" />
            <span className="text-sm text-gray-400">Available Balance</span>
          </div>
          <p className="text-4xl font-black text-white">₹{(walletData?.wallet || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Min withdrawal: ₹500</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-green-400" /><span className="text-xs text-gray-400">Total Earned</span></div>
          <p className="text-2xl font-bold text-green-400">₹{(walletData?.totalEarnings || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><ArrowUpRight className="w-5 h-5 text-red-400" /><span className="text-xs text-gray-400">Total Withdrawn</span></div>
          <p className="text-2xl font-bold text-red-400">₹{(walletData?.totalWithdrawn || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Transaction History</h2>
          <span className="text-xs text-gray-400">{txData?.total || 0} transactions</span>
        </div>
        <div className="space-y-2">
          {(txData?.transactions || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions yet.</p>
          ) : (
            (txData?.transactions || []).map((tx: any) => (
              <div key={tx._id} className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className={`w-4 h-4 text-green-400`} /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{tx.description}</p>
                  <p className={`text-xs capitalize ${catColor[tx.category] || 'text-gray-400'}`}>{tx.category?.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />{format(new Date(tx.createdAt), 'dd MMM')}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.status === 'completed' ? 'bg-green-400' : tx.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              </div>
            ))
          )}
        </div>
        {txData?.pages > 1 && (
          <div className="flex gap-2 mt-4 justify-center">
            {Array.from({ length: txData.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
