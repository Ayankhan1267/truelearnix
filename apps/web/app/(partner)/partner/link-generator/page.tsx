'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useState } from 'react'
import {
  Copy, Check, Share2, ExternalLink, ShoppingBag, BookOpen,
  Video, Calendar, ChevronDown, Sparkles, Gift, PlayCircle, Link2, Tag
} from 'lucide-react'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'}`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function WaBtn({ url, msg }: { url?: string; msg: string }) {
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

export default function LinkGeneratorPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['partner-link'],
    queryFn: () => partnerAPI.link().then(r => r.data)
  })

  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  if (isLoading) return (
    <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
  )

  const code = data?.affiliateCode || user?.affiliateCode || ''
  const packageLinks: any[] = data?.packageLinks || []
  const courseLinks: any[] = data?.courseLinks || []
  const webinar = data?.webinar || {}
  const presentationVideoLink = data?.presentationVideoLink || ''
  const generalLinks = data?.generalLinks || {}

  const selectedPkg = packageLinks.find(p => p.id === selectedPackageId) || packageLinks[0]
  const selectedCourse = courseLinks.find(c => c.id === selectedCourseId) || courseLinks[0]

  const pkgCheckoutUrl = selectedPkg
    ? `${selectedPkg.checkoutUrl.split('?')[0].replace('/checkout', '')}` || selectedPkg.checkoutUrl
    : ''

  // Build checkout URL with promo param
  const baseWebUrl = 'https://peptly.in'
  const pkgUrl = selectedPkg
    ? `${baseWebUrl}/checkout?type=package&packageId=${selectedPkg.id}&promo=${code}`
    : ''
  const pkgRegUrl = selectedPkg
    ? `${baseWebUrl}/register?ref=${code}&next=/checkout?type=package%26packageId=${selectedPkg.id}%26promo=${code}`
    : `${baseWebUrl}/register?ref=${code}`
  const courseUrl = selectedCourse
    ? `${baseWebUrl}/courses/${selectedCourse.slug}?ref=${code}`
    : ''

  const tierColors: Record<string, string> = {
    starter: 'border-sky-500/40 text-sky-400',
    pro: 'border-violet-500/40 text-violet-400',
    elite: 'border-amber-500/40 text-amber-400',
    supreme: 'border-rose-500/40 text-rose-400',
  }

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1 className="text-white text-2xl font-bold">Link Generator</h1>
        <p className="text-gray-400 text-sm mt-1">Generate your referral links — promo code is auto-applied for buyers</p>
      </div>

      {/* Promo Code */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-indigo-900/60 border border-violet-500/30 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/40 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <p className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Your Promo Code</p>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-widest">{code}</span>
            </div>
          </div>
          <div className="sm:ml-auto">
            <CopyBtn text={code} />
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-3 relative">Buyers get a discount when this code is applied — it's pre-filled in checkout links below</p>
      </div>

      {/* ── PACKAGE LINK GENERATOR ── */}
      {packageLinks.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Package Checkout Link</h2>
              <p className="text-gray-400 text-xs">Promo code is auto-applied — buyer gets discount instantly</p>
            </div>
          </div>

          {/* Package dropdown */}
          <div className="relative">
            <select
              value={selectedPackageId || (packageLinks[0]?.id ?? '')}
              onChange={e => setSelectedPackageId(e.target.value)}
              className="w-full appearance-none bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 pr-10 cursor-pointer"
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

          {/* Selected package info */}
          {selectedPkg && selectedPkg.promoDiscountPercent > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <Tag className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-green-400 text-xs font-semibold">
                {selectedPkg.promoDiscountPercent}% discount auto-applied when buyer opens this link
              </span>
            </div>
          )}

          {/* Generated link */}
          {pkgUrl && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Checkout link with promo code:</p>
              <LinkBox
                url={pkgUrl}
                waMsg={`🎓 Join ${selectedPkg?.name || 'TruLearnix'}${selectedPkg?.promoDiscountPercent > 0 ? ` at ${selectedPkg.promoDiscountPercent}% off` : ''}!\n\n👉 Direct checkout link:\n${pkgUrl}\n\nYour promo code *${code}* is already applied — no need to enter manually!`}
              />
            </div>
          )}

          {/* Register link */}
          <div className="space-y-1 border-t border-white/5 pt-4">
            <p className="text-xs text-gray-500 font-medium">Registration link (for new users):</p>
            <LinkBox
              url={`${baseWebUrl}/register?ref=${code}`}
              waMsg={`🚀 Join TruLearnix — India's fastest growing skill platform!\n\n✅ Learn Digital Marketing, Affiliate Earning & more\n✅ Earn while you learn with Partner Program\n\n👉 Register now: ${baseWebUrl}/register?ref=${code}\n\nUse code *${code}* at checkout for discount!`}
            />
          </div>
        </div>
      )}

      {/* ── COURSE LINK GENERATOR ── */}
      {courseLinks.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Course Referral Link</h2>
              <p className="text-gray-400 text-xs">Your referral code is embedded — you earn commission on every sale</p>
            </div>
          </div>

          {/* Course dropdown */}
          <div className="relative">
            <select
              value={selectedCourseId || (courseLinks[0]?.id ?? '')}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full appearance-none bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 pr-10 cursor-pointer"
            >
              {courseLinks.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}{course.price > 0 ? ` — ₹${course.price.toLocaleString()}` : ' (Free)'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Generated link */}
          {courseUrl && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Course referral link:</p>
              <LinkBox
                url={courseUrl}
                waMsg={`📚 Check out this course on TruLearnix!\n\n"${selectedCourse?.title}"\n${selectedCourse?.price > 0 ? `💰 Price: ₹${selectedCourse.price.toLocaleString()}` : '✅ Free Course'}\n\n👉 Enroll here: ${courseUrl}`}
              />
            </div>
          )}
        </div>
      )}

      {/* ── WEBINAR ── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">Upcoming Webinar</h2>
            <p className="text-gray-400 text-xs">Share this with your audience to grow attendance</p>
          </div>
        </div>

        {webinar.link || webinar.title ? (
          <div className="space-y-3">
            {(webinar.title || webinar.date) && (
              <div className="px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                {webinar.title && <p className="text-white font-semibold text-sm">{webinar.title}</p>}
                {webinar.date && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3 text-violet-400" />
                    <span className="text-violet-300 text-xs">{webinar.date}</span>
                  </div>
                )}
              </div>
            )}
            {webinar.link && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Webinar join link:</p>
                <LinkBox
                  url={webinar.link}
                  waMsg={`🎓 Join our FREE webinar!\n\n${webinar.title ? `📌 ${webinar.title}\n` : ''}${webinar.date ? `📅 ${webinar.date}\n` : ''}\n👉 Join here: ${webinar.link}\n\nDon't miss it — seats are limited!`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700/50 border border-white/5">
            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <p className="text-gray-500 text-sm">No webinar scheduled yet — check back soon</p>
          </div>
        )}
      </div>

      {/* ── PRESENTATION VIDEO ── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center flex-shrink-0">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">Presentation / Sales Video</h2>
            <p className="text-gray-400 text-xs">Send this video to warm up prospects before pitching</p>
          </div>
        </div>

        {presentationVideoLink ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Video link:</p>
            <LinkBox
              url={presentationVideoLink}
              waMsg={`🎥 Watch this video to understand TruLearnix's earning opportunity!\n\n👉 ${presentationVideoLink}\n\nAfter watching, let me know — I'll help you get started!`}
            />
            <a href={presentationVideoLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1 text-xs text-rose-400 hover:text-rose-300 transition-colors">
              <Video className="w-3.5 h-3.5" /> Watch video
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700/50 border border-white/5">
            <Video className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <p className="text-gray-500 text-sm">Presentation video not configured yet — admin will add it soon</p>
          </div>
        )}
      </div>

      {/* ── TIPS ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h2 className="text-white font-bold">Tips to Maximize Earnings</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {[
            { icon: '💬', tip: 'Share package checkout links — promo discount motivates buyers to purchase faster' },
            { icon: '🎥', tip: 'Send the presentation video first to educate prospects' },
            { icon: '🎓', tip: 'Share the webinar link — attendees convert much better' },
            { icon: '📸', tip: 'Post reels showing your earnings to attract new referrals' },
            { icon: '📊', tip: 'Track all leads and follow-ups in your CRM dashboard' },
            { icon: '🏆', tip: 'Higher tier package = higher commission percentage' },
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
