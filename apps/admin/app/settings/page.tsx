'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Construction, Zap, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2, Pencil } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editMsg, setEditMsg] = useState(false)
  const [msgDraft, setMsgDraft] = useState('')

  useEffect(() => {
    adminAPI.platformSettings().then((r: any) => {
      if (r.data?.success) {
        setSettings(r.data.settings)
        setMsgDraft(r.data.settings.maintenanceMessage || '')
      }
    }).finally(() => setLoading(false))
  }, [])

  const toggle = async (key: 'maintenanceMode' | 'trulanceMaintenance') => {
    if (!settings) return
    const newVal = !settings[key]
    setSaving(key)
    try {
      const r = await adminAPI.updatePlatformSettings({ [key]: newVal })
      if (r.data?.success) {
        setSettings(r.data.settings)
        toast.success(newVal ? 'Maintenance mode ON' : 'Maintenance mode OFF')
      }
    } catch { toast.error('Failed to update') }
    setSaving(null)
  }

  const saveMessage = async () => {
    setSaving('msg')
    try {
      const r = await adminAPI.updatePlatformSettings({ maintenanceMessage: msgDraft })
      if (r.data?.success) {
        setSettings(r.data.settings)
        setEditMsg(false)
        toast.success('Message updated')
      }
    } catch { toast.error('Failed to save') }
    setSaving(null)
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage maintenance mode and platform configuration</p>
        </div>

        {/* Maintenance Message */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300">Maintenance Message</p>
            <button onClick={() => setEditMsg(v => !v)} className="text-violet-400 hover:text-violet-300 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          {editMsg ? (
            <div className="space-y-2">
              <textarea
                value={msgDraft}
                onChange={e => setMsgDraft(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-violet-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveMessage}
                  disabled={saving === 'msg'}
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {saving === 'msg' ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditMsg(false); setMsgDraft(settings?.maintenanceMessage || '') }} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">"{settings?.maintenanceMessage}"</p>
          )}
        </div>

        {/* TruLearnix Web */}
        <MaintenanceCard
          icon={<Construction className="w-5 h-5" />}
          title="TruLearnix Web"
          subtitle="trulearnix.com — Learner & Partner portal"
          active={!!settings?.maintenanceMode}
          loading={saving === 'maintenanceMode'}
          onToggle={() => toggle('maintenanceMode')}
          color="orange"
        />

        {/* Trulancer */}
        <MaintenanceCard
          icon={<Zap className="w-5 h-5" />}
          title="Trulancer"
          subtitle="trulancer.trulearnix.com — Freelance marketplace"
          active={!!settings?.trulanceMaintenance}
          loading={saving === 'trulanceMaintenance'}
          onToggle={() => toggle('trulanceMaintenance')}
          color="blue"
        />

        <p className="text-xs text-gray-500 text-center">
          Admin panel is always accessible regardless of maintenance mode.
        </p>
      </div>
    </AdminLayout>
  )
}

function MaintenanceCard({ icon, title, subtitle, active, loading, onToggle, color }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  active: boolean
  loading: boolean
  onToggle: () => void
  color: 'orange' | 'blue'
}) {
  const colors = {
    orange: { border: active ? 'border-orange-500/40' : 'border-white/10', bg: active ? 'bg-orange-500/10' : 'bg-slate-800/60', dot: 'bg-orange-400', badge: 'bg-orange-500/20 text-orange-400', toggle: 'text-orange-400' },
    blue: { border: active ? 'border-blue-500/40' : 'border-white/10', bg: active ? 'bg-blue-500/10' : 'bg-slate-800/60', dot: 'bg-blue-400', badge: 'bg-blue-500/20 text-blue-400', toggle: 'text-blue-400' },
  }
  const c = colors[color]

  return (
    <div className={`border rounded-2xl p-5 transition-all duration-300 ${c.border} ${c.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${active ? c.badge : 'bg-slate-700/60 text-gray-400'}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{title}</p>
              {active && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${c.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
                  MAINTENANCE ON
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={loading}
          className={`transition-all duration-200 disabled:opacity-50 hover:scale-110 ${active ? c.toggle : 'text-gray-600 hover:text-gray-400'}`}
        >
          {loading ? (
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : active ? (
            <ToggleRight className="w-10 h-10" />
          ) : (
            <ToggleLeft className="w-10 h-10" />
          )}
        </button>
      </div>

      {active && (
        <div className="mt-3 flex items-start gap-2 bg-black/20 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">All users will see the maintenance page. Only admin panel remains accessible.</p>
        </div>
      )}
      {!active && (
        <div className="mt-3 flex items-start gap-2 bg-black/10 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs text-green-400">Live — all users can access normally</p>
        </div>
      )}
    </div>
  )
}
