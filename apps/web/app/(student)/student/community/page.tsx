'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { Heart, MessageSquare, Share2, Flame, Star, Zap, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function CommunityPage() {
  const { user } = useAuthStore()
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState<'post' | 'question' | 'achievement' | 'resource'>('post')
  const qc = useQueryClient()

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => api.get('/community/posts').then(r => r.data.posts).catch(() => []),
  })

  const createPost = useMutation({
    mutationFn: (data: any) => api.post('/community/posts', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['community-posts'] }); setPostContent(''); toast.success('Post shared!') },
    onError: () => toast.error('Could not post. Try again.')
  })

  const likePost = useMutation({
    mutationFn: (id: string) => api.post(`/community/posts/${id}/like`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-posts'] })
  })

  const handlePost = () => {
    if (!postContent.trim()) return
    createPost.mutate({ content: postContent, type: postType })
  }

  const userXP = (user as any)?.xpPoints || 0
  const userLevel = (user as any)?.level || 1
  const userStreak = (user as any)?.streak || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <p className="text-gray-400 mt-1">Connect, learn, and grow together</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Composer */}
          <div className="card space-y-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-400">
                {user?.name?.[0]}
              </div>
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                placeholder="Share something with the community..."
                rows={3}
                className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['post', 'question', 'achievement', 'resource'] as const).map(t => (
                  <button key={t} onClick={() => setPostType(t)}
                    className={`px-3 py-1 text-xs rounded-lg capitalize transition-all ${postType === t ? 'bg-primary-500/20 text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={handlePost} disabled={!postContent.trim() || createPost.isPending} className="btn-primary text-xs py-2 px-4">
                <Plus className="w-3 h-3" /> Post
              </button>
            </div>
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse bg-white/5" />)}</div>
          ) : (postsData || []).length === 0 ? (
            <div className="card text-center py-12">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            (postsData || []).map((post: any) => (
              <div key={post._id} className="card space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center font-bold text-primary-400 text-sm">
                    {post.author?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{post.author?.name}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full capitalize ${
                    post.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                    post.type === 'question' ? 'bg-blue-500/20 text-blue-400' :
                    post.type === 'resource' ? 'bg-green-500/20 text-green-400' :
                    'bg-white/5 text-gray-400'}`}>
                    {post.type}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 pt-1">
                  <button onClick={() => likePost.mutate(post._id)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" /> {post.likes?.length || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-400 transition-colors">
                    <MessageSquare className="w-4 h-4" /> {post.comments?.length || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-400 transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* My Stats */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> My Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">XP Points</span>
                <span className="font-bold text-yellow-400">{userXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Level</span>
                <span className="font-bold text-primary-400">Level {userLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Streak</span>
                <span className="font-bold text-orange-400 flex items-center gap-1"><Flame className="w-3 h-3" />{userStreak} days</span>
              </div>
            </div>
            {/* XP Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Level {userLevel}</span><span>Level {userLevel + 1}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${Math.min((userXP % 1000) / 10, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="card border border-yellow-500/20 bg-yellow-500/5">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> This Week's Challenge</h3>
            <p className="text-sm text-gray-300">Complete 3 lessons and share a key takeaway in the community.</p>
            <div className="mt-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '33%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">1 of 3 completed</p>
            </div>
            <p className="text-xs text-yellow-400 mt-2">🏆 Reward: 500 XP + Badge</p>
          </div>

          {/* Leaderboard preview */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">🏆 Top Learners</h3>
            <div className="space-y-2">
              {['Rahul S.', 'Priya K.', 'Amit T.', 'Sneha R.'].map((name, i) => (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span className="text-gray-300 flex-1">{name}</span>
                  <span className="text-xs text-yellow-400">{(4 - i) * 1250} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
