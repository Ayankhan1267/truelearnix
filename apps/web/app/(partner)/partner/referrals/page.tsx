'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { UserCheck, Search, ChevronLeft, ChevronRight, Package, Calendar, Coins, Users, CreditCard, BookOpen } from 'lucide-react'

const tierColors: Record<string, string> = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  elite: 'from-amber-500 to-orange-500',
  supreme: 'from-rose-500 to-pink-600',
}

export default function ReferralsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['partner-referrals', page],
    queryFn: () => partnerAPI.referrals({ page, limit: 20 }).then(r => r.data),
    placeholderData: (prev) => prev,
  })

  const referrals = data?.referrals || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1
  const stats = data?.stats || {}

  const filtered = referrals.filter((r: any) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Referrals</h1>
        <p className="text-dark-400 text-sm mt-1">Track all your referred members and their activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Referred', value: stats.total || 0, icon: Users, color: 'text-violet-400' },
          { label: 'Paid Members', value: stats.paid || 0, icon: Package, color: 'text-green-400' },
          { label: 'Free Members', value: stats.free || 0, icon: UserCheck, color: 'text-blue-400' },
          { label: 'Earnings from L1', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, icon: Coins, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="text-white font-bold text-lg">{value}</p>
            <p className="text-dark-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-2xl border border-dark-700">
          <UserCheck className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400 font-medium">No referrals yet</p>
          <p className="text-dark-500 text-sm mt-1">Share your affiliate link to grow your team</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <div key={r._id} className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-500 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${tierColors[r.packageTier || 'free']} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${tierColors[r.packageTier || 'free']} text-white font-medium capitalize`}>{r.packageTier || 'free'}</span>
                    {r.isAffiliate && <span className="text-[10px] bg-violet-900/30 text-violet-400 border border-violet-700/30 px-2 py-0.5 rounded-full">Partner</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-dark-400 flex-wrap">
                    {r.phone && <span>{r.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {(r.packagePurchasedAt || r.coursePurchasedAt) ? (
                    r.contribution > 0 ? (
                      <>
                        <p className="text-green-400 text-sm font-bold">+₹{r.contribution.toLocaleString()}</p>
                        <p className="text-dark-500 text-xs">{r.isEmi ? `${r.emiPaid}/${r.emiTotal} installments` : 'earned'}</p>
                      </>
                    ) : (
                      <span className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                        {r.coursePurchasedAt && !r.packagePurchasedAt ? 'Course Purchased' : 'Purchased'}
                      </span>
                    )
                  ) : (
                    <span className="text-dark-500 text-xs bg-dark-700 px-2 py-1 rounded-lg">No purchase</span>
                  )}
                </div>
              </div>
              {(r.packagePurchasedAt || r.coursePurchasedAt) && (
                <div className="mt-3 pl-14 flex items-center gap-3 text-xs text-dark-400 flex-wrap">
                  {r.packagePurchasedAt && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-amber-400" />
                      Purchased <span className="text-amber-400 capitalize ml-1">{r.packageTier}</span>
                      <span className="ml-1">on {new Date(r.packagePurchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                  )}
                  {r.coursePurchasedAt && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400">{r.coursePurchaseCount} course{r.coursePurchaseCount > 1 ? 's' : ''}</span>
                      <span>· ₹{(r.coursePurchaseTotal || 0).toLocaleString()} on {new Date(r.coursePurchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                  )}
                  {r.isEmi && (
                    <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      <CreditCard className="w-3 h-3" />
                      EMI {r.emiPaid}/{r.emiTotal} paid · ₹{(r.installmentAmount || 0).toLocaleString()}/installment
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-white hover:border-dark-500 disabled:opacity-40 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-dark-400 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-white hover:border-dark-500 disabled:opacity-40 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
