'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Trophy, Crown, Medal, Star, Coins } from 'lucide-react'

const tierColors: Record<string, string> = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  elite: 'from-amber-500 to-orange-500',
  supreme: 'from-rose-500 to-pink-600',
}

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['partner-leaderboard'], queryFn: () => partnerAPI.leaderboard().then(r => r.data) })

  const leaderboard = data?.leaderboard || []
  const myRank = data?.myRank

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />
    return <span className="text-dark-400 text-sm font-bold w-5 text-center">#{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Leaderboard</h1>
        <p className="text-dark-400 text-sm mt-1">Top earners in the TruLearnix Partner Network</p>
      </div>

      {/* My Rank Card */}
      {myRank && (
        <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            #{myRank.rank}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">Your Position</p>
            <p className="text-dark-400 text-sm">₹{(myRank.totalEarnings || 0).toLocaleString()} total earnings</p>
          </div>
          <div className="text-right">
            <p className="text-violet-400 text-xs">Out of {leaderboard.length}+ partners</p>
            <p className="text-dark-400 text-xs mt-1">{myRank.totalReferrals || 0} referrals</p>
          </div>
        </div>
      )}

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-3">
        {leaderboard.slice(0, 3).map((p: any, i: number) => {
          const podiumOrder = [1, 0, 2]
          const entry = leaderboard[podiumOrder[i]]
          const rank = podiumOrder[i] + 1
          const heights = ['h-24', 'h-32', 'h-20']
          const crowns = ['🥈', '🥇', '🥉']
          return (
            <div key={entry?._id} className={`flex flex-col items-center justify-end ${heights[i]} bg-dark-800 rounded-2xl border border-dark-700 p-3`}>
              <div className="text-2xl mb-1">{crowns[i]}</div>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierColors[entry?.packageTier || 'free']} flex items-center justify-center text-white font-bold text-sm mb-1`}>
                {entry?.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-white text-xs font-semibold text-center truncate w-full">{entry?.name?.split(' ')[0]}</p>
              <p className="text-green-400 text-xs font-bold">₹{(entry?.totalEarnings / 1000).toFixed(1)}k</p>
            </div>
          )
        })}
      </div>

      {/* Full List */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="p-4 border-b border-dark-700 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-semibold">All Rankings</h3>
        </div>
        <div className="divide-y divide-dark-700">
          {leaderboard.map((p: any, i: number) => {
            const isMe = p._id === (user as any)?._id || p._id === user?.id
            return (
              <div key={p._id} className={`flex items-center gap-3 px-4 py-3 transition-all ${isMe ? 'bg-violet-900/20 border-l-2 border-violet-500' : 'hover:bg-dark-700'}`}>
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  <RankIcon rank={i + 1} />
                </div>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierColors[p.packageTier || 'free']} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
                    {p.name} {isMe && <span className="text-xs text-violet-400">(You)</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-dark-400 text-xs">{p.totalReferrals || 0} referrals</span>
                    <span className="text-dark-600">·</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${tierColors[p.packageTier || 'free']} text-white font-medium capitalize`}>{p.packageTier}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-400 text-sm font-bold">₹{(p.totalEarnings || 0).toLocaleString()}</p>
                  <p className="text-dark-500 text-xs">earned</p>
                </div>
              </div>
            )
          })}
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-dark-500">No leaderboard data yet</div>
        )}
      </div>
    </div>
  )
}
