'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { Users, Plus, Search, Phone, Mail, Calendar, Tag, X, ChevronDown } from 'lucide-react'

const statusColors: Record<string, string> = {
  new: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
  contacted: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
  interested: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
  converted: 'bg-green-900/30 text-green-400 border-green-700/50',
  lost: 'bg-red-900/30 text-red-400 border-red-700/50',
}

export default function CRMPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', status: 'new', source: 'manual' })

  const { data, isLoading } = useQuery({ queryKey: ['partner-crm', statusFilter], queryFn: () => partnerAPI.crm({ status: statusFilter !== 'all' ? statusFilter : undefined }).then(r => r.data) })

  const addLead = useMutation({
    mutationFn: (data: any) => partnerAPI.addLead(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-crm'] }); setShowAdd(false); setForm({ name: '', phone: '', email: '', notes: '', status: 'new', source: 'manual' }) }
  })

  const leads = (data?.leads || []).filter((l: any) =>
    !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search)
  )

  const statusCounts = data?.statusCounts || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">CRM</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your leads and follow-ups</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['new', 'contacted', 'interested', 'converted', 'lost'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`p-3 rounded-xl border text-center transition-all ${statusFilter === s ? statusColors[s] : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500'}`}>
            <p className="text-lg font-bold text-white">{statusCounts[s] || 0}</p>
            <p className="text-xs capitalize">{s}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm" />
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-2xl border border-dark-700">
          <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400 font-medium">No leads found</p>
          <p className="text-dark-500 text-sm mt-1">Add your first lead manually or via affiliate link</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: any) => (
            <div key={lead._id} className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-500 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {lead.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">{lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[lead.status] || statusColors.new}`}>{lead.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-dark-400">
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                    {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{lead.source || 'manual'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {lead.notes && <p className="text-dark-500 text-xs mt-2 line-clamp-2">{lead.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Add New Lead</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Name *', placeholder: 'Full name' },
                { key: 'phone', label: 'Phone', placeholder: '+91 XXXXX XXXXX' },
                { key: 'email', label: 'Email', placeholder: 'email@example.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-dark-300 text-xs mb-1.5 block">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-dark-300 text-xs mb-1.5 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about this lead..."
                  rows={3}
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-violet-500 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-all text-sm">Cancel</button>
              <button onClick={() => addLead.mutate(form)} disabled={!form.name || addLead.isPending}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-sm disabled:opacity-50">
                {addLead.isPending ? 'Adding...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
