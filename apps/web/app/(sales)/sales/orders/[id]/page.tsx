'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, CheckCircle, Link2, Copy, Check,
  Printer, User, Package, IndianRupee, Calendar
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-gray-500/20 text-gray-400',
  token_paid: 'bg-blue-500/20 text-blue-400',
  partial:    'bg-yellow-500/20 text-yellow-400',
  paid:       'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function PrintSlip({ order }: { order: any }) {
  const handlePrint = () => {
    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Slip - ${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .title { font-size: 18px; margin-top: 8px; }
          .section { margin-bottom: 16px; }
          .label { font-size: 12px; color: #666; text-transform: uppercase; }
          .value { font-size: 15px; font-weight: 600; margin-top: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .total { background: #f0f0ff; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; }
          .total .amount { font-size: 28px; font-weight: bold; color: #4f46e5; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #d1fae5; color: #065f46; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">TruLearnix</div>
          <div class="title">Payment Receipt / Order Slip</div>
          <div style="margin-top:8px;font-size:12px;color:#666;">Order ID: ${order._id}</div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="label">Customer Name</div>
            <div class="value">${order.customer?.name || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Phone</div>
            <div class="value">${order.customer?.phone || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Email</div>
            <div class="value">${order.customer?.email || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Location</div>
            <div class="value">${[order.customer?.city, order.customer?.state].filter(Boolean).join(', ') || 'N/A'}</div>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="label">Package</div>
            <div class="value">${order.package?.name || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Tier</div>
            <div class="value" style="text-transform:capitalize;">${order.packageTier || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Payment Type</div>
            <div class="value" style="text-transform:capitalize;">${order.paymentType || 'full'}</div>
          </div>
          <div class="section">
            <div class="label">Status</div>
            <div class="value"><span class="status">${(order.status || 'pending').replace('_', ' ')}</span></div>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="label">Sales Executive</div>
            <div class="value">${order.salesperson?.name || 'N/A'}</div>
          </div>
          <div class="section">
            <div class="label">Date</div>
            <div class="value">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="total">
          <div style="font-size:13px;color:#666;margin-bottom:4px;">Total Amount</div>
          <div class="amount">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</div>
          <div style="font-size:13px;color:#666;margin-top:4px;">Paid: ₹${(order.paidAmount || 0).toLocaleString('en-IN')}</div>
        </div>

        <div class="footer">
          This is a computer-generated receipt. For support, contact us at support@peptly.in<br/>
          TruLearnix — Skill Up. Earn Up.
        </div>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(slipContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-all border border-white/10"
    >
      <Printer className="w-4 h-4" /> Print Slip
    </button>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const router = useRouter()
  const [paidAmount, setPaidAmount] = useState('')

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['sales-order', id],
    queryFn: () => salesAPI.getOrder(id).then(r => r.data),
    enabled: !!id,
  })

  const verifyMutation = useMutation({
    mutationFn: (data: any) => salesAPI.verifyPayment(id, data),
    onSuccess: () => {
      toast.success('Payment verified successfully')
      qc.invalidateQueries({ queryKey: ['sales-order', id] })
      qc.invalidateQueries({ queryKey: ['sales-orders'] })
      qc.invalidateQueries({ queryKey: ['sales-stats'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to verify payment'),
  })

  const linkMutation = useMutation({
    mutationFn: () => salesAPI.generatePaymentLink(id),
    onSuccess: (res) => {
      toast.success('Payment link generated')
      navigator.clipboard.writeText(res.data.paymentLink)
      qc.invalidateQueries({ queryKey: ['sales-order', id] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to generate link'),
  })

  const order = orderData?.order
  const installments: any[] = orderData?.installments || []

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Order not found</p>
      <Link href="/sales/orders" className="text-blue-400 text-sm mt-2 block">Back to orders</Link>
    </div>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/sales/orders" className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Order Details</h1>
          <p className="text-xs text-gray-500 font-mono">{order._id}</p>
        </div>
      </div>

      {/* Status + Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
          {order.status?.replace('_', ' ')}
        </span>
        <PrintSlip order={order} />
        <button
          onClick={() => linkMutation.mutate()}
          disabled={linkMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-sm font-semibold transition-all border border-indigo-500/20"
        >
          {linkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Generate Link
        </button>
      </div>

      {/* Payment Link */}
      {order.paymentLink && (
        <div className="bg-dark-800 rounded-2xl border border-blue-500/15 p-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">Payment Link</p>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-mono text-gray-300 bg-dark-900/50 px-3 py-2 rounded-xl border border-white/5 truncate">{order.paymentLink}</span>
            <CopyBtn text={order.paymentLink} />
          </div>
          {order.paymentLinkExpiry && (
            <p className="text-xs text-gray-600 mt-1.5">Expires: {new Date(order.paymentLinkExpiry).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Customer */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Name</p><p className="text-white text-sm font-medium mt-0.5">{order.customer?.name}</p></div>
          <div><p className="text-xs text-gray-500">Phone</p><p className="text-white text-sm font-medium mt-0.5">{order.customer?.phone}</p></div>
          <div><p className="text-xs text-gray-500">Email</p><p className="text-white text-sm font-medium mt-0.5">{order.customer?.email || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Location</p><p className="text-white text-sm font-medium mt-0.5">{[order.customer?.city, order.customer?.state].filter(Boolean).join(', ') || 'N/A'}</p></div>
        </div>
      </div>

      {/* Package */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-400" /> Package Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Package</p><p className="text-white text-sm font-medium mt-0.5">{order.package?.name || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Tier</p><p className="text-white text-sm font-medium mt-0.5 capitalize">{order.packageTier || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Payment Type</p><p className="text-white text-sm font-medium mt-0.5 capitalize">{order.paymentType}</p></div>
          <div><p className="text-xs text-gray-500">Promo Code</p><p className="text-white text-sm font-medium mt-0.5 font-mono">{order.promoCode || 'None'}</p></div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-green-400" /> Payment Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Total Amount</p><p className="text-white text-lg font-bold mt-0.5">₹{(order.totalAmount || 0).toLocaleString()}</p></div>
          <div>
            <p className="text-xs text-gray-500">{order.paymentType === 'emi' ? 'Collected So Far' : 'Paid Amount'}</p>
            <p className="text-white text-lg font-bold mt-0.5">₹{(order.paidAmount || 0).toLocaleString()}</p>
            {order.paymentType === 'emi' && <p className="text-xs text-gray-600 mt-0.5">₹{((order.totalAmount || 0) - (order.paidAmount || 0)).toLocaleString()} pending</p>}
          </div>
          <div><p className="text-xs text-gray-500">Commission</p><p className={`text-sm font-semibold mt-0.5 ${order.commissionPaid ? 'text-green-400' : 'text-gray-300'}`}>₹{(order.commissionAmount || 0).toLocaleString()} {order.commissionPaid ? '(credited)' : order.paymentType === 'emi' ? '(per installment)' : '(pending)'}</p></div>
          <div><p className="text-xs text-gray-500">Date</p><p className="text-white text-sm font-medium mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p></div>
        </div>
      </div>

      {/* EMI Installments */}
      {order.paymentType === 'emi' && installments.length > 0 && (
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> EMI Installments</h2>
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(installments.length, 4)}, 1fr)` }}>
            {installments.map((inst: any) => (
              <div key={inst._id} className={`rounded-xl p-3 border text-center ${
                inst.status === 'paid' ? 'bg-green-500/10 border-green-500/20' :
                inst.status === 'overdue' ? 'bg-red-500/10 border-red-500/20' :
                'bg-white/3 border-white/8'
              }`}>
                <p className="text-xs text-gray-500">#{inst.installmentNumber}</p>
                <p className={`text-sm font-bold mt-0.5 ${inst.status === 'paid' ? 'text-green-300' : 'text-white'}`}>₹{(inst.amount || 0).toLocaleString()}</p>
                <span className={`text-xs font-semibold mt-1 block ${inst.status === 'paid' ? 'text-green-400' : inst.status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                  {inst.status === 'paid' ? 'Paid' : inst.status === 'overdue' ? 'Overdue' : 'Pending'}
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  {inst.status === 'paid' && inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : `Due ${new Date(inst.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                </p>
                {inst.partnerCommissionAmount > 0 && (
                  <p className={`text-xs mt-1 ${inst.partnerCommissionPaid ? 'text-green-500' : 'text-gray-600'}`}>
                    Comm: ₹{inst.partnerCommissionAmount} {inst.partnerCommissionPaid ? '✓' : '–'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark as Paid */}
      {order.status !== 'paid' && order.status !== 'cancelled' && (
        <div className="bg-dark-800 rounded-2xl border border-green-500/15 p-5">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Verify Payment</h2>
          <div className="flex gap-3">
            <input
              type="number"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              placeholder={`Amount paid (default: ₹${order.totalAmount?.toLocaleString()})`}
              className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => verifyMutation.mutate({ paidAmount: paidAmount ? Number(paidAmount) : order.totalAmount, paymentMethod: 'manual' })}
              disabled={verifyMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirm
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">This will activate the customer's package and credit your commission.</p>
        </div>
      )}

      {order.notes && (
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
          <h2 className="text-white font-bold mb-2">Notes</h2>
          <p className="text-gray-400 text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
