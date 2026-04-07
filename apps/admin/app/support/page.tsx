'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { MessageSquare, X, Send, Clock } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    open: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-gray-500/20 text-gray-400',
  }
  return map[s] || 'bg-gray-500/20 text-gray-400'
}

const priorityColor = (p: string) => {
  const map: Record<string, string> = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-green-400',
  }
  return map[p] || 'text-gray-400'
}

export default function SupportPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: () => adminAPI.tickets({ status: statusFilter || undefined, limit: 50 }).then(r => r.data)
  })

  const tickets = data?.tickets || data?.data || []

  const openTicket = (ticket: any) => {
    setSelected(ticket)
    setNewStatus(ticket.status || 'open')
    setReply('')
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setUpdating(true)
    try {
      await adminAPI.updateTicket(selected._id, { reply, replyAction: 'add' })
      toast.success('Reply sent')
      setReply('')
      refetch()
      // Re-fetch selected ticket
      const updated = tickets.find((t: any) => t._id === selected._id)
      if (updated) setSelected({ ...updated, status: newStatus })
    } catch { toast.error('Failed to send reply') } finally { setUpdating(false) }
  }

  const updateStatus = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    try {
      await adminAPI.updateTicket(selected._id, { status: newStatus })
      toast.success('Status updated')
      refetch()
      setSelected({ ...selected, status: newStatus })
    } catch { toast.error('Failed to update') } finally { setUpdating(false) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
            <p className="text-gray-400 text-sm mt-0.5">{tickets.length} tickets</p>
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_OPTIONS.map(s => {
            const count = tickets.filter((t: any) => t.status === s).length
            return (
              <div key={s} className="card text-center cursor-pointer hover:border-violet-500/30 transition-colors" onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
                <p className={`text-xl font-black ${statusColor(s).split(' ')[1]}`}>{count}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{s.replace('_', ' ')}</p>
              </div>
            )
          })}
        </div>

        {/* Ticket list */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">User</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Subject</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Priority</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((ticket: any) => (
                  <tr key={ticket._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openTicket(ticket)}>
                    <td className="px-5 py-4">
                      <p className="text-white">{ticket.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{ticket.user?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white line-clamp-1 max-w-[250px]">{ticket.subject || ticket.title || '—'}</p>
                      {ticket.message && <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px]">{ticket.message}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold capitalize ${priorityColor(ticket.priority)}`}>
                        {ticket.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusColor(ticket.status)} capitalize`}>
                        {(ticket.status || 'open').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {ticket.createdAt ? format(new Date(ticket.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length === 0 && <div className="text-center py-12 text-gray-500">No support tickets</div>}
          </div>
        </div>
      </div>

      {/* Ticket Detail Side Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white">{selected.subject || selected.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selected.user?.name} &middot; {selected.createdAt ? format(new Date(selected.createdAt), 'dd MMM yyyy, hh:mm a') : ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white ml-4">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Original message */}
              {selected.message && (
                <div className="bg-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-300">{selected.user?.name}</span>
                    <span className="text-xs text-gray-500">
                      {selected.createdAt ? format(new Date(selected.createdAt), 'dd MMM, hh:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}

              {/* Replies */}
              {(selected.replies || selected.messages || []).map((msg: any, i: number) => (
                <div key={i} className={`rounded-xl p-4 ${msg.isAdmin || msg.role === 'admin' ? 'bg-violet-600/20 border border-violet-500/20 ml-4' : 'bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${msg.isAdmin || msg.role === 'admin' ? 'text-violet-400' : 'text-gray-300'}`}>
                      {msg.isAdmin || msg.role === 'admin' ? 'Admin' : (msg.user?.name || selected.user?.name || 'User')}
                    </span>
                    {msg.createdAt && (
                      <span className="text-xs text-gray-500">{format(new Date(msg.createdAt), 'dd MMM, hh:mm a')}</span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-gray-300">{msg.message || msg.text || msg.content}</p>
                </div>
              ))}
            </div>

            {/* Status + Reply */}
            <div className="p-5 border-t border-white/10 space-y-3">
              <div className="flex gap-2">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input flex-1 py-2 text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button onClick={updateStatus} disabled={updating}
                  className="btn bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-50">
                  Update
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="input flex-1 resize-none text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply()
                  }}
                />
                <button onClick={sendReply} disabled={updating || !reply.trim()}
                  className="btn-primary px-4 self-end disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Ctrl+Enter to send</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
