'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { Search, UserCheck, UserX, Shield, GraduationCap, BookOpen, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

const ROLES = ['superadmin', 'admin', 'manager', 'mentor', 'student']
const TIERS = ['starter', 'pro', 'elite', 'supreme']

const roleColor = (r: string) => {
  const map: Record<string, string> = {
    superadmin: 'text-rose-400 bg-rose-500/20',
    admin: 'text-red-400 bg-red-500/20',
    manager: 'text-orange-400 bg-orange-500/20',
    mentor: 'text-blue-400 bg-blue-500/20',
    student: 'text-green-400 bg-green-500/20',
  }
  return map[r] || 'text-gray-400 bg-gray-500/20'
}

const tierColor = (t: string) => {
  const map: Record<string, string> = {
    starter: 'text-sky-400 bg-sky-500/20',
    pro: 'text-violet-400 bg-violet-500/20',
    elite: 'text-amber-400 bg-amber-500/20',
    supreme: 'text-rose-400 bg-rose-500/20',
  }
  return map[t] || 'text-gray-400 bg-gray-500/20'
}

export default function UsersPage() {
  const [role, setRole] = useState('')
  const [tier, setTier] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState('')

  const { data, refetch } = useQuery({
    queryKey: ['admin-users', role, tier, search, page],
    queryFn: () => adminAPI.users({ role: role || undefined, packageTier: tier || undefined, search: search || undefined, page, limit: 20 }).then(r => r.data),
    placeholderData: (prev: any) => prev
  })

  const toggleUser = async (id: string, name: string, isActive: boolean) => {
    setUpdatingId(id)
    try {
      await adminAPI.toggleUser(id)
      toast.success(`${name} ${isActive ? 'suspended' : 'activated'}`)
      refetch()
    } catch { toast.error('Action failed') } finally { setUpdatingId('') }
  }

  const changeRole = async (id: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(id, newRole)
      toast.success('Role updated')
      refetch()
    } catch { toast.error('Failed to update role') }
  }

  const changeTier = async (id: string, newTier: string) => {
    try {
      await adminAPI.updateUserPackage(id, newTier)
      toast.success('Package updated')
      refetch()
    } catch { toast.error('Failed to update package') }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-gray-400 text-sm mt-0.5">{data?.pagination?.total || 0} total users</p>
          </div>
          <span className="badge bg-violet-500/20 text-violet-400">{data?.pagination?.total || 0} users</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or email..." className="input pl-10" />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} className="input w-44">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <select value={tier} onChange={e => { setTier(e.target.value); setPage(1) }} className="input w-44">
            <option value="">All Tiers</option>
            {TIERS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">User</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Phone</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Package</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Affiliate</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-left px-5 py-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.users?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.avatar
                            ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                            : <span className="text-violet-400 font-bold text-xs">{user.name?.[0]?.toUpperCase()}</span>}
                        </div>
                        <div>
                          <p className="font-medium text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <select value={user.role} onChange={e => changeRole(user._id, e.target.value)}
                        className={`badge ${roleColor(user.role)} capitalize cursor-pointer bg-transparent border-0 outline-none text-xs`}>
                        {ROLES.map(r => <option key={r} value={r} className="bg-slate-800 text-white">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select value={user.packageTier || ''} onChange={e => changeTier(user._id, e.target.value)}
                        className={`badge ${tierColor(user.packageTier)} capitalize cursor-pointer bg-transparent border-0 outline-none text-xs`}>
                        <option value="" className="bg-slate-800 text-white">None</option>
                        {TIERS.map(t => <option key={t} value={t} className="bg-slate-800 text-white">{t}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{user.affiliateCode || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        disabled={updatingId === user._id}
                        onClick={() => toggleUser(user._id, user.name, user.isActive)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isActive
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'}`}>
                        {user.isActive
                          ? <><UserX className="w-3 h-3" />Suspend</>
                          : <><UserCheck className="w-3 h-3" />Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.users?.length) && (
              <div className="text-center py-12 text-gray-500">No users found</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(data.pagination.pages, 7) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-gray-400 hover:text-white'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}
              className="px-4 py-2 bg-slate-700 text-gray-400 hover:text-white rounded-xl text-sm disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
