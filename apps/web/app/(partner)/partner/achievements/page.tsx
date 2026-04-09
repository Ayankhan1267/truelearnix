'use client'
import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Award, Download, Share2, Lock, Star, Trophy, Zap, Crown, Shield, Target, Users, Flame } from 'lucide-react'

const iconMap: Record<string, any> = {
  Star, Trophy, Zap, Crown, Shield, Target, Users, Flame, Award
}

function PosterCanvas({ achievement, user, onClose }: { achievement: any, user: any, onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generated, setGenerated] = useState(false)

  const generate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 800

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 800)
    grad.addColorStop(0, '#1a0533')
    grad.addColorStop(0.5, '#0f0a1f')
    grad.addColorStop(1, '#0d1a33')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 800, 800)

    // Decorative circles
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#8b5cf6'
    ctx.beginPath(); ctx.arc(700, 100, 200, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath(); ctx.arc(100, 700, 150, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Border
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    ctx.strokeRect(20, 20, 760, 760)
    ctx.strokeStyle = '#6d28d9'
    ctx.lineWidth = 1
    ctx.strokeRect(30, 30, 740, 740)

    // Badge emoji / icon
    ctx.font = '120px serif'
    ctx.textAlign = 'center'
    ctx.fillText(achievement.badge || '🏆', 400, 220)

    // Achievement title
    const titleGrad = ctx.createLinearGradient(200, 250, 600, 310)
    titleGrad.addColorStop(0, '#a78bfa')
    titleGrad.addColorStop(1, '#60a5fa')
    ctx.fillStyle = titleGrad
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText(achievement.title, 400, 310)

    // Description
    ctx.fillStyle = '#94a3b8'
    ctx.font = '22px sans-serif'
    const words = achievement.description.split(' ')
    let line = ''
    let y = 370
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > 680 && line) {
        ctx.fillText(line, 400, y); line = word + ' '; y += 32
      } else { line = test }
    }
    ctx.fillText(line, 400, y)

    // Divider
    const divGrad = ctx.createLinearGradient(200, 0, 600, 0)
    divGrad.addColorStop(0, 'transparent')
    divGrad.addColorStop(0.5, '#8b5cf6')
    divGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = divGrad
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(200, 440); ctx.lineTo(600, 440); ctx.stroke()

    // User name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(user?.name || 'Partner', 400, 510)

    // Platform name
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('TruLearnix Partner Network', 400, 555)

    // Affiliate code
    ctx.fillStyle = '#475569'
    ctx.font = '16px monospace'
    ctx.fillText(`Code: ${user?.affiliateCode || '—'}`, 400, 590)

    // Date
    ctx.fillStyle = '#334155'
    ctx.font = '14px sans-serif'
    ctx.fillText(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 400, 640)

    // Bottom logo text
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('peptly.in', 400, 720)

    // Stars decoration
    ctx.fillStyle = '#f59e0b'
    ctx.font = '24px serif'
    ctx.fillText('✦ ✦ ✦', 400, 760)

    setGenerated(true)
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${achievement.title.replace(/\s+/g, '-')}-achievement.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const share = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'achievement.png', { type: 'image/png' })
      if (navigator.share) {
        navigator.share({ title: achievement.title, files: [file] }).catch(() => download())
      } else {
        download()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-lg p-6">
        <h3 className="text-white font-bold text-lg mb-4">Achievement Poster — {achievement.title}</h3>

        <div className="relative bg-dark-900 rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
          {!generated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">{achievement.badge || '🏆'}</div>
              <p className="text-white font-bold text-lg">{achievement.title}</p>
              <p className="text-dark-400 text-sm text-center px-4">{achievement.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-all text-sm">Close</button>
          {!generated ? (
            <button onClick={generate}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm">
              Generate Poster
            </button>
          ) : (
            <>
              <button onClick={download}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={share}
                className="px-4 py-2.5 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AchievementsPage() {
  const { user } = useAuthStore()
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null)
  const { data, isLoading } = useQuery({ queryKey: ['partner-achievements'], queryFn: () => partnerAPI.achievements().then(r => r.data) })

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => <div key={i} className="h-40 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  const achievements = data?.achievements || []
  const earned = achievements.filter((a: any) => a.earned)
  const locked = achievements.filter((a: any) => !a.earned)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Achievements</h1>
        <p className="text-dark-400 text-sm mt-1">Unlock achievements and generate shareable posters</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/30 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-bold text-xl">{earned.length} / {achievements.length}</p>
          <p className="text-dark-400 text-sm">Achievements Unlocked</p>
        </div>
        <div className="ml-auto">
          <div className="w-16 h-16 rounded-full relative">
            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#1e1b4b" strokeWidth="5" />
              <circle cx="30" cy="30" r="25" fill="none" stroke="#f59e0b" strokeWidth="5"
                strokeDasharray={`${achievements.length > 0 ? (earned.length / achievements.length) * 157 : 0} 157`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
              {achievements.length > 0 ? Math.round((earned.length / achievements.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />Earned ({earned.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earned.map((a: any) => {
              const Icon = iconMap[a.icon] || Award
              return (
                <div key={a._id || a.title}
                  className="relative bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/40 rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform hover:border-amber-500/60 group"
                  onClick={() => setSelectedAchievement(a)}>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-4xl mb-2">{a.badge || '🏆'}</div>
                  <p className="text-white font-bold text-sm">{a.title}</p>
                  <p className="text-dark-400 text-xs mt-1 line-clamp-2">{a.description}</p>
                  {a.earnedAt && <p className="text-amber-600 text-[10px] mt-2">{new Date(a.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Poster</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-dark-400" />Locked ({locked.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {locked.map((a: any) => (
              <div key={a._id || a.title} className="bg-dark-800 border border-dark-700 rounded-2xl p-4 text-center opacity-60">
                <div className="text-4xl mb-2 grayscale">{a.badge || '🏆'}</div>
                <p className="text-dark-400 font-bold text-sm">{a.title}</p>
                <p className="text-dark-600 text-xs mt-1 line-clamp-2">{a.description}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-dark-500">
                  <Lock className="w-3 h-3" />
                  <span>{a.requirement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-2xl border border-dark-700">
          <Award className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400 font-medium">No achievements yet</p>
          <p className="text-dark-500 text-sm mt-1">Start referring and selling to unlock achievements</p>
        </div>
      )}

      {/* Poster modal */}
      {selectedAchievement && (
        <PosterCanvas
          achievement={selectedAchievement}
          user={user}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}
