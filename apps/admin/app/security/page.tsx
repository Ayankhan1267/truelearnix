'use client'
import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, Globe, Lock, RefreshCw } from 'lucide-react'

export default function SecurityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'logs'|'roles'|'settings'>('logs')

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.peptly.in/api'

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API}/admin/users?limit=20&sort=-lastLogin`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLogs(data.users || [])
    } catch {}
    finally { setLoading(false) }
  }

  const roles = [
    { role: 'superadmin', color: 'bg-red-500/20 text-red-400', perms: ['Full platform access', 'Delete anything', 'Manage admins', 'Finance control', 'Security settings'] },
    { role: 'admin', color: 'bg-orange-500/20 text-orange-400', perms: ['User management', 'Course approval', 'CRM access', 'Blog management', 'Support tickets'] },
    { role: 'manager', color: 'bg-yellow-500/20 text-yellow-400', perms: ['CRM leads', 'Support tickets', 'View analytics', 'Notifications'] },
    { role: 'mentor', color: 'bg-blue-500/20 text-blue-400', perms: ['Upload courses', 'Schedule classes', 'View own students', 'Own earnings'] },
    { role: 'student', color: 'bg-green-500/20 text-green-400', perms: ['View enrolled courses', 'Join classes', 'Community posts', 'Affiliate panel (if purchased)'] },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Shield className="w-8 h-8 text-violet-400" /> Security & Access</h1>
          <p className="text-gray-400 mt-1">Monitor platform security and manage role permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Sessions', value: logs.filter(u => u.isActive).length, icon: Globe, color: 'text-green-400' },
            { label: 'Suspended Users', value: logs.filter(u => !u.isActive).length, icon: Lock, color: 'text-red-400' },
            { label: 'Admin Roles', value: logs.filter(u => ['superadmin','admin','manager'].includes(u.role)).length, icon: Key, color: 'text-violet-400' },
            { label: 'Total Monitored', value: logs.length, icon: Eye, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {(['logs','roles','settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {tab === 'logs' ? 'Recent Logins' : tab === 'roles' ? 'Role Permissions' : 'Security Settings'}
            </button>
          ))}
        </div>

        {activeTab === 'logs' && (
          <div className="card overflow-hidden p-0">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent User Activity</h2>
              <button onClick={fetchLogs} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-white/5">
                {['User', 'Role', 'Status', 'Package', 'Last Login'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 px-4 py-3 font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((u: any) => (
                  <tr key={u._id} className="hover:bg-white/2">
                    <td className="px-4 py-3"><p className="text-sm text-white font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-400 rounded-full capitalize">{u.role}</span></td>
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                        : <span className="flex items-center gap-1 text-red-400 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Suspended</span>}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-300 capitalize">{u.packageTier || 'free'}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            {roles.map(r => (
              <div key={r.role} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${r.color}`}>{r.role}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.perms.map(p => (
                    <span key={p} className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle className="w-3 h-3 text-green-400" /> {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card space-y-5 max-w-xl">
            <h2 className="text-lg font-bold text-white">Security Configuration</h2>
            {[
              { label: 'JWT Expiry', value: '7 days', note: 'Access tokens expire after 7 days' },
              { label: 'OTP Expiry', value: '10 minutes', note: 'Email OTPs expire in 10 minutes' },
              { label: 'Rate Limiting', value: '200 req/15min', note: 'API rate limiter is active' },
              { label: 'Auth Rate Limit', value: '20 req/15min', note: 'Strict limit on auth endpoints' },
              { label: 'CORS Policy', value: 'Restricted', note: 'Only peptly.in origins allowed' },
              { label: 'Password Hashing', value: 'bcrypt (10 rounds)', note: 'Industry standard hashing' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/5">
                <div><p className="text-sm font-medium text-white">{s.label}</p><p className="text-xs text-gray-500">{s.note}</p></div>
                <span className="text-sm text-green-400 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
