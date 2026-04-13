'use client'
import { useQuery } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { walletAPI } from '@/lib/api'
import { Loader2, IndianRupee, TrendingUp, Flame, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SalesEarningsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: () => salesAPI.stats().then(r => r.data.stats),
  })

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletAPI.get().then(r => r.data),
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletAPI.transactions({ limit: 20 }).then(r => r.data),
  })

  const s = statsData
  const transactions: any[] = txData?.transactions || []

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-gray-400 text-sm mt-1">Your commissions and wallet balance</p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-28">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-blue-500/15">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3">
              <IndianRupee className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">₹{(s?.myEarnings || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Earned</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-2xl p-4 border border-indigo-500/15">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-3">
              <Flame className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">₹{(s?.myWallet || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">Available Wallet</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-2xl p-4 border border-violet-500/15">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xl font-bold text-white">₹{(s?.thisMonthEarnings || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">This Month</p>
          </div>
        </div>
      )}

      {/* Withdraw CTA */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold">Withdraw Earnings</p>
          <p className="text-gray-400 text-sm mt-0.5">Withdraw your wallet balance to your bank account</p>
        </div>
        <Link href="/partner/earnings"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex-shrink-0">
          Withdraw <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Commission History */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-4">Recent Commissions</h2>
        {txLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No commission records yet</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit' ? 'bg-green-500/15' : 'bg-red-500/15'
                  }`}>
                    <IndianRupee className={`w-4 h-4 ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tx.description || (tx.type === 'credit' ? 'Commission Earned' : 'Withdrawal')}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales Orders commission summary */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-1">How Commissions Work</h2>
        <p className="text-gray-500 text-xs mb-4">Commissions are credited when you verify a customer payment as paid.</p>
        <div className="space-y-2">
          {[
            { label: 'Starter Package', value: 'Set by admin per package' },
            { label: 'Pro Package', value: 'Higher commission rate' },
            { label: 'Elite Package', value: 'Premium commission' },
            { label: 'Supreme Package', value: 'Maximum commission' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-dark-700/50 border border-white/5">
              <span className="text-sm text-gray-300">{label}</span>
              <span className="text-xs text-blue-400">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">Exact rates are configured in the package settings by admin.</p>
      </div>
    </div>
  )
}
