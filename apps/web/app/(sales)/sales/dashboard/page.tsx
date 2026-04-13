'use client'
import { useQuery } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  IndianRupee, TrendingUp, Flame, Users, CheckCircle,
  ShoppingBag, Loader2, ArrowRight, Clock, BadgeCheck
} from 'lucide-react'
import Link from 'next/link'

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-gray-500/20 text-gray-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  interested: 'bg-yellow-500/20 text-yellow-400',
  demo_done: 'bg-purple-500/20 text-purple-400',
  negotiating: 'bg-orange-500/20 text-orange-400',
  paid: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-400',
  token_paid: 'bg-blue-500/20 text-blue-400',
  partial: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function SalesDashboard() {
  const { user } = useAuthStore()

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: () => salesAPI.stats().then(r => r.data.stats),
  })

  const { data: leadsData } = useQuery({
    queryKey: ['sales-leads-recent'],
    queryFn: () => salesAPI.leads({ limit: 5 }).then(r => r.data.leads),
  })

  const { data: ordersData } = useQuery({
    queryKey: ['sales-orders-recent'],
    queryFn: () => salesAPI.orders({ limit: 5 }).then(r => r.data.orders),
  })

  const s = statsData

  const statCards = [
    { label: 'My Earnings',      value: `₹${(s?.myEarnings || 0).toLocaleString()}`,      icon: IndianRupee,  color: 'from-blue-500/20 to-blue-600/10',    border: 'border-blue-500/15',    icon_c: 'text-blue-400',    bg: 'bg-blue-500/15' },
    { label: 'My Wallet',        value: `₹${(s?.myWallet || 0).toLocaleString()}`,         icon: Flame,        color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/15', icon_c: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
    { label: 'This Month',       value: `₹${(s?.thisMonthEarnings || 0).toLocaleString()}`, icon: TrendingUp,  color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/15', icon_c: 'text-violet-400',  bg: 'bg-violet-500/15' },
    { label: 'Total Leads',      value: s?.totalLeads || 0,                                 icon: Users,       color: 'from-sky-500/20 to-sky-600/10',      border: 'border-sky-500/15',    icon_c: 'text-sky-400',     bg: 'bg-sky-500/15' },
    { label: 'Converted',        value: s?.convertedLeads || 0,                             icon: BadgeCheck,  color: 'from-green-500/20 to-green-600/10',  border: 'border-green-500/15',  icon_c: 'text-green-400',   bg: 'bg-green-500/15' },
    { label: 'Pending Orders',   value: s?.pendingOrders || 0,                              icon: ShoppingBag, color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/15', icon_c: 'text-orange-400',  bg: 'bg-orange-500/15' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is your sales performance today</p>
        </div>
        <Link href="/sales/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-300 text-sm font-semibold hover:bg-blue-500/25 transition-all border border-blue-500/20">
          <ShoppingBag className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {statCards.map(card => (
            <div key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 sm:p-5 border ${card.border} flex flex-col gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.icon_c}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Leads */}
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Recent Leads
            </h2>
            <Link href="/sales/leads" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!leadsData?.length ? (
            <div className="text-center py-8 text-gray-500 text-sm">No leads assigned yet</div>
          ) : (
            <div className="space-y-2">
              {leadsData.map((lead: any) => (
                <div key={lead._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                    {lead.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-lg capitalize font-medium ${STAGE_COLORS[lead.stage] || STAGE_COLORS.new}`}>
                    {lead.stage?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" /> Recent Orders
            </h2>
            <Link href="/sales/orders" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!ordersData?.length ? (
            <div className="text-center py-8 text-gray-500 text-sm">No orders yet</div>
          ) : (
            <div className="space-y-2">
              {ordersData.map((order: any) => (
                <Link key={order._id} href={`/sales/orders`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
                    {order.customer?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.package?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">₹{(order.totalAmount || 0).toLocaleString()}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
