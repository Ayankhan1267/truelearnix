'use client'
import { useEffect, useState } from 'react'
import { X, Megaphone, ArrowRight } from 'lucide-react'

interface Props {
  popup: any
  milestone?: any
  onClose: () => void
}

export default function AnnouncementPopup({ popup, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-emerald-500/10 pointer-events-auto transition-all duration-400 overflow-hidden ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

          {/* Banner stripe */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-white font-bold text-sm uppercase tracking-wide">Announcement</span>
            <button onClick={close} className="ml-auto text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image */}
          {popup.image && (
            <div className="aspect-video overflow-hidden">
              <img src={popup.image} alt={popup.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <h2 className="text-white font-bold text-xl leading-tight">{popup.title}</h2>
            {popup.description && (
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{popup.description}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 text-sm transition-colors">
                Dismiss
              </button>
              {popup.ctaText && (
                <a href={popup.ctaLink || '#'} onClick={close}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {popup.ctaText} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
