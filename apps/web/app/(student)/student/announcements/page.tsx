'use client'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { Megaphone, ExternalLink, Calendar, Sparkles, Bell } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

function AnnouncementCard({ a }: { a: any }) {
  const isNew = new Date(a.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  return (
    <div className="rounded-2xl bg-dark-800 border border-white/5 hover:border-indigo-500/20 overflow-hidden transition-all">
      {a.image && (
        <div className="relative aspect-[16/5] overflow-hidden">
          <img src={a.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-4 h-4 text-indigo-400" />
            </div>
            {isNew && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                NEW
              </span>
            )}
            {a.priority > 5 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/20">
                IMPORTANT
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 flex items-center gap-1 flex-shrink-0">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
          </p>
        </div>

        <h3 className="font-bold text-white text-sm sm:text-base">{a.title}</h3>
        {a.description && (
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">{a.description}</p>
        )}

        {a.ctaText && a.ctaLink && (
          <a
            href={a.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all border border-indigo-500/20"
          >
            {a.ctaText}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => userAPI.announcements().then(r => r.data)
  })

  const announcements = data?.announcements || []

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            Announcements
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 ml-12">
            {announcements.length} active announcement{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-dark-800 border border-white/5 h-32 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-indigo-400/50" />
          </div>
          <p className="text-white font-medium">No announcements yet</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for updates from the team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <AnnouncementCard key={a._id} a={a} />
          ))}
        </div>
      )}
    </div>
  )
}
