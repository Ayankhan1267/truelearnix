'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Layout, BarChart2, MessageSquare, Footprints, Image as ImageIcon,
  Settings, Plus, Trash2, Save, Upload, Copy, Check, Video,
  Edit3, X, ChevronUp, ChevronDown, Loader2, Link2, FileVideo,
  PlayCircle, Globe, PanelTop
} from 'lucide-react'

const TABS = [
  { id: 'hero',         label: 'Hero Section',   icon: Layout },
  { id: 'stats',        label: 'Stats',          icon: BarChart2 },
  { id: 'testimonials', label: 'Testimonials',   icon: MessageSquare },
  { id: 'steps',        label: 'How It Works',   icon: Footprints },
  { id: 'media',        label: 'Media Library',  icon: ImageIcon },
  { id: 'settings',     label: 'Site Settings',  icon: Settings },
]

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_HERO = {
  badgeText: 'LIVE LEARNING PLATFORM',
  headline: "India's #1 Live Learning + Earning Platform",
  subheadline: 'Live classes, AI certificates & a built-in earn program — all in one.',
  heroBannerImage: '',
  features: ['Live Interactive Classes Daily', 'AI-Generated Certificates', 'Earn While You Learn & Grow', '500+ Expert-Led Courses'],
  ticker: ['🔥 New Batch Starting Monday', '⚡ 247 Students Joined Today', '🏆 50,000+ Learners Trust Us', '💰 ₹2Cr+ Income Paid to Students', '🎓 20,000+ Certificates Issued', '🌟 4.9/5 Platform Rating'],
  heroStats: [
    { value: '50K+', label: 'Active Learners' },
    { value: '500+', label: 'Expert Courses' },
    { value: '20K+', label: 'Certificates Issued' },
    { value: '₹2Cr+', label: 'Partner Earnings' },
  ],
  liveClassTitle: 'Full Stack Dev — Batch 12',
  liveClassMentor: 'Mentor Aryan Kapoor',
  liveClassSession: 'React Hooks Deep Dive - Session 8 / 24',
  liveClassViewers: '247 watching',
  chatMessages: [
    { u: 'Rahul', m: 'Finally understood useEffect! 🔥' },
    { u: 'Priya', m: 'Can you explain useCallback too?' },
    { u: 'Amit',  m: 'Getting certificate after this?' },
  ],
}

const DEFAULT_STATS = [
  { value: '50,000+', label: 'Active Students' },
  { value: '1,200+',  label: 'Live Sessions Done' },
  { value: '500+',    label: 'Expert Courses' },
  { value: '20,000+', label: 'Certificates Issued' },
  { value: '₹2Cr+',   label: 'Partner Earnings' },
  { value: '4.9/5',   label: 'Platform Rating' },
  { value: '50+',     label: 'Cities Covered' },
  { value: '98%',     label: 'Completion Rate' },
]

const DEFAULT_TESTIMONIALS = [
  { name: 'Priya Mehta',   role: 'Full Stack Dev @ Infosys',     result: 'Got placed in 6 weeks',    quote: 'I went from zero to getting a job at Infosys in just 6 weeks. The live classes felt like real college!', videoId: 'dQw4w9WgXcQ', avatarUrl: '', videoUrl: '' },
  { name: 'Rahul Singh',   role: 'Skill Partner, Self-Employed',  result: '₹1.2L last month',         quote: 'I earn more through skill partnerships than my old 9-to-5 job. This platform is absolutely insane!',      videoId: '',             avatarUrl: '', videoUrl: '' },
  { name: 'Ananya Verma',  role: 'Data Scientist @ Amazon',       result: '40% salary hike',          quote: 'The AI certificate is legit — Amazon HR specifically asked about TruLearnix. That was my moment!',        videoId: '',             avatarUrl: '', videoUrl: '' },
  { name: 'Karan Patel',   role: 'Freelancer @ Toptal',           result: '₹50K/month freelancing',   quote: 'Live classes gave me the confidence to charge premium rates to international clients.',                     videoId: '',             avatarUrl: '', videoUrl: '' },
  { name: 'Sneha Joshi',   role: 'UI/UX Designer @ Razorpay',     result: 'Dream job at Razorpay',    quote: 'The portfolio projects from TruLearnix bootcamp got me directly shortlisted at Razorpay.',                  videoId: '',             avatarUrl: '', videoUrl: '' },
  { name: 'Vikram Nair',   role: 'Cloud Engineer @ AWS Partner',  result: 'AWS certified in 30 days', quote: 'Structured path plus live doubt sessions — I got AWS certified in a single month.',                         videoId: '',             avatarUrl: '', videoUrl: '' },
]

