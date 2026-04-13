'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { salesAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  Link2, Copy, Check, ExternalLink, Gift, ShoppingBag,
  ChevronDown, Share2, Loader2, Info
} from 'lucide-react'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function WaBtn({ msg }: { msg: string }) {
  const link = `https://wa.me/?text=${encodeURIComponent(msg)}`
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-all flex-shrink-0">
      <Share2 className="w-3.5 h-3.5" /> WhatsApp
    </a>
  )
}

function LinkBox({ url, waMsg }: { url: string; waMsg: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-dark-900/80 rounded-xl px-3 py-2.5 border border-white/5">
        <Link2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <span className="flex-1 text-xs text-gray-300 font-mono break-all leading-relaxed">{url}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <CopyBtn text={url} />
        <WaBtn msg={waMsg} />
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
          <ExternalLink className="w-3.5 h-3.5" /> Preview
        </a>
      </div>
    </div>
  )
}

export default function SalesLinkGeneratorPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['sales-link'],
    queryFn: () => salesAPI.myLink().then(r => r.data),
  })

  const [selectedPkgId, setSelectedPkgId] = useState('')

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
    </div>
  )

  const code = data?.affiliateCode || user?.affiliateCode || ''
  const packageLinks: any[] = data?.packageLinks || []
  const selectedPkg = packageLinks.find(p => p.id === selectedPkgId) || packageLinks[0]

  const pkgUrl = selectedPkg ? selectedPkg.checkoutUrl : ''
  const regUrl = selectedPkg ? selectedPkg.registerUrl : (data?.generalLink || '')

  return (
    <div className="space-y-5 max-w-2xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Link Generator</h1>
        <p className="text-gray-400 text-sm mt-1">Generate affiliate links with your promo code pre-applied</p>
      </div>

      {/* Promo Code */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/60 via-indigo-900/40 to-violet-900/60 border border-blue-500/30 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Your Affiliate Code</p>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-widest">{code}</span>
            </div>
          </div>
          <div className="sm:ml-auto">
            <CopyBtn text={code} />
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-3 relative">Share this code — buyers get a discount and you earn commission</p>
      </div>

      {/* Important Note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/8 border border-yellow-500/20">
        <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-300 text-xs leading-relaxed">
          Company-assigned leads (isCompanyLead) will not earn extra commission through your referral link. Use the order creation form to register those customers directly.
        </p>
      </div>

      {/* Package Links */}
      {packageLinks.length > 0 && (
        <div className="bg-dark-800 rounded-2xl border border-white/5 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Package Checkout Link</h2>
              <p className="text-gray-400 text-xs">Your code is pre-applied — buyer gets discount instantly</p>
            </div>
          </div>

          {/* Package dropdown */}
          <div className="relative">
            <select
              value={selectedPkgId || (packageLinks[0]?.id ?? '')}
              onChange={e => setSelectedPkgId(e.target.value)}
              className="w-full appearance-none bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 pr-10 cursor-pointer"
            >
              {packageLinks.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — ₹{pkg.price?.toLocaleString()}
                  {pkg.promoDiscountPercent > 0 ? ` (${pkg.promoDiscountPercent}% off with code)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {pkgUrl && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Direct checkout link:</p>
              <LinkBox
                url={pkgUrl}
                waMsg={`Join ${selectedPkg?.name || 'TruLearnix'} on TruLearnix!\n\nDirect checkout link:\n${pkgUrl}\n\nUse code ${code} for discount — already applied in the link!`}
              />
            </div>
          )}

          <div className="space-y-1 border-t border-white/5 pt-4">
            <p className="text-xs text-gray-500 font-medium">Registration link (for new users):</p>
            <LinkBox
              url={`https://peptly.in/register?ref=${code}`}
              waMsg={`Join TruLearnix — India's fastest growing skill platform!\n\nLearn Digital Marketing, Earn while you learn\n\nRegister now: https://peptly.in/register?ref=${code}\n\nUse code ${code} at checkout for discount!`}
            />
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h2 className="text-white font-bold mb-3">Sales Tips</h2>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {[
            { icon: '🎯', tip: 'Use the New Order form for company-assigned leads — do not share affiliate links for those' },
            { icon: '📱', tip: 'Share the checkout link on WhatsApp — code is auto-applied, no extra steps for buyer' },
            { icon: '💬', tip: 'Follow up within 24 hours of sharing the link for best conversion rate' },
            { icon: '📋', tip: 'Create a sales order first, then generate a payment link for the customer' },
            { icon: '💰', tip: 'Higher tier packages earn you more commission — push for Elite or Supreme' },
            { icon: '📊', tip: 'Track all your leads in the My Leads section and update stages regularly' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2.5 p-3 bg-dark-700/40 rounded-xl border border-white/5">
              <span className="text-base flex-shrink-0">{icon}</span>
              <p className="text-gray-400 text-xs leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
