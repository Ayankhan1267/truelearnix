'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { Search, X, Phone, Mail, Clock, MessageSquare, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const SOURCES = ['website', 'referral', 'social', 'ads', 'other']

const stageColor = (s: string) => {
  const map: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-cyan-500/20 text-cyan-400',
    qualified: 'bg-violet-500/20 text-violet-400',
    proposal: 'bg-amber-500/20 text-amber-400',
    negotiation: 'bg-orange-500/20 text-orange-400',
    won: 'bg-green-500/20 text-green-400',
    lost: 'bg-red-500/20 text-red-400',
  }
  return map[s] || 'bg-gray-500/20 text-gray-400'
}

const scoreColor = (score: number) => {
  if (score >= 70) return 'text-red-400 bg-red-500/20'
  if (score >= 40) return 'text-amber-400 bg-amber-500/20'
  return 'text-blue-400 bg-blue-500/20'
}
const scoreLabel = (score: number) => score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold'

export default function CRMPage() {
  const qc = useQueryClient()
  const [stage, setStage] = useState('')
  const [source, setSource] = useState('')
  const [scoreFilter, setScoreFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [detailData, setDetailData] = useState<any>(null)
  const [note, setNote] = useState('')
  const [newStage, setNewStage] = useState('')
  const [updating, setUpdating] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: () => adminAPI.crmStats().then(r => r.data)
  })

  const { data, refetch } = useQuery({
    queryKey: ['crm-leads', stage, source, scoreFilter, search],
    queryFn: () => adminAPI.leads({
      stage: stage || undefined,
      source: source || undefined,
      score: scoreFilter || undefined,
      search: search || undefined,
      limit: 50
    }).then(r => r.data)
  })

  const openLead = async (lead: any) => {
    setSelectedLead(lead)
    setNewStage(lead.stage || 'new')
    try {
      const res = await adminAPI.getLead(lead._id)
      setDetailData(res.data)
    } catch {
      setDetailData(lead)
    }
  }

  const updateStage = async () => {
    if (!selectedLead || !newStage) return
    setUpdating(true)
    try {
      await adminAPI.updateLead(selectedLead._id, { stage: newStage })
      toast.success('Stage updated')
      refetch()
      setSelectedLead({ ...selectedLead, stage: newStage })
    } catch { toast.error('Failed') } finally { setUpdating(false) }
  }

  const addNote = async () => {
    if (!note.trim() || !selectedLead) return
    setUpdating(true)
    try {
      await adminAPI.updateLead(selectedLead._id, { note, noteAction: 'add' })
      toast.success('Note added')
      setNote('')
      const res = await adminAPI.getLead(selectedLead._id)
      setDetailData(res.data)
    } catch { toast.error('Failed to add note') } finally { setUpdating(false) }
  }

  const leads = data?.leads || data?.data || []
  const stagesStats = stats?.stages || []
  const conversionRate = stats?.conversionRate || 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-black text-white">{stats?.totalLeads || leads.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total Leads</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-red-400">{stats?.hotLeads || leads.filter((l: any) => (l.score || l.aiScore || 0) >= 70).length}</p>
            <p className="text-xs text-gray-400 mt-1">Hot Leads</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-green-400">{conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">Conversion Rate</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black text-violet-400">{stats?.thisMonth || 0}</p>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="input pl-10" />
          </div>
          <select value={stage} onChange={e => setStage(e.target.value)} className="input w-40">
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={source} onChange={e => setSource(e.target.value)} className="input w-40">
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)} className="input w-36">
            <option value="">All Scores</option>
            <option value="hot">Hot (70+)</option>
            <option value="warm">Warm (40-69)</option>
            <option value="cold">Cold (&lt;40)</option>
          </select>
        </div>

        {/* Lead table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Stage</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">AI Score</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Source</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Assigned To</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Last Contact</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead: any) => {
                  const score = lead.aiScore || lead.score || 0
                  return (
                    <tr key={lead._id} className="hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <td className="px-5 py-4" onClick={() => openLead(lead)}>
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-300 text-xs">{lead.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${stageColor(lead.stage)} capitalize`}>{lead.stage || 'new'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${scoreColor(score)}`}>
                          {score} · {scoreLabel(score)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs capitalize">{lead.source || '—'}</td>
                      <td className="px-5 py-4 text-gray-300 text-xs">{lead.assignedTo?.name || '—'}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {lead.lastContact ? format(new Date(lead.lastContact), 'dd MMM') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => openLead(lead)}
                          className="p-1.5 hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {leads.length === 0 && <div className="text-center py-12 text-gray-500">No leads found</div>}
          </div>
        </div>
      </div>

      {/* Lead Detail Side Panel */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-white/10 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {selectedLead.email || '—'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {selectedLead.phone || '—'}
                </div>
                {selectedLead.lastContact && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Last contact: {format(new Date(selectedLead.lastContact), 'dd MMM yyyy')}
                  </div>
                )}
              </div>

              {/* Current stage + score */}
              <div className="flex gap-3 mb-6">
                <span className={`badge ${stageColor(selectedLead.stage)} capitalize`}>{selectedLead.stage || 'new'}</span>
                <span className={`badge ${scoreColor(selectedLead.aiScore || selectedLead.score || 0)}`}>
                  Score: {selectedLead.aiScore || selectedLead.score || 0}
                </span>
              </div>

              {/* Stage update */}
              <div className="card mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Update Stage</p>
                <div className="flex gap-2">
                  <select value={newStage} onChange={e => setNewStage(e.target.value)} className="input flex-1 py-2">
                    {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                  <button onClick={updateStage} disabled={updating}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                    Update
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="card mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Notes
                </p>
                <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                  {(detailData?.notes || detailData?.lead?.notes || []).map((n: any, i: number) => (
                    <div key={i} className="bg-slate-700/40 rounded-xl p-3">
                      <p className="text-white text-sm">{n.text || n.content || n}</p>
                      {n.createdAt && <p className="text-gray-500 text-xs mt-1">{format(new Date(n.createdAt), 'dd MMM yyyy, hh:mm a')}</p>}
                    </div>
                  ))}
                  {!(detailData?.notes || detailData?.lead?.notes || []).length && (
                    <p className="text-gray-500 text-sm text-center py-2">No notes yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Add a note..." className="input flex-1 py-2 text-sm"
                    onKeyDown={e => e.key === 'Enter' && addNote()} />
                  <button onClick={addNote} disabled={updating || !note.trim()}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                    Add
                  </button>
                </div>
              </div>

              {/* Follow-ups */}
              {(detailData?.followUps || detailData?.lead?.followUps || []).length > 0 && (
                <div className="card">
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Follow-ups</p>
                  <div className="space-y-2">
                    {(detailData?.followUps || detailData?.lead?.followUps || []).map((fu: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-700/30 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-gray-300">{fu.text || fu.note || fu}</span>
                        {fu.date && <span className="text-gray-500 text-xs ml-auto">{format(new Date(fu.date), 'dd MMM')}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