const DEFAULT_STEPS = [
  { title: 'Create Account',  desc: 'Sign up free in 30 seconds. No credit card needed.' },
  { title: 'Choose Course',   desc: 'Browse 500+ expert-curated courses across tech, design & business.' },
  { title: 'Join Live Class', desc: 'Attend live interactive sessions with real mentors. Ask questions, get instant answers.' },
  { title: 'Get Certified',   desc: 'Complete quizzes & assignments. Download your AI-generated certificate instantly.' },
  { title: 'Earn Money',      desc: 'Help others learn skills — earn income on every successful enrollment.' },
]

const DEFAULT_SETTINGS = {
  platformName: 'TruLearnix',
  tagline: "India's #1 Live Learning + Earning Platform",
  contactEmail: 'support@peptly.in',
  whatsapp: '',
  instagram: '',
  youtube: '',
  twitter: '',
  linkedin: '',
  footerCopyright: '© 2025 TruLearnix. All rights reserved.',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ListEditor({ items, onChange, placeholder = 'Enter item...' }: { items: string[], onChange: (v: string[]) => void, placeholder?: string }) {
  const add = () => onChange([...items, ''])
  const update = (i: number, v: string) => { const a = [...items]; a[i] = v; onChange(a) }
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const a = [...items]; const j = i + dir
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]; onChange(a)
  }
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => move(i, -1)} className="p-0.5 text-gray-600 hover:text-white"><ChevronUp className="w-3 h-3" /></button>
            <button onClick={() => move(i, 1)} className="p-0.5 text-gray-600 hover:text-white"><ChevronDown className="w-3 h-3" /></button>
          </div>
          <input value={it} onChange={e => update(i, e.target.value)} placeholder={placeholder} className="input flex-1 text-sm" />
          <button onClick={() => remove(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 py-1.5 px-3 border border-dashed border-violet-500/40 rounded-xl w-full justify-center hover:border-violet-400 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add Item
      </button>
    </div>
  )
}

