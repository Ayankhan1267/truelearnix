'use client'
import AdminLayout from '@/components/AdminLayout'
import { useState } from 'react'
import { Trophy, Download, Star, Award, Zap, Share2 } from 'lucide-react'

const TEMPLATES = [
  { id: 1, name: 'Course Completion', emoji: '🎓', bg: 'from-violet-600 to-indigo-600' },
  { id: 2, name: 'Top Earner', emoji: '💰', bg: 'from-yellow-500 to-orange-500' },
  { id: 3, name: 'Star Affiliate', emoji: '⭐', bg: 'from-blue-500 to-cyan-500' },
  { id: 4, name: 'Class Champion', emoji: '🏆', bg: 'from-green-500 to-emerald-500' },
  { id: 5, name: 'First Sale', emoji: '🎯', bg: 'from-pink-500 to-rose-500' },
  { id: 6, name: 'Community Leader', emoji: '👑', bg: 'from-purple-500 to-violet-500' },
]

export default function AchievementsPage() {
  const [selected, setSelected] = useState(TEMPLATES[0])
  const [form, setForm] = useState({ name: '', achievement: '', date: new Date().toLocaleDateString('en-IN'), subtitle: 'TureLearnix Platform' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handlePrint = () => {
    const printDiv = document.getElementById('poster-preview')
    if (!printDiv) return
    const win = window.open('', '_blank')
    win?.document.write(`<html><head><title>Achievement Poster</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f172a;font-family:system-ui,sans-serif;}</style></head><body>${printDiv.innerHTML}</body></html>`)
    win?.document.close()
    win?.focus()
    setTimeout(() => { win?.print(); win?.close() }, 500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Trophy className="w-8 h-8 text-yellow-400" /> Achievement Poster Generator</h1>
          <p className="text-gray-400 mt-1">Create and share achievement certificates for students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Select Template</h2>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${selected.id === t.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${t.bg} flex items-center justify-center text-2xl mb-2`}>{t.emoji}</div>
                    <p className="text-xs text-white font-medium">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="text-lg font-bold text-white">Poster Details</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Student Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="Enter student name" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Achievement</label>
                <input value={form.achievement} onChange={e => set('achievement', e.target.value)} className="input" placeholder="e.g. Completed Digital Marketing Course" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input value={form.date} onChange={e => set('date', e.target.value)} className="input" />
              </div>
              <button onClick={handlePrint} className="btn-primary w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download / Print Poster
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="card flex items-center justify-center min-h-64">
            <div id="poster-preview" className={`w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br ${selected.bg} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-white rounded-full" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} />)}
              </div>
              <div className="text-6xl mb-4 relative z-10">{selected.emoji}</div>
              <p className="text-white/80 text-sm font-medium mb-2 relative z-10">CERTIFICATE OF ACHIEVEMENT</p>
              <h2 className="text-2xl font-black text-white mb-3 relative z-10">{form.name || 'Student Name'}</h2>
              <p className="text-white/90 text-sm font-medium mb-4 relative z-10">{form.achievement || 'Achievement Description'}</p>
              <div className="w-16 h-0.5 bg-white/40 mb-4 relative z-10" />
              <p className="text-white/80 text-xs relative z-10">{form.subtitle}</p>
              <p className="text-white/60 text-xs mt-1 relative z-10">{form.date}</p>
              <div className="absolute bottom-4 right-4 flex items-center gap-1">
                <Zap className="w-4 h-4 text-white/60" />
                <span className="text-white/60 text-xs font-bold">TureLearnix</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
