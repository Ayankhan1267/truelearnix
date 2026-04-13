'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { CreditCard, Calendar, Package, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export default function EmiPayPage() {
  const params = useParams()
  const installmentId = params?.installmentId as string

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!installmentId) return
    setLoading(true)
    api.get(`/phonepe/emi/pay-link/${installmentId}`)
      .then(r => {
        setData(r.data)
        setLoading(false)
      })
      .catch(e => {
        setError(e?.response?.data?.message || 'Failed to load installment details')
        setLoading(false)
      })
  }, [installmentId])

  const handlePay = async () => {
    if (!data?.redirectUrl) {
      // Fetch a fresh redirect URL
      setPaying(true)
      try {
        const r = await api.get(`/phonepe/emi/pay-link/${installmentId}`)
        if (r.data?.redirectUrl) {
          window.location.href = r.data.redirectUrl
        } else {
          setError('Could not initiate payment. Please try again.')
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Payment initiation failed')
      } finally {
        setPaying(false)
      }
    } else {
      window.location.href = data.redirectUrl
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
        <p className="text-gray-400 text-sm">Loading installment details...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-red-500/20 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    </div>
  )

  if (data?.alreadyPaid) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-green-500/20 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Already Paid</h2>
        <p className="text-gray-400 text-sm">This installment has already been paid. Thank you!</p>
      </div>
    </div>
  )

  const inst = data?.installment
  const due = inst?.dueDate ? new Date(inst.dueDate) : null
  const isOverdue = due && new Date() > due && inst?.status !== 'paid'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-white text-2xl font-bold">EMI Payment</h1>
          <p className="text-gray-400 text-sm mt-1">Complete your installment payment</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 space-y-5">
          {/* Package */}
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl">
            <Package className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Package</p>
              <p className="text-white font-semibold capitalize">{data?.packageName || 'TruLearnix Package'}</p>
            </div>
          </div>

          {/* Installment info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-800 rounded-xl text-center">
              <p className="text-gray-400 text-xs mb-1">Installment</p>
              <p className="text-white font-bold text-lg">
                {inst?.installmentNumber} / {inst?.totalInstallments}
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl text-center">
              <p className="text-gray-400 text-xs mb-1">Amount</p>
              <p className="text-violet-400 font-bold text-lg">
                ₹{(data?.amount || inst?.amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Due date */}
          {due && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${isOverdue ? 'bg-red-900/20 border-red-500/30' : 'bg-gray-800 border-transparent'}`}>
              <Calendar className={`w-5 h-5 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`} />
              <div>
                <p className="text-gray-400 text-xs">Due Date</p>
                <p className={`font-semibold text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                  {due.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {isOverdue && <span className="ml-2 text-xs text-red-400">(Overdue)</span>}
                </p>
              </div>
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initiating payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{(data?.amount || inst?.amount || 0).toLocaleString('en-IN')} Now
              </>
            )}
          </button>

          <p className="text-gray-600 text-xs text-center">
            Secure payment powered by PhonePe. Your data is safe.
          </p>
        </div>
      </div>
    </div>
  )
}
