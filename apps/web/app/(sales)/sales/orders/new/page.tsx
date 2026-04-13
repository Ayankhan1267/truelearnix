'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import {
  User, Package, CreditCard, CheckCircle, ArrowRight, ArrowLeft,
  Loader2, Search, IndianRupee, Printer, Copy, Check, ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const STEPS = [
  { id: 1, label: 'Customer', icon: User },
  { id: 2, label: 'Package', icon: Package },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirm', icon: CheckCircle },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            current === step.id
              ? 'bg-blue-600 text-white'
              : current > step.id
                ? 'bg-green-600/30 text-green-400'
                : 'bg-dark-700 text-gray-500'
          }`}>
            {current > step.id ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${current === step.id ? 'text-blue-300' : current > step.id ? 'text-green-400' : 'text-gray-600'}`}>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${current > step.id ? 'bg-green-500/40' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function NewOrderPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [createdOrder, setCreatedOrder] = useState<any>(null)

  // Form state
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', state: '', city: '' })
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [paymentType, setPaymentType] = useState<'full' | 'emi' | 'token'>('full')
  const [tokenAmount, setTokenAmount] = useState('')
  const [notes, setNotes] = useState('')

  const { data: packagesData } = useQuery({
    queryKey: ['sales-packages'],
    queryFn: () => salesAPI.packages().then(r => r.data.packages),
  })

  const packages: any[] = packagesData || []

  const mutation = useMutation({
    mutationFn: (data: any) => salesAPI.createOrder(data),
    onSuccess: (res) => {
      setCreatedOrder(res.data.order)
      setStep(5)
      toast.success('Order created successfully!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create order'),
  })

  const totalAmount = paymentType === 'token' ? Number(tokenAmount) || 0 : (selectedPackage?.price || 0)

  const handleCreateOrder = () => {
    if (!customer.name || !customer.phone) return toast.error('Customer name and phone are required')
    if (!selectedPackage) return toast.error('Please select a package')
    if (paymentType === 'token' && !tokenAmount) return toast.error('Please enter token amount')

    mutation.mutate({
      customer,
      packageId: selectedPackage._id,
      paymentType,
      tokenAmount: paymentType === 'token' ? Number(tokenAmount) : undefined,
      notes,
    })
  }

  const handlePrintSlip = () => {
    if (!createdOrder) return
    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Slip</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .label { font-size: 12px; color: #666; }
          .value { font-size: 15px; font-weight: 600; margin-top: 2px; }
          .total { background: #f0f0ff; padding: 20px; border-radius: 8px; text-align: center; }
          .amount { font-size: 32px; font-weight: bold; color: #4f46e5; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">TruLearnix</div>
          <div style="margin-top:6px;">Order Slip / Payment Receipt</div>
          <div style="margin-top:4px;font-size:12px;color:#666;">Order ID: ${createdOrder._id}</div>
        </div>
        <div class="grid">
          <div><div class="label">Customer Name</div><div class="value">${createdOrder.customer?.name}</div></div>
          <div><div class="label">Phone</div><div class="value">${createdOrder.customer?.phone}</div></div>
          <div><div class="label">Package</div><div class="value">${selectedPackage?.name}</div></div>
          <div><div class="label">Payment Type</div><div class="value" style="text-transform:capitalize;">${paymentType}</div></div>
          <div><div class="label">Sales Executive</div><div class="value">${user?.name}</div></div>
          <div><div class="label">Date</div><div class="value">${new Date().toLocaleDateString('en-IN')}</div></div>
        </div>
        <div class="total">
          <div style="font-size:13px;color:#666;margin-bottom:4px;">${paymentType === 'token' ? 'Token Amount' : 'Total Amount'}</div>
          <div class="amount">₹${totalAmount.toLocaleString('en-IN')}</div>
          ${paymentType === 'token' ? `<div style="font-size:13px;color:#666;margin-top:4px;">Full Package Price: ₹${selectedPackage?.price?.toLocaleString('en-IN')}</div>` : ''}
        </div>
        <div class="footer">TruLearnix — Skill Up. Earn Up. | support@peptly.in</div>
      </body>
      </html>
    `
    const w = window.open('', '_blank')
    if (w) { w.document.write(slipContent); w.document.close(); w.print() }
  }

  // Success screen
  if (step === 5 && createdOrder) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Order Created!</h2>
          <p className="text-gray-400 text-sm mt-1">Order has been created successfully</p>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5 space-y-3">
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Order ID</span><span className="text-white text-sm font-mono">{createdOrder._id?.slice(-8)}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Customer</span><span className="text-white text-sm">{createdOrder.customer?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Package</span><span className="text-white text-sm">{selectedPackage?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Amount</span><span className="text-white text-sm font-bold">₹{totalAmount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400 text-sm">Status</span><span className="text-yellow-400 text-sm capitalize">{createdOrder.status?.replace('_', ' ')}</span></div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrintSlip}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold transition-all border border-indigo-500/20"
          >
            <Printer className="w-4 h-4" /> Download / Print Slip
          </button>
          <Link href={`/sales/orders/${createdOrder._id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-center">
            <ShoppingBag className="w-4 h-4" /> View Order & Mark Payment
          </Link>
          <Link href="/sales/orders/new"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold transition-all border border-white/10 text-center">
            Create Another Order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales/orders" className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">New Order</h1>
          <p className="text-gray-400 text-sm">Create a sales order for a customer</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Customer Details</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Full Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={customer.name}
              onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
              placeholder="Customer full name"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Phone <span className="text-red-400">*</span></label>
            <input
              type="tel"
              value={customer.phone}
              onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
              placeholder="10-digit phone number"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={customer.email}
              onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
              placeholder="customer@email.com"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">State</label>
              <input
                type="text"
                value={customer.state}
                onChange={e => setCustomer(c => ({ ...c, state: e.target.value }))}
                placeholder="e.g. Maharashtra"
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">City</label>
              <input
                type="text"
                value={customer.city}
                onChange={e => setCustomer(c => ({ ...c, city: e.target.value }))}
                placeholder="e.g. Mumbai"
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!customer.name.trim()) return toast.error('Customer name is required')
              if (!customer.phone.trim()) return toast.error('Phone number is required')
              setStep(2)
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
          >
            Next: Select Package <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Package Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-400" /> Select Package</h2>
            {packages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No active packages found</div>
            ) : (
              <div className="space-y-3">
                {packages.map((pkg: any) => {
                  const commAmt = pkg.salesTeamCommission?.type === 'percentage'
                    ? (pkg.price * (pkg.salesTeamCommission?.value || 0)) / 100
                    : (pkg.salesTeamCommission?.value || 0)
                  return (
                    <button
                      key={pkg._id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedPackage?._id === pkg._id
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-dark-700/50 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">{pkg.name}</p>
                            {pkg.badge && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">{pkg.badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 capitalize mt-0.5">{pkg.tier} tier</p>
                          {pkg.features?.slice(0, 2).map((f: string) => (
                            <p key={f} className="text-xs text-gray-500 mt-0.5">• {f}</p>
                          ))}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-bold text-lg">₹{pkg.price?.toLocaleString()}</p>
                          {commAmt > 0 && (
                            <p className="text-xs text-green-400 mt-0.5">Commission: ₹{commAmt.toFixed(0)}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold transition-all border border-white/10 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (!selectedPackage) return toast.error('Please select a package')
                setStep(3)
              }}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
            >
              Next: Payment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment Type */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-2xl border border-white/5 p-5 space-y-4">
            <h2 className="text-white font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-violet-400" /> Payment Details</h2>

            {/* Payment type */}
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">Payment Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['full', 'emi', 'token'] as const).map(pt => (
                  <button
                    key={pt}
                    onClick={() => setPaymentType(pt)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all capitalize border ${
                      paymentType === pt
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-dark-700 text-gray-400 border-white/8 hover:border-white/20'
                    }`}
                  >
                    {pt === 'full' ? 'Full Payment' : pt === 'emi' ? 'EMI' : 'Token Amount'}
                  </button>
                ))}
              </div>
            </div>

            {paymentType === 'token' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Token Amount (₹) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={e => setTokenAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Remaining: ₹{Math.max(0, (selectedPackage?.price || 0) - Number(tokenAmount)).toLocaleString()} due later</p>
              </div>
            )}

            {paymentType === 'emi' && selectedPackage?.emiAvailable && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Installment Schedule</label>
                {(() => {
                  const days: number[] = selectedPackage?.emiDays?.length ? selectedPackage.emiDays : [0, 15, 30, 45]
                  const instAmt = Math.ceil((selectedPackage?.price || 0) / days.length)
                  return (
                    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 4)}, 1fr)` }}>
                      {days.map((d: number, i: number) => (
                        <div key={i} className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-center">
                          <p className="text-blue-300 text-xs font-bold">₹{instAmt.toLocaleString()}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{d === 0 ? 'Today' : `Day ${d}`}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Promo code info */}
            <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <p className="text-xs text-gray-400">Your affiliate code <span className="text-blue-400 font-mono font-bold">{user?.affiliateCode}</span> will be applied automatically.</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notes about this order..."
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="px-4 py-3 rounded-xl bg-dark-700/60 border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Package Price</span>
                <span className="text-white font-medium">₹{(selectedPackage?.price || 0).toLocaleString()}</span>
              </div>
              {paymentType === 'token' && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Token to Collect</span>
                  <span className="text-blue-300 font-medium">₹{Number(tokenAmount || 0).toLocaleString()}</span>
                </div>
              )}
              {paymentType === 'emi' && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Per Installment</span>
                  <span className="text-blue-300 font-medium">₹{Math.ceil((selectedPackage?.price || 0) / (selectedPackage?.emiDays?.length || 4)).toLocaleString()}</span>
                </div>
              )}
              {selectedPackage?.salesTeamCommission?.value > 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-white/5">
                  <span className="text-green-400">Your Commission</span>
                  <span className="text-green-400 font-bold">
                    ₹{(selectedPackage.salesTeamCommission.type === 'percentage'
                      ? ((selectedPackage.price * selectedPackage.salesTeamCommission.value) / 100)
                      : selectedPackage.salesTeamCommission.value
                    ).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold transition-all border border-white/10 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
            >
              Review Order <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-2xl border border-white/5 p-6 space-y-4">
            <h2 className="text-white font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Customer</span>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{customer.name}</p>
                  <p className="text-gray-500 text-xs">{customer.phone}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Email</span>
                  <span className="text-white text-sm">{customer.email}</span>
                </div>
              )}
              {(customer.city || customer.state) && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400 text-sm">Location</span>
                  <span className="text-white text-sm">{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Package</span>
                <span className="text-white text-sm font-medium">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Payment Type</span>
                <span className="text-white text-sm capitalize">{paymentType}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400 text-sm">Amount Due Now</span>
                <span className="text-white text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600">After creating the order, you can mark payment manually or generate a payment link for the customer.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold transition-all border border-white/10 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={mutation.isPending}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Create Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
