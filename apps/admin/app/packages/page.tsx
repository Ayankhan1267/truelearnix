'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { Edit2, X, Plus, Trash2, Check } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  starter: 'from-sky-500/20 to-sky-600/10 border-sky-500/30',
  pro: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  elite: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  supreme: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
}
const TIER_ACCENT: Record<string, string> = {
  starter: 'text-sky-400',
  pro: 'text-violet-400',
  elite: 'text-amber-400',
  supreme: 'text-rose-400',
}

export default function PackagesPage() {
  const qc = useQueryClient()
  const [editPkg, setEditPkg] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [featuresInput, setFeaturesInput] = useState('')
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => adminAPI.packages().then(r => r.data)
  })

  const packages = data?.packages || data || []

  const openEdit = (pkg: any) => {
    setEditPkg(pkg)
    setForm({
      name: pkg.name || '',
      price: pkg.price || 0,
      commissionRate: pkg.commissionRate || 0,
      commissionLevel2: pkg.commissionLevel2 || 0,
      commissionLevel3: pkg.commissionLevel3 || 0,
      features: pkg.features || [],
    })
    setFeaturesInput((pkg.features || []).join('\n'))
  }

  const savePackage = async () => {
    setSaving(true)
    try {
      const features = featuresInput.split('\n').map((f: string) => f.trim()).filter(Boolean)
      await adminAPI.updatePackage(editPkg._id, { ...form, features })
      toast.success('Package updated')
      qc.invalidateQueries({ queryKey: ['admin-packages'] })
      setEditPkg(null)
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  // Commission matrix: earner tier × buyer tier
  const tiers = ['starter', 'pro', 'elite', 'supreme']
  const getCommission = (earnerTier: string, buyerPkg: any) => {
    // returns L1 commission % for earner's tier
    const earner = packages.find((p: any) => p.tier?.toLowerCase() === earnerTier || p.name?.toLowerCase() === earnerTier)
    return earner?.commissionRate || 0
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Package cards */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Package Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {packages.map((pkg: any) => {
              const tier = (pkg.tier || pkg.name || '').toLowerCase()
              return (
                <div key={pkg._id} className={`card bg-gradient-to-br ${TIER_COLORS[tier] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30'} border relative`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${TIER_ACCENT[tier] || 'text-gray-400'}`}>
                        {tier}
                      </span>
                      <p className="text-xl font-black text-white mt-1">{pkg.name}</p>
                    </div>
                    <button onClick={() => openEdit(pkg)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className={`text-3xl font-black ${TIER_ACCENT[tier] || 'text-gray-400'} mb-4`}>
                    ₹{(pkg.price || 0).toLocaleString()}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">L1 Commission</span>
                      <span className="text-white font-semibold">{pkg.commissionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">L2 Commission</span>
                      <span className="text-white font-semibold">{pkg.commissionLevel2 || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">L3 Commission</span>
                      <span className="text-white font-semibold">{pkg.commissionLevel3 || 0}%</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {(pkg.features || []).slice(0, 4).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <Check className={`w-3 h-3 flex-shrink-0 ${TIER_ACCENT[tier] || 'text-gray-400'}`} />
                        {f}
                      </li>
                    ))}
                    {(pkg.features?.length || 0) > 4 && (
                      <li className="text-xs text-gray-500">+{pkg.features.length - 4} more features</li>
                    )}
                  </ul>
                </div>
              )
            })}
            {packages.length === 0 && (
              <div className="col-span-4 text-center py-12 text-gray-500">Loading packages...</div>
            )}
          </div>
        </div>

        {/* Commission Matrix */}
        {packages.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-6">Commission Matrix</h2>
            <p className="text-gray-400 text-sm mb-4">L1 commission % earned by partner based on their package tier</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 pr-6 text-gray-400 font-medium">Partner Tier</th>
                    <th className="text-left pb-3 px-4 text-gray-400 font-medium">Price</th>
                    <th className="text-left pb-3 px-4 text-gray-400 font-medium">L1 Rate</th>
                    <th className="text-left pb-3 px-4 text-gray-400 font-medium">L2 Rate</th>
                    <th className="text-left pb-3 px-4 text-gray-400 font-medium">L3 Rate</th>
                    <th className="text-left pb-3 px-4 text-gray-400 font-medium">Max Earn (own tier)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {packages.map((pkg: any) => {
                    const tier = (pkg.tier || pkg.name || '').toLowerCase()
                    const maxEarn = Math.round((pkg.price || 0) * (pkg.commissionRate || 0) / 100)
                    return (
                      <tr key={pkg._id} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-6">
                          <span className={`badge ${TIER_ACCENT[tier] ? `${TIER_ACCENT[tier]} bg-current/10` : 'bg-gray-500/20 text-gray-400'} capitalize`} style={{ background: 'transparent' }}>
                            <span className={TIER_ACCENT[tier] || 'text-gray-400'}>{pkg.name}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">₹{(pkg.price || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">{pkg.commissionRate || 0}%</td>
                        <td className="py-3 px-4 text-blue-400 font-semibold">{pkg.commissionLevel2 || 0}%</td>
                        <td className="py-3 px-4 text-violet-400 font-semibold">{pkg.commissionLevel3 || 0}%</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">₹{maxEarn.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editPkg && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Edit {editPkg.name}</h3>
              <button onClick={() => setEditPkg(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Package Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Price (₹)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">L1 Commission %</label>
                  <input type="number" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">L2 Commission %</label>
                  <input type="number" value={form.commissionLevel2} onChange={e => setForm({ ...form, commissionLevel2: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">L3 Commission %</label>
                  <input type="number" value={form.commissionLevel3} onChange={e => setForm({ ...form, commissionLevel3: Number(e.target.value) })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Features (one per line)</label>
                <textarea
                  value={featuresInput}
                  onChange={e => setFeaturesInput(e.target.value)}
                  rows={6}
                  className="input resize-none"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={savePackage} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditPkg(null)} className="btn bg-slate-700 hover:bg-slate-600 text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
