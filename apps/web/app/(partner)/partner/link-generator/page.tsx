'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useState } from 'react'
import { Link2, Copy, Check, Share2, QrCode, ExternalLink, Globe, ShoppingBag, Users } from 'lucide-react'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-dark-600 hover:bg-dark-500 text-dark-300 hover:text-white'}`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ShareBtn({ url, title }: { url: string, title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }
  return (
    <button onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 transition-all">
      <Share2 className="w-3.5 h-3.5" /> Share
    </button>
  )
}

export default function LinkGeneratorPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['partner-link'], queryFn: () => partnerAPI.link().then(r => r.data) })

  if (isLoading) return (
    <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
  )

  const links = data?.links || {}
  const code = data?.affiliateCode || user?.affiliateCode

  const linkTypes = [
    {
      key: 'main', icon: Globe, label: 'Main Affiliate Link', desc: 'General homepage with your referral code',
      color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
      iconBg: 'bg-violet-600',
    },
    {
      key: 'register', icon: Users, label: 'Registration Link', desc: 'Direct to signup page with auto-filled referral code',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      iconBg: 'bg-blue-600',
    },
    {
      key: 'packages', icon: ShoppingBag, label: 'Packages/Pricing Link', desc: 'Send prospects directly to the pricing page',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconBg: 'bg-emerald-600',
    },
  ]

  const whatsappMsg = `🚀 Hey! Join me on TruLearnix — India's fastest growing skill-based learning platform!\n\n✅ Learn Digital Marketing, Affiliate Earning & more\n✅ Earn while you learn with our partner program\n✅ Up to 30% commission on referrals\n\n👉 Register here: ${links.register || '#'}\n\nUse my code: *${code}*`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Link Generator</h1>
        <p className="text-dark-400 text-sm mt-1">Your personalized affiliate links with auto-applied promo code</p>
      </div>

      {/* Affiliate Code */}
      <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/40 rounded-2xl p-5">
        <p className="text-dark-400 text-xs uppercase tracking-wider mb-2">Your Affiliate Code</p>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black text-white font-mono tracking-widest">{code}</span>
          <CopyBtn text={code || ''} />
        </div>
        <p className="text-dark-400 text-xs mt-2">This code is automatically applied when anyone clicks your link</p>
      </div>

      {/* Links */}
      <div className="space-y-4">
        {linkTypes.map(({ key, icon: Icon, label, desc, color, iconBg }) => {
          const url = links[key] || ''
          return (
            <div key={key} className={`rounded-2xl border p-5 bg-gradient-to-r ${color}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{label}</p>
                  <p className="text-dark-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
              <div className="bg-dark-900/60 rounded-xl px-3 py-2 text-xs text-dark-300 font-mono break-all mb-3 leading-relaxed">
                {url}
              </div>
              <div className="flex items-center gap-2">
                <CopyBtn text={url} />
                <ShareBtn url={url} title={label} />
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-600 hover:bg-dark-500 text-dark-300 hover:text-white transition-all ml-auto">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* WhatsApp Message */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-green-400" />Ready-to-Send WhatsApp Message
        </h3>
        <div className="bg-dark-700 rounded-xl p-4 text-sm text-dark-300 whitespace-pre-line font-mono text-xs leading-relaxed">
          {whatsappMsg}
        </div>
        <div className="flex gap-2 mt-3">
          <CopyBtn text={whatsappMsg} />
          <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp
          </a>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-3">Sharing Tips</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-dark-400">
          {[
            { icon: '💬', tip: 'Share on WhatsApp groups and stories' },
            { icon: '📸', tip: 'Post on Instagram Reels with your success story' },
            { icon: '💼', tip: 'Connect with professionals on LinkedIn' },
            { icon: '🎯', tip: 'Use the registration link for direct signups' },
            { icon: '📊', tip: 'Track conversions in your CRM dashboard' },
            { icon: '🏆', tip: 'Higher package = higher commission rates' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-base">{icon}</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
