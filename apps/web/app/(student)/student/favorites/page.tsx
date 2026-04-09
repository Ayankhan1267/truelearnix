'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { Heart, BookOpen, Play, Star, Clock, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

function FavoriteCard({ course }: { course: any }) {
  const qc = useQueryClient()
  const removeMutation = useMutation({
    mutationFn: () => userAPI.toggleFavorite(course._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] })
  })

  return (
    <div className="group rounded-2xl bg-dark-800 border border-white/5 hover:border-rose-500/20 overflow-hidden flex flex-col transition-all">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {course.thumbnail
          ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-700" /></div>
        }
        {/* Remove favorite btn */}
        <button
          onClick={e => { e.preventDefault(); removeMutation.mutate() }}
          disabled={removeMutation.isPending}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-rose-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 disabled:opacity-50"
        >
          <Heart className="w-4 h-4 text-white fill-white" />
        </button>
        {/* Rating */}
        {course.rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-white font-medium">{course.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1 group-hover:text-rose-300 transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.level || 'Beginner'}</span>
          {course.enrolledCount > 0 && (
            <span>{course.enrolledCount.toLocaleString('en-IN')} enrolled</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Link
            href={`/courses/${course.slug || course._id}`}
            className="flex-1 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-xs font-semibold text-center hover:bg-indigo-500/25 transition-all"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => userAPI.favorites().then(r => r.data.favorites)
  })

  const filtered = (data || []).filter((c: any) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            Favorites
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 ml-12">
            {data?.length || 0} saved course{(data?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative max-w-xs w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search favorites..."
            className="w-full bg-dark-800 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-dark-800 border border-white/5 h-64 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-rose-400/50" />
          </div>
          <p className="text-white font-medium">
            {search ? 'No matches found' : 'No favorites yet'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {search ? 'Try a different search.' : 'Browse courses and tap the ❤️ to save them here.'}
          </p>
          {!search && (
            <Link href="/courses" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-rose-500/15 text-rose-300 text-sm font-medium hover:bg-rose-500/25 transition-all">
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course: any) => (
            <FavoriteCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Tip */}
      {!isLoading && (data?.length || 0) > 0 && (
        <p className="text-xs text-gray-600 text-center">
          Hover on a card and click ❤️ to remove from favorites
        </p>
      )}
    </div>
  )
}
