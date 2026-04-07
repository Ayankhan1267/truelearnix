'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseAPI, certAPI } from '@/lib/api'
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, FileText, Award, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function CoursePlayer({ params }: { params: { id: string } }) {
  const { id } = params
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['course-content', id],
    queryFn: () => courseAPI.getContent(id).then(r => r.data),
  })

  const markMutation = useMutation({
    mutationFn: (lessonId: string) => courseAPI.markLesson(id, lessonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-content', id] }),
  })

  const course = data?.course
  const lessons: any[] = course?.lessons || []
  const activeLesson = lessons[activeLessonIdx]
  const completedIds: string[] = data?.completedLessons || []
  const progressPercent = lessons.length > 0 ? Math.round((completedIds.length / lessons.length) * 100) : 0
  const allDone = lessons.length > 0 && completedIds.length >= lessons.length

  const claimCertificate = async () => {
    try {
      setClaiming(true)
      await certAPI.claim(id)
      setClaimed(true)
    } catch {}
    finally { setClaiming(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
    </div>
  )

  if (!course) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Course not found or you are not enrolled.</p>
      <Link href="/student/courses" className="btn-primary mt-4 inline-block">Back to Courses</Link>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0">
      {/* Lesson Sidebar */}
      <aside className="w-72 bg-dark-800 border-r border-white/5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <Link href="/student/courses" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <h2 className="text-sm font-bold text-white line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span><span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {lessons.map((lesson: any, idx: number) => {
            const done = completedIds.includes(lesson._id)
            const active = idx === activeLessonIdx
            return (
              <button key={lesson._id} onClick={() => setActiveLessonIdx(idx)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${active ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5'}`}>
                <div className="mt-0.5 flex-shrink-0">
                  {done ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${active ? 'text-primary-400' : done ? 'text-gray-300' : 'text-gray-400'}`}>
                    {idx + 1}. {lesson.title}
                  </p>
                  {lesson.duration > 0 && (
                    <p className="text-[10px] text-gray-500 mt-0.5">{lesson.duration} min</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeLesson ? (
          <>
            {/* Video or Content */}
            <div className="flex-1 overflow-y-auto">
              {activeLesson.videoUrl ? (
                <div className="bg-black aspect-video w-full max-h-[50vh]">
                  {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  ) : (
                    <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                  )}
                </div>
              ) : (
                <div className="p-8 flex items-center justify-center bg-dark-800 min-h-48">
                  <div className="text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm">Reading lesson</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h1 className="text-xl font-bold text-white mb-4">{activeLesson.title}</h1>
                {activeLesson.content && (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-white/5 bg-dark-800 flex items-center justify-between gap-4">
              <button onClick={() => setActiveLessonIdx(i => Math.max(0, i - 1))} disabled={activeLessonIdx === 0}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-3">
                {!completedIds.includes(activeLesson._id) ? (
                  <button onClick={() => markMutation.mutate(activeLesson._id)} disabled={markMutation.isPending}
                    className="btn-primary flex items-center gap-2 text-sm">
                    {markMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Mark Complete
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}

                {allDone && (
                  <button onClick={claimCertificate} disabled={claiming || claimed}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-dark-900 font-bold text-sm px-4 py-2 rounded-xl">
                    {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    {claimed ? 'Certificate Claimed!' : 'Claim Certificate'}
                  </button>
                )}
              </div>

              <button onClick={() => setActiveLessonIdx(i => Math.min(lessons.length - 1, i + 1))} disabled={activeLessonIdx === lessons.length - 1}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white disabled:opacity-30">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Select a lesson to start learning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
