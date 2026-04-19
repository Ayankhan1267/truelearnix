'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import { Download, Video, Search, RefreshCw, Calendar, Clock, User, BookOpen, PlayCircle, FileVideo, Cloud, HardDrive } from 'lucide-react'
import { format } from 'date-fns'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.trulearnix.com').replace(/\/api$/, '')

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'class', label: 'Classes' },
  { key: 'webinar', label: 'Webinars' },
  { key: 'workshop', label: 'Workshops' },
]

export default function RecordingsPage() {
  const [search, setSearch] = useState('')
  const [typeTab, setTypeTab] = useState('all')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-recordings'],
    queryFn: () => adminAPI.getRecordings({ limit: 200 }).then(r => r.data),
  })

  const recordings: any[] = (data?.recordings || []).filter((r: any) => {
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.mentor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.course?.title?.toLowerCase().includes(search.toLowerCase())

    const matchType =
      typeTab === 'all' ? true :
      typeTab === 'class' ? r._recordingType === 'class' :
      typeTab === 'webinar' ? (r._recordingType === 'webinar' && r.type !== 'workshop') :
      typeTab === 'workshop' ? (r._recordingType === 'webinar' && r.type === 'workshop') :
      true

    return matchSearch && matchType
  })

  const totalSize = recordings.reduce((s, r) => s + (r.recordingSize || 0), 0)
  const r2Count = recordings.filter(r => r.recordingUrl?.startsWith('http')).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <PlayCircle className="w-7 h-7 text-violet-400" />
              Recordings
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
              {totalSize > 0 && ` · ${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`}
              {r2Count > 0 && <span className="text-emerald-400 ml-2">· {r2Count} on R2 Cloud</span>}
            </p>
          </div>
          <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by class, mentor, course..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-colors" />
          </div>

          {/* Type tabs */}
          <div className="flex gap-1 bg-slate-800/60 border border-white/10 rounded-xl p-1">
            {TYPE_TABS.map(t => (
              <button key={t.key} onClick={() => setTypeTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeTab === t.key ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-20">
              <FileVideo className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No recordings yet</p>
              <p className="text-gray-600 text-sm mt-1">Recordings will appear here after live classes end</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-700/30">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Title</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Mentor</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide hidden xl:table-cell">Duration</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Size</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Storage</th>
                    <th className="text-left px-5 py-4 text-gray-400 font-medium text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recordings.map((rec: any) => {
                    const isR2 = rec.recordingUrl?.startsWith('http')
                    const fileUrl = isR2 ? rec.recordingUrl : `${API_BASE}${rec.recordingUrl}`
                    const sizeMB = rec.recordingSize ? (rec.recordingSize / (1024 * 1024)).toFixed(1) : null
                    const recType = rec._recordingType === 'webinar'
                      ? (rec.type === 'workshop' ? 'workshop' : 'webinar')
                      : 'class'

                    return (
                      <tr key={rec._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              recType === 'workshop' ? 'bg-orange-500/20' :
                              recType === 'webinar' ? 'bg-amber-500/20' :
                              'bg-violet-500/20'
                            }`}>
                              <Video className={`w-5 h-5 ${
                                recType === 'workshop' ? 'text-orange-400' :
                                recType === 'webinar' ? 'text-amber-400' :
                                'text-violet-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm leading-tight max-w-[200px] truncate">{rec.title}</p>
                              {recType === 'workshop' ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">Workshop</span>
                              ) : recType === 'webinar' ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Webinar</span>
                              ) : rec.course?.title ? (
                                <p className="text-violet-400/70 text-xs mt-0.5 flex items-center gap-1 truncate max-w-[200px]">
                                  <BookOpen className="w-3 h-3 flex-shrink-0" /> {rec.course.title}
                                </p>
                              ) : (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">Class</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {rec.mentor?.avatar
                                ? <img src={rec.mentor.avatar} className="w-full h-full object-cover" alt="" />
                                : <User className="w-3.5 h-3.5 text-gray-400" />}
                            </div>
                            <span className="text-gray-300 text-xs">{rec.mentor?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <p className="text-gray-300 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            {rec.endedAt ? format(new Date(rec.endedAt), 'dd MMM yyyy') : '—'}
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.endedAt ? format(new Date(rec.endedAt), 'hh:mm a') : ''}
                          </p>
                        </td>
                        <td className="px-5 py-4 hidden xl:table-cell">
                          <span className="text-gray-400 text-xs">{rec.duration} min</span>
                        </td>
                        <td className="px-5 py-4">
                          {sizeMB ? (
                            <span className="text-gray-400 text-xs">{sizeMB} MB</span>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isR2 ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <Cloud className="w-3.5 h-3.5" /> R2 Cloud
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <HardDrive className="w-3.5 h-3.5" /> Local
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                              <PlayCircle className="w-3.5 h-3.5" /> Watch
                            </a>
                            <a href={fileUrl} download
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
