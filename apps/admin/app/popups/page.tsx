'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Pencil, ToggleLeft, ToggleRight, Layers,
  PlayCircle, Trophy, Bell, Megaphone, X, Save, Eye, EyeOff
} from 'lucide-react'

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  earnings_toast:  { label: 'Earnings Milestone', icon: Trophy,      color: 'text-yellow-400 bg-yellow-500/20' },
  event:           { label: 'Event Notification', icon: Bell,         color: 'text-blue-400 bg-blue-500/20' },
  presentation:    { label: 'Presentation Video', icon: PlayCircle,   color: 'text-violet-400 bg-violet-500/20' },
  announcement:    { label: 'Announcement',       icon: Megaphone,    color: 'text-emerald-400 bg-emerald-500/20' },
}

const TRIGGER_LABELS: Record<string, string> = {
  on_load:   'Page Load',
  on_scroll: 'On Scroll',
  on_exit:   'Exit Intent',
}

const EMPTY = {
  type: 'announcement',
  title: '',
  description: '',
  image: '',
  videoUrl: '',
  videoThumb: '',
  ctaText: '',
  ctaLink: '',
  trigger: 'on_load',
  triggerDelay: 5,
  triggerScroll: 50,
  showOnce: true,
  isActive: true,
  priority: 0,
  startDate: '',
  endDate: '',
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getPopups()
      setPopups(res.data.popups)
    } catch { toast.error('Failed to load popups') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (popup: any) => {
    setEditing(popup)
    setForm({
      ...popup,
      startDate: popup.startDate ? popup.startDate.slice(0, 10) : '',
      endDate: popup.endDate ? popup.endDate.slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.startDate) delete payload.startDate
      if (!payload.endDate) delete payload.endDate

      if (editing) {
        const res = await adminAPI.updatePopup(editing._id, payload)
        setPopups(p => p.map(x => x._id === editing._id ? res.data.popup : x))
        toast.success('Popup updated')
      } else {
        const res = await adminAPI.createPopup(payload)
        setPopups(p => [res.data.popup, ...p])
        toast.success('Popup created')
      }
      setShowForm(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const toggle = async (popup: any) => {
    try {
      const res = await adminAPI.togglePopup(popup._id)
      setPopups(p => p.map(x => x._id === popup._id ? res.data.popup : x))
      toast.success(res.data.popup.isActive ? 'Popup activated' : 'Popup paused')
    } catch { toast.error('Toggle failed') }
  }

  const del = async (popup: any) => {
    if (!confirm(`Delete "${popup.title}"?`)) return
    try {
      await adminAPI.deletePopup(popup._id)
      setPopups(p => p.filter(x => x._id !== popup._id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-violet-400" /> Popup Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">Control all website popups — milestones, events, presentations</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Popup
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = popups.filter(p => p.type === type).length
            const active = popups.filter(p => p.type === type && p.isActive).length
            const Icon = meta.icon
            return (
              <div key={type} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{meta.label}</p>
                  <p className="text-white font-semibold text-sm">{active}/{count} active</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading...</div>
        ) : popups.length === 0 ? (
          <div className="text-slate-400 py-16 text-center border border-dashed border-slate-700 rounded-xl">
            No popups yet — create your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {popups.map(popup => {
              const meta = TYPE_META[popup.type]
              const Icon = meta.icon
              return (
                <div key={popup._id} className={`bg-slate-800/60 border rounded-xl p-4 flex items-center gap-4 transition-all ${popup.isActive ? 'border-slate-700/50' : 'border-slate-700/30 opacity-60'}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium truncate">{popup.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                      {!popup.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Paused</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span>Trigger: {TRIGGER_LABELS[popup.trigger]}</span>
                      {popup.trigger === 'on_load' && <span>Delay: {popup.triggerDelay}s</span>}
                      {popup.trigger === 'on_scroll' && <span>Scroll: {popup.triggerScroll}%</span>}
                      <span>Priority: {popup.priority}</span>
                      {popup.showOnce && <span>Show once</span>}
                      {popup.startDate && <span>From: {new Date(popup.startDate).toLocaleDateString('en-IN')}</span>}
                      {popup.endDate && <span>Till: {new Date(popup.endDate).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggle(popup)} title={popup.isActive ? 'Pause' : 'Activate'} className="text-slate-400 hover:text-white transition-colors">
                      {popup.isActive ? <ToggleRight className="w-5 h-5 text-violet-400" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEdit(popup)} className="text-slate-400 hover:text-blue-400 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => del(popup)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-700 h-full overflow-y-auto flex flex-col">
            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-white font-semibold">{editing ? 'Edit Popup' : 'New Popup'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Type */}
              <div>
                <label className="label">Popup Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(TYPE_META).map(([type, meta]) => {
                    const Icon = meta.icon
                    return (
                      <button key={type} onClick={() => set('type', type)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${form.type === type ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        <Icon className="w-4 h-4" /> {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. 🎉 Rahul Kumar just hit ₹50,000!" className="input mt-1" />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Short subtitle or message..." rows={2} className="input mt-1 resize-none" />
              </div>

              {/* Image */}
              <div>
                <label className="label">Image URL</label>
                <input value={form.image} onChange={e => set('image', e.target.value)}
                  placeholder="https://..." className="input mt-1" />
              </div>

              {/* Video (presentation type) */}
              {(form.type === 'presentation' || form.type === 'event') && (
                <>
                  <div>
                    <label className="label">Video URL</label>
                    <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)}
                      placeholder="YouTube / direct video URL..." className="input mt-1" />
                    <p className="text-xs text-slate-500 mt-1">Clicking the popup opens this video</p>
                  </div>
                  <div>
                    <label className="label">Video Thumbnail URL</label>
                    <input value={form.videoThumb} onChange={e => set('videoThumb', e.target.value)}
                      placeholder="https://..." className="input mt-1" />
                  </div>
                </>
              )}

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CTA Button Text</label>
                  <input value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                    placeholder="Watch Now" className="input mt-1" />
                </div>
                <div>
                  <label className="label">CTA Link</label>
                  <input value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)}
                    placeholder="/courses" className="input mt-1" />
                </div>
              </div>

              {/* Trigger */}
              <div>
                <label className="label">Trigger</label>
                <select value={form.trigger} onChange={e => set('trigger', e.target.value)} className="input mt-1">
                  <option value="on_load">Page Load</option>
                  <option value="on_scroll">On Scroll</option>
                  <option value="on_exit">Exit Intent</option>
                </select>
              </div>

              {form.trigger === 'on_load' && (
                <div>
                  <label className="label">Delay (seconds after page load)</label>
                  <input type="number" min={0} max={60} value={form.triggerDelay} onChange={e => set('triggerDelay', Number(e.target.value))} className="input mt-1" />
                </div>
              )}
              {form.trigger === 'on_scroll' && (
                <div>
                  <label className="label">Scroll Depth % (0–100)</label>
                  <input type="number" min={0} max={100} value={form.triggerScroll} onChange={e => set('triggerScroll', Number(e.target.value))} className="input mt-1" />
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="label">Priority (higher = shown first)</label>
                <input type="number" value={form.priority} onChange={e => set('priority', Number(e.target.value))} className="input mt-1" />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date (optional)</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input mt-1" />
                </div>
                <div>
                  <label className="label">End Date (optional)</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input mt-1" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showOnce} onChange={e => set('showOnce', e.target.checked)} className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Show once per user</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/60 sticky bottom-0 bg-slate-900 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : editing ? 'Update Popup' : 'Create Popup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
