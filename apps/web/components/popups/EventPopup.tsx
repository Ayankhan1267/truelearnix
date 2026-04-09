'use client'
import { useEffect, useState } from 'react'
import { X, Bell, Zap, ArrowRight } from 'lucide-react'

interface Props {
  popup: any
  milestone?: any
  onClose: () => void
}

export default function EventPopup({ popup, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    // Auto-dismiss after 10s
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 10000)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  return (
    <div className={`fixed bottom-6 left-6 z-[9999] transition-all duration-400 ${visible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
      <div className="bg-slate-900/95 border border-blue-500/30 backdrop-blur-xl rounded-2xl p-4 w-80 shadow-2xl shadow-blue-500/10">
        <button onClick={close} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">Live Event</span>
          </div>
        </div>

        {/* Icon + content */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {popup.image ? (
              <img src={popup.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Bell className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{popup.title}</p>
            {popup.description && (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{popup.description}</p>
            )}
          </div>
        </div>

        {popup.ctaText && (
          <a href={popup.videoUrl || popup.ctaLink || '#'}
            target={popup.videoUrl ? '_blank' : undefined}
            onClick={close}
            className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition-colors">
            <Zap className="w-3.5 h-3.5" /> {popup.ctaText} <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Auto-dismiss bar */}
        <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400/60 rounded-full" style={{ animation: 'shrink 10s linear forwards', width: '100%' }} />
        </div>
      </div>
    </div>
  )
}
