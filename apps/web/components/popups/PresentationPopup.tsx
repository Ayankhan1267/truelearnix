'use client'
import { useEffect, useState } from 'react'
import { X, PlayCircle, ArrowRight, Clock } from 'lucide-react'

interface Props {
  popup: any
  milestone?: any
  onClose: () => void
}

export default function PresentationPopup({ popup, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  const openVideo = () => {
    if (popup.videoUrl) {
      setVideoOpen(true)
    } else if (popup.ctaLink) {
      window.open(popup.ctaLink, '_blank')
      close()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />

      {/* Modal */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none`}>
        <div className={`bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-lg shadow-2xl pointer-events-auto transition-all duration-400 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

          {/* Close */}
          <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 transition-colors bg-slate-800 rounded-full p-1.5">
            <X className="w-4 h-4" />
          </button>

          {/* Thumbnail / play area */}
          <div className="relative rounded-t-2xl overflow-hidden bg-slate-800 aspect-video cursor-pointer group" onClick={openVideo}>
            {popup.videoThumb ? (
              <img src={popup.videoThumb} alt={popup.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-900/60 to-indigo-900/60 flex items-center justify-center">
                <div className="text-slate-500 text-sm">Click to play</div>
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <Clock className="w-3 h-3 text-violet-400" />
              <span className="text-white text-xs font-medium">2 min</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h2 className="text-white font-bold text-lg leading-tight">{popup.title}</h2>
            {popup.description && (
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{popup.description}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 text-sm transition-colors">
                Maybe later
              </button>
              <button onClick={openVideo}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {popup.ctaText || 'Watch Now'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline video player (if videoUrl is set) */}
      {videoOpen && popup.videoUrl && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
          <div className="w-full max-w-3xl aspect-video">
            <iframe
              src={popup.videoUrl.includes('youtube.com/watch')
                ? popup.videoUrl.replace('watch?v=', 'embed/') + '?autoplay=1'
                : popup.videoUrl}
              className="w-full h-full rounded-xl"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
