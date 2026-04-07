'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseAPI, mentorAPI } from '@/lib/api'
import { Plus, Trash2, Send, Loader2, BookOpen, Video, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function CourseEditor({ params }: { params: { id: string } }) {
  const { id } = params
  const qc = useQueryClient()
  const [addingLesson, setAddingLesson] = useState(false)
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', content: '', duration: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['course-editor', id],
    queryFn: () => courseAPI.getContent(id).then(r => r.data),
  })

  const submitMutation = useMutation({
    mutationFn: () => courseAPI.submit(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course-editor', id] }); toast.success('Submitted for review!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const addLessonMutation = useMutation({
    mutationFn: (data: any) => mentorAPI.addLesson(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-editor', id] })
      setLessonForm({ title: '', videoUrl: '', content: '', duration: '' })
      setAddingLesson(false)
      toast.success('Lesson added!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add lesson'),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => mentorAPI.deleteLesson(id, lessonId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course-editor', id] }); toast.success('Lesson removed') },
  })

  const handleAddLesson = () => {
    if (!lessonForm.title) return toast.error('Lesson title required')
    addLessonMutation.mutate({ ...lessonForm, duration: Number(lessonForm.duration) || 0 })
  }

  const course = data?.course
  const lessons: any[] = course?.lessons || []

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
  if (!course) return <p className="text-gray-400">Course not found.</p>

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLOR[course.status] || STATUS_COLOR.draft}`}>{course.status}</span>
            <span className="text-xs text-gray-400">{lessons.length} lessons</span>
          </div>
        </div>
        {course.status === 'draft' && (
          <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || lessons.length === 0}
            className="btn-primary flex items-center gap-2 flex-shrink-0">
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit for Review
          </button>
        )}
        {course.status === 'approved' && (
          <span className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" /> Approved & Published
          </span>
        )}
      </div>

      {course.status === 'rejected' && course.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          <p className="font-semibold mb-1">Rejection Reason:</p>
          <p>{course.rejectionReason}</p>
        </div>
      )}

      {/* Lessons */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Lessons ({lessons.length})</h2>
          {course.status !== 'approved' && (
            <button onClick={() => setAddingLesson(!addingLesson)} className="btn-outline flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Lesson
            </button>
          )}
        </div>

        {/* Add lesson form */}
        {addingLesson && (
          <div className="bg-dark-700 rounded-xl p-4 mb-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">New Lesson</h3>
            <input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))}
              className="input text-sm" placeholder="Lesson title *" />
            <input value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))}
              className="input text-sm" placeholder="Video URL (YouTube or direct)" />
            <textarea value={lessonForm.content} onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))}
              className="input text-sm min-h-[80px] resize-none" placeholder="Lesson notes / text content (optional)" />
            <input value={lessonForm.duration} onChange={e => setLessonForm(f => ({ ...f, duration: e.target.value }))}
              className="input text-sm" type="number" placeholder="Duration (minutes)" min="0" />
            <div className="flex gap-2">
              <button onClick={handleAddLesson} disabled={addLessonMutation.isPending} className="btn-primary text-sm flex items-center gap-2">
                {addLessonMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add
              </button>
              <button onClick={() => setAddingLesson(false)} className="btn-outline text-sm">Cancel</button>
            </div>
          </div>
        )}

        {lessons.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">No lessons yet. Add your first lesson to start building.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson: any, idx: number) => (
              <div key={lesson._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {lesson.videoUrl ? <Video className="w-4 h-4 text-primary-400" /> : <FileText className="w-4 h-4 text-primary-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{idx + 1}. {lesson.title}</p>
                  <p className="text-xs text-gray-500">{lesson.duration ? `${lesson.duration} min` : 'Reading'}</p>
                </div>
                {course.status !== 'approved' && (
                  <button onClick={() => deleteLessonMutation.mutate(lesson._id)} disabled={deleteLessonMutation.isPending}
                    className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Info (read only) */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Course Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Category</p><p className="text-white capitalize">{course.category}</p></div>
          <div><p className="text-gray-500">Level</p><p className="text-white capitalize">{course.level}</p></div>
          <div><p className="text-gray-500">Price</p><p className="text-white">₹{course.price?.toLocaleString()}</p></div>
          <div><p className="text-gray-500">Language</p><p className="text-white">{course.language}</p></div>
          <div><p className="text-gray-500">Enrollments</p><p className="text-white">{course.enrollmentCount || 0}</p></div>
          <div><p className="text-gray-500">Rating</p><p className="text-white">{course.rating?.toFixed(1) || 'N/A'}</p></div>
        </div>
      </div>
    </div>
  )
}