function ImageUploadField({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await adminAPI.uploadFile(fd)
      onChange(res.data.url)
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://... or upload below" className="input flex-1 text-sm" />
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="px-3 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl hover:bg-violet-600/30 transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {value && (
        <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-white/10">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button onClick={() => onChange('')} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── Tab: Hero ─────────────────────────────────────────────────────────────────
function HeroTab() {
  const [data, setData] = useState(DEFAULT_HERO)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getSiteContent('hero').then(r => {
      if (r.data.data) setData(d => ({ ...d, ...r.data.data }))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try { await adminAPI.saveSiteContent('hero', data); toast.success('Hero section saved!') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const set = (key: string, val: any) => setData(d => ({ ...d, [key]: val }))
  const setStat = (i: number, k: 'value' | 'label', v: string) => {
    const a = [...data.heroStats]; a[i] = { ...a[i], [k]: v }; setData(d => ({ ...d, heroStats: a }))
  }
  const setChat = (i: number, k: 'u' | 'm', v: string) => {
    const a = [...data.chatMessages]; a[i] = { ...a[i], [k]: v }; setData(d => ({ ...d, chatMessages: a }))
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>

  return (
    <div className="space-y-6">
      {/* Badge + Headlines */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Headlines & Badge</h3>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Badge Text</label>
          <input value={data.badgeText} onChange={e => set('badgeText', e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Main Headline *</label>
          <input value={data.headline} onChange={e => set('headline', e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Subheadline</label>
          <textarea value={data.subheadline} onChange={e => set('subheadline', e.target.value)} rows={2} className="input resize-none" />
        </div>
        <ImageUploadField label="Hero Banner Image (optional — leave empty for gradient)" value={data.heroBannerImage} onChange={v => set('heroBannerImage', v)} />
      </div>

      {/* Feature Bullets */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Feature Bullets (4 items)</h3>
        <ListEditor items={data.features} onChange={v => set('features', v)} placeholder="Feature text..." />
      </div>

      {/* Ticker */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Ticker Strip Items</h3>
        <ListEditor items={data.ticker} onChange={v => set('ticker', v)} placeholder="🔥 Ticker message..." />
      </div>

      {/* Stats Grid */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Stats Grid (4 items)</h3>
        <div className="grid grid-cols-2 gap-3">
          {data.heroStats.map((s, i) => (
            <div key={i} className="p-3 bg-slate-700/40 rounded-xl space-y-2">
              <input value={s.value} onChange={e => setStat(i, 'value', e.target.value)} placeholder="50K+" className="input text-sm" />
              <input value={s.label} onChange={e => setStat(i, 'label', e.target.value)} placeholder="Active Learners" className="input text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Live Class Card */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Live Class Card Content</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Class Title</label>
            <input value={data.liveClassTitle} onChange={e => set('liveClassTitle', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Mentor Name</label>
            <input value={data.liveClassMentor} onChange={e => set('liveClassMentor', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Session Info</label>
            <input value={data.liveClassSession} onChange={e => set('liveClassSession', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Viewers Text</label>
            <input value={data.liveClassViewers} onChange={e => set('liveClassViewers', e.target.value)} className="input text-sm" />
          </div>
        </div>
        <div>
          <h4 className="text-xs text-gray-400 mb-3">Chat Messages (3)</h4>
          <div className="space-y-2">
            {data.chatMessages.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c.u} onChange={e => setChat(i, 'u', e.target.value)} placeholder="Name" className="input text-sm w-28" />
                <input value={c.m} onChange={e => setChat(i, 'm', e.target.value)} placeholder="Message..." className="input text-sm flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Hero Section
      </button>
    </div>
  )
}

// ── Tab: Stats ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getSiteContent('stats').then(r => {
      if (r.data.data?.stats) setStats(r.data.data.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const update = (i: number, k: 'value' | 'label', v: string) => {
    const a = [...stats]; a[i] = { ...a[i], [k]: v }; setStats(a)
  }

  const save = async () => {
    setSaving(true)
    try { await adminAPI.saveSiteContent('stats', { stats }); toast.success('Stats saved!') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Platform Stats (8 cards — shown as marquee on mobile)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="p-3 bg-slate-700/40 rounded-xl space-y-2">
              <input value={s.value} onChange={e => update(i, 'value', e.target.value)} placeholder="50,000+" className="input text-sm font-bold" />
              <input value={s.label} onChange={e => update(i, 'label', e.target.value)} placeholder="Active Students" className="input text-xs" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Stats
      </button>
    </div>
  )
}

// ── Tab: Testimonials ─────────────────────────────────────────────────────────
function TestimonialsTab() {
  const [items, setItems] = useState(DEFAULT_TESTIMONIALS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminAPI.getSiteContent('testimonials').then(r => {
      if (r.data.data?.items) setItems(r.data.data.items)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try { await adminAPI.saveSiteContent('testimonials', { items }); toast.success('Testimonials saved!') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const openEdit = (i: number) => { setEditing(i); setEditData({ ...(i === -1 ? { name:'', role:'', result:'', quote:'', videoId:'', avatarUrl:'', videoUrl:'' } : items[i]) }) }
  const saveEdit = () => {
    if (editing === -1) setItems(a => [...a, editData])
    else { const a = [...items]; a[editing!] = editData; setItems(a) }
    setEditing(null); setEditData(null)
  }
  const del = (i: number) => { if (!confirm('Delete testimonial?')) return; setItems(a => a.filter((_, idx) => idx !== i)) }

  const uploadAvatar = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await adminAPI.uploadFile(fd)
      setEditData((d: any) => ({ ...d, avatarUrl: r.data.url }))
      toast.success('Avatar uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const uploadVideo = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await adminAPI.uploadFile(fd)
      setEditData((d: any) => ({ ...d, videoUrl: r.data.url, videoId: '' }))
      toast.success('Video uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>

  return (
    <div className="space-y-4">
      {/* Edit Modal */}
      {editing !== null && editData && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{editing === -1 ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
              <button onClick={() => { setEditing(null); setEditData(null) }} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                <input value={editData.name} onChange={e => setEditData((d: any) => ({ ...d, name: e.target.value }))} className="input text-sm" placeholder="Rahul Singh" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Result Badge</label>
                <input value={editData.result} onChange={e => setEditData((d: any) => ({ ...d, result: e.target.value }))} className="input text-sm" placeholder="₹1.2L last month" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role / Company</label>
              <input value={editData.role} onChange={e => setEditData((d: any) => ({ ...d, role: e.target.value }))} className="input text-sm" placeholder="Full Stack Dev @ Infosys" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quote *</label>
              <textarea value={editData.quote} onChange={e => setEditData((d: any) => ({ ...d, quote: e.target.value }))} rows={3} className="input resize-none text-sm" placeholder="Their testimonial quote..." />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Avatar Image</label>
              <div className="flex gap-2">
                <input value={editData.avatarUrl} onChange={e => setEditData((d: any) => ({ ...d, avatarUrl: e.target.value }))} className="input flex-1 text-sm" placeholder="https://..." />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-xl text-xs hover:bg-violet-600/30 flex items-center gap-1.5 disabled:opacity-50">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </div>
              {editData.avatarUrl && <img src={editData.avatarUrl} className="mt-2 w-14 h-14 rounded-full object-cover border border-white/20" />}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Video — YouTube ID <span className="text-gray-600">(or upload below)</span></label>
              <input value={editData.videoId} onChange={e => setEditData((d: any) => ({ ...d, videoId: e.target.value, videoUrl: '' }))} className="input text-sm" placeholder="dQw4w9WgXcQ" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Video — Direct Upload</label>
              <div className="flex gap-2">
                <input value={editData.videoUrl || ''} onChange={e => setEditData((d: any) => ({ ...d, videoUrl: e.target.value, videoId: '' }))} className="input flex-1 text-sm" placeholder="https://..." />
                <button onClick={() => videoRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs hover:bg-blue-600/30 flex items-center gap-1.5 disabled:opacity-50">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileVideo className="w-3.5 h-3.5" />} Upload
                </button>
                <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
              </div>
              {editData.videoUrl && <p className="text-xs text-green-400 mt-1">✓ Video uploaded</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} disabled={!editData.name || !editData.quote} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Check className="w-4 h-4" /> {editing === -1 ? 'Add' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(null); setEditData(null) }} className="px-4 py-2.5 text-sm text-gray-400 bg-slate-700/50 rounded-xl hover:bg-slate-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{items.length} testimonials</p>
        <button onClick={() => openEdit(-1)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t, i) => (
          <div key={i} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {t.avatarUrl
                  ? <img src={t.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">{t.name[0]}</div>
                }
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(i)} className="p-1.5 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(i)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {t.result && <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full border border-green-500/20">{t.result}</span>}
            <p className="text-gray-400 text-xs line-clamp-2">"{t.quote}"</p>
            {(t.videoId || t.videoUrl) && (
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <PlayCircle className="w-3.5 h-3.5" />
                {t.videoId ? `YouTube: ${t.videoId}` : 'Uploaded video'}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save All Testimonials
      </button>
    </div>
  )
}

// ── Tab: Steps ────────────────────────────────────────────────────────────────
function StepsTab() {
  const [steps, setSteps] = useState(DEFAULT_STEPS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getSiteContent('steps').then(r => {
      if (r.data.data?.steps) setSteps(r.data.data.steps)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const update = (i: number, k: 'title' | 'desc', v: string) => {
    const a = [...steps]; a[i] = { ...a[i], [k]: v }; setSteps(a)
  }

  const save = async () => {
    setSaving(true)
    try { await adminAPI.saveSiteContent('steps', { steps }); toast.success('Steps saved!') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>

  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">How It Works Steps (5 steps)</h3>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="p-4 bg-slate-700/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center text-xs font-black">
                  0{i + 1}
                </span>
                <input value={s.title} onChange={e => update(i, 'title', e.target.value)} placeholder="Step title" className="input flex-1 text-sm font-semibold" />
              </div>
              <textarea value={s.desc} onChange={e => update(i, 'desc', e.target.value)} rows={2} placeholder="Step description..." className="input w-full resize-none text-sm" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Steps
      </button>
    </div>
  )
}

// ── Tab: Media Library ────────────────────────────────────────────────────────
function MediaTab() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const r = await adminAPI.listMedia(filter === 'all' ? undefined : filter)
      setFiles(r.data.files || [])
    } catch {}
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleUpload = async (fileList: FileList) => {
    setUploading(true)
    let uploaded = 0
    for (const file of Array.from(fileList)) {
      try {
        const fd = new FormData(); fd.append('file', file)
        await adminAPI.uploadFile(fd)
        uploaded++
      } catch {}
    }
    if (uploaded) { toast.success(`${uploaded} file(s) uploaded!`); load() }
    else toast.error('Upload failed')
    setUploading(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return
    try {
      await adminAPI.deleteMedia(id)
      setFiles(f => f.filter(x => x._id !== id))
      toast.success('File deleted')
    } catch { toast.error('Delete failed') }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
  }

  const fmtSize = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${(b / 1024).toFixed(0)}KB`

  const displayed = filter === 'all' ? files : files.filter(f => f.type === filter)

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className="border-2 border-dashed border-violet-500/40 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500/70 hover:bg-violet-500/5 transition-all"
      >
        {uploading
          ? <div className="flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /><span className="text-violet-400 font-semibold">Uploading...</span></div>
          : <>
              <Upload className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Drop files here or click to upload</p>
              <p className="text-gray-500 text-sm">Images (JPG, PNG, WebP) · Videos (MP4, WebM) · PDF · ZIP · Up to 500MB</p>
            </>
        }
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.zip" className="hidden"
          onChange={e => e.target.files && handleUpload(e.target.files)} />
      </div>

      {/* Filter + count */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['all','image','video','document'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === t ? 'bg-violet-600 text-white' : 'bg-slate-700/50 text-gray-400 hover:text-white'}`}>
            {t === 'all' ? `All (${files.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)}s`}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5">Refresh</button>
      </div>

      {/* Grid */}
      {loading
        ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
        : displayed.length === 0
          ? <div className="text-center py-16 text-gray-600">No files uploaded yet</div>
          : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayed.map((f) => (
                <div key={f._id} className="group relative rounded-xl overflow-hidden bg-slate-800 border border-white/8 hover:border-violet-500/40 transition-all">
                  {/* Thumbnail */}
                  <div className="aspect-square bg-slate-700/50 relative">
                    {f.type === 'image'
                      ? <img src={f.url} alt={f.originalName} className="w-full h-full object-cover" loading="lazy" />
                      : f.type === 'video'
                        ? <div className="w-full h-full flex items-center justify-center"><FileVideo className="w-10 h-10 text-blue-400" /></div>
                        : <div className="w-full h-full flex items-center justify-center"><Globe className="w-10 h-10 text-gray-400" /></div>
                    }
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-white text-[10px] truncate font-medium">{f.originalName || f.filename}</p>
                    <p className="text-gray-600 text-[9px]">{f.size ? fmtSize(f.size) : ''}</p>
                  </div>
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <CopyBtn text={f.url} />
                    <button onClick={() => del(f._id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <a href={f.url} target="_blank" rel="noreferrer" className="p-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors">
                      <Link2 className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
      }
    </div>
  )
}

// ── Tab: Settings ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const [data, setData] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getSiteContent('settings').then(r => {
      if (r.data.data) setData(d => ({ ...d, ...r.data.data }))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: string) => setData(d => ({ ...d, [k]: v }))

  const save = async () => {
    setSaving(true)
    try { await adminAPI.saveSiteContent('settings', data); toast.success('Settings saved!') }
    catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>

  const field = (label: string, k: keyof typeof data, placeholder = '') => (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input value={data[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} className="input" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">General</h3>
        {field('Platform Name', 'platformName', 'TruLearnix')}
        {field('Tagline', 'tagline', "India's #1 Live Learning + Earning Platform")}
        {field('Contact Email', 'contactEmail', 'support@peptly.in')}
        {field('WhatsApp Number', 'whatsapp', '+91 98765 43210')}
        {field('Footer Copyright', 'footerCopyright', '© 2025 TruLearnix')}
      </div>
      <div className="card space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3">Social Links</h3>
        {field('Instagram URL', 'instagram', 'https://instagram.com/trulearnix')}
        {field('YouTube URL', 'youtube', 'https://youtube.com/@trulearnix')}
        {field('Twitter / X URL', 'twitter', 'https://twitter.com/trulearnix')}
        {field('LinkedIn URL', 'linkedin', 'https://linkedin.com/company/trulearnix')}
      </div>
      <button onClick={save} disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContentPage() {
  const [tab, setTab] = useState('hero')

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <PanelTop className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-bold text-white">Website Content Manager</h1>
            <p className="text-xs text-gray-400">Edit all content, images and videos shown on peptly.in</p>
          </div>
        </div>

        {/* Tabs — scroll on mobile */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-1 min-w-max">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    tab === t.id ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'hero'         && <HeroTab />}
        {tab === 'stats'        && <StatsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'steps'        && <StepsTab />}
        {tab === 'media'        && <MediaTab />}
        {tab === 'settings'     && <SettingsTab />}
      </div>
    </AdminLayout>
  )
}
