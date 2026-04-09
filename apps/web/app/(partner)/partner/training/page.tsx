'use client'
import { useQuery } from '@tanstack/react-query'
import { partnerAPI } from '@/lib/api'
import { GraduationCap, CheckCircle, Circle, Calendar, Video, ExternalLink, Clock, Lock } from 'lucide-react'

export default function TrainingPage() {
  const { data, isLoading } = useQuery({ queryKey: ['partner-training'], queryFn: () => partnerAPI.training().then(r => r.data) })

  if (isLoading) return (
    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}</div>
  )

  const curriculum = data?.curriculum || []
  const webinars = data?.webinars || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Training Program</h1>
        <p className="text-dark-400 text-sm mt-1">10-day partner training + upcoming webinars</p>
      </div>

      {/* Progress */}
      <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Your Progress</h3>
          <span className="text-violet-400 text-sm font-bold">Day 1 of 10</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: '10%' }} />
        </div>
        <p className="text-dark-400 text-xs mt-2">Complete each day to unlock the next module</p>
      </div>

      {/* 10-Day Curriculum */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-violet-400" />10-Day Partner Training</h3>
        {curriculum.map((day: any, i: number) => {
          const unlocked = i === 0
          return (
            <div key={day.day} className={`rounded-xl border ${unlocked ? 'bg-dark-800 border-dark-700 hover:border-violet-500/50' : 'bg-dark-800/50 border-dark-700/50'} overflow-hidden transition-all`}>
              <div className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${unlocked ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' : 'bg-dark-700 text-dark-400'}`}>
                  {unlocked ? day.day : <Lock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-dark-500'}`}>Day {day.day}: {day.title}</p>
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-1 ${unlocked ? 'text-dark-400' : 'text-dark-600'}`}>{day.description}</p>
                  {unlocked && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {day.topics?.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] bg-violet-900/30 text-violet-400 border border-violet-700/30 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                {unlocked && (
                  <button className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-all flex-shrink-0">
                    Start
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Webinars */}
      {webinars.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2"><Video className="w-4 h-4 text-blue-400" />Upcoming Webinars</h3>
          {webinars.map((w: any) => (
            <div key={w._id} className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700/40 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{w.title}</p>
                  <p className="text-dark-400 text-xs mt-1 line-clamp-2">{w.description || w.message}</p>
                  {(w.startDate || w.ctaUrl) && (
                    <div className="flex items-center gap-3 mt-2">
                      {w.startDate && (
                        <span className="flex items-center gap-1 text-xs text-dark-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(w.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {w.ctaUrl && (
                        <a href={w.ctaUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          Join <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-5">
        <h3 className="text-white font-semibold mb-3">Partner Success Tips</h3>
        <div className="space-y-2">
          {[
            'Complete all 10 training days to unlock bonus commission rates',
            'Follow up with leads within 24 hours for best conversion',
            'Share your affiliate link on WhatsApp, Instagram, and LinkedIn',
            'Use the Link Generator to create targeted landing pages',
            'Track your leads in CRM to never miss a follow-up',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-dark-300 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
