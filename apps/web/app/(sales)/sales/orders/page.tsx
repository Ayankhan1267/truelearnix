'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { ShoppingBag, Loader2, Search, Plus } from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-gray-500/20 text-gray-400',
  token_paid: 'bg-blue-500/20 text-blue-400',
  partial:    'bg-yellow-500/20 text-yellow-400',
  paid:       'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
}

export default function SalesOrdersPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['sales-orders', status, page],
    queryFn: () => salesAPI.orders({ status, page, limit: 20 }).then(r => r.data),
  })

  const orders: any[] = data?.orders || []
  const totalPages = data?.pages || 1

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">All orders created by you</p>
        </div>
        <Link href="/sales/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'token_paid', 'partial', 'paid', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border ${
              status === s
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-dark-800 text-gray-400 border-white/8 hover:text-white hover:border-white/20'
            }`}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-2xl border border-white/5">
          <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No orders yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first order to get started</p>
          <Link href="/sales/orders/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Create Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-dark-800 rounded-2xl border border-white/5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
                    {order.customer?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                    {order.status?.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 capitalize">
                    {order.paymentType}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Package</p>
                  <p className="text-sm text-white font-medium">{order.package?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm text-white font-medium">₹{(order.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-sm text-white font-medium">₹{(order.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className={`text-sm font-medium ${order.commissionPaid ? 'text-green-400' : 'text-gray-400'}`}>
                    ₹{(order.commissionAmount || 0).toLocaleString()}
                    {order.commissionPaid && <span className="text-xs ml-1">paid</span>}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                <Link href={`/sales/orders/${order._id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-dark-800 border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
