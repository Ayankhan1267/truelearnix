'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { ShieldCheck, ShieldAlert, Clock, CheckCircle, XCircle, CreditCard, Fingerprint, Building2, ChevronRight, Save } from 'lucide-react'

const statusConfig = {
  pending: { icon: Clock, label: 'Not Submitted', color: 'text-dark-400', bg: 'bg-dark-700 border-dark-600', desc: 'Submit your KYC to start withdrawals' },
  submitted: { icon: Clock, label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700/30', desc: 'Your documents are being verified (1-3 business days)' },
  verified: { icon: CheckCircle, label: 'Verified', color: 'text-green-400', bg: 'bg-green-900/20 border-green-700/30', desc: 'KYC complete — you can now withdraw earnings' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/30', desc: 'Your KYC was rejected. Please resubmit.' },
}

export default function KYCPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['partner-kyc'], queryFn: () => partnerAPI.kyc().then(r => r.data) })

  const [form, setForm] = useState({
    pan: '', panName: '', aadhar: '', aadharName: '',
    bankAccount: '', bankIfsc: '', bankName: '', bankHolderName: '',
  })

  const kyc = data?.kyc
  const status = kyc?.status || 'pending'
  const statusInfo = statusConfig[status as keyof typeof statusConfig]
  const StatusIcon = statusInfo.icon
  const canEdit = status === 'pending' || status === 'rejected'

  useEffect(() => {
    if (kyc) {
      setForm({
        pan: kyc.pan || '',
        panName: kyc.panName || '',
        aadhar: kyc.aadhar || '',
        aadharName: kyc.aadharName || '',
        bankAccount: kyc.bankAccount || '',
        bankIfsc: kyc.bankIfsc || '',
        bankName: kyc.bankName || '',
        bankHolderName: kyc.bankHolderName || '',
      })
    }
  }, [kyc])

  const submit = useMutation({
    mutationFn: () => partnerAPI.submitKyc(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-kyc'] }),
  })

  const updateField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">KYC Verification</h1>
        <p className="text-dark-400 text-sm mt-1">Complete KYC to enable withdrawals</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${statusInfo.bg}`}>
        <StatusIcon className={`w-8 h-8 ${statusInfo.color} flex-shrink-0`} />
        <div>
          <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
          <p className="text-dark-400 text-sm mt-0.5">{statusInfo.desc}</p>
          {kyc?.rejectionReason && (
            <p className="text-red-300 text-sm mt-1.5 bg-red-900/30 px-3 py-1.5 rounded-lg">Reason: {kyc.rejectionReason}</p>
          )}
        </div>
      </div>

      {/* PAN */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-400" />PAN Card
          {kyc?.panVerified && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">PAN Number</label>
            <input value={form.pan} onChange={e => updateField('pan', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F" maxLength={10} disabled={!canEdit}
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-60 uppercase tracking-widest" />
          </div>
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Name on PAN</label>
            <input value={form.panName} onChange={e => updateField('panName', e.target.value)}
              placeholder="Full name as on PAN" disabled={!canEdit}
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-60" />
          </div>
        </div>
      </div>

      {/* Aadhar */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-blue-400" />Aadhaar Card
          {kyc?.aadharVerified && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Aadhaar Number</label>
            <input value={form.aadhar} onChange={e => updateField('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="XXXX XXXX XXXX" disabled={!canEdit}
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-60 tracking-widest" />
          </div>
          <div>
            <label className="text-dark-300 text-xs mb-1.5 block">Name on Aadhaar</label>
            <input value={form.aadharName} onChange={e => updateField('aadharName', e.target.value)}
              placeholder="Full name as on Aadhaar" disabled={!canEdit}
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-60" />
          </div>
        </div>
      </div>

      {/* Bank */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" />Bank Account</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'bankHolderName', label: 'Account Holder Name', placeholder: 'Name as on account' },
            { key: 'bankAccount', label: 'Account Number', placeholder: 'XXXXXXXXXX' },
            { key: 'bankIfsc', label: 'IFSC Code', placeholder: 'SBIN0001234', upper: true },
            { key: 'bankName', label: 'Bank Name', placeholder: 'State Bank of India' },
          ].map(({ key, label, placeholder, upper }) => (
            <div key={key}>
              <label className="text-dark-300 text-xs mb-1.5 block">{label}</label>
              <input value={(form as any)[key]} onChange={e => updateField(key, upper ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={placeholder} disabled={!canEdit}
                className={`w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-60 ${upper ? 'uppercase tracking-widest' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      {canEdit && (
        <button onClick={() => submit.mutate()} disabled={submit.isPending || !form.pan || !form.panName || !form.aadhar || !form.bankAccount || !form.bankIfsc || !form.bankName || !form.bankHolderName}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {submit.isPending ? 'Submitting...' : 'Submit KYC for Verification'}
        </button>
      )}
      {submit.isSuccess && (
        <p className="text-center text-green-400 text-sm">KYC submitted! We will verify within 1-3 business days.</p>
      )}
    </div>
  )
}
