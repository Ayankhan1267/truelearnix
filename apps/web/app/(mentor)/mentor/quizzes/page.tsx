'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizAPI, courseAPI } from '@/lib/api'
import { Plus, Trash2, Loader2, FileQuestion, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyQ = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' })

export default function MentorQuizzes() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [quizForm, setQuizForm] = useState({ title: '', courseId: '', questions: [emptyQ()] })

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['mentor-quizzes'],
    queryFn: () => quizAPI.create({ _getAll: true }).catch(() => ({ data: { quizzes: [] } })).then(r => r.data?.quizzes || []),
  })
  const { data: courses } = useQuery({
    queryKey: ['mentor-courses'],
    queryFn: () => courseAPI.myMentorCourses().then(r => r.data.courses),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => quizAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentor-quizzes'] })
      setShowCreate(false)
      setQuizForm({ title: '', courseId: '', questions: [emptyQ()] })
      toast.success('Quiz created!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const addQ = () => setQuizForm(f => ({ ...f, questions: [...f.questions, emptyQ()] }))
  const removeQ = (idx: number) => setQuizForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }))
  const setQ = (idx: number, key: string, val: any) => setQuizForm(f => ({
    ...f, questions: f.questions.map((q, i) => i === idx ? { ...q, [key]: val } : q)
  }))
  const setOpt = (qi: number, oi: number, val: string) => setQuizForm(f => ({
    ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o: string, j: number) => j === oi ? val : o) } : q)
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>
          <p className="text-gray-400 mt-1">Create and manage course quizzes</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-5">
          <h2 className="text-lg font-bold text-white">New Quiz</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quiz Title *</label>
              <input value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Module 1 Quiz" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Course</label>
              <select value={quizForm.courseId} onChange={e => setQuizForm(f => ({ ...f, courseId: e.target.value }))} className="input">
                <option value="">— Select Course —</option>
                {courses?.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Questions ({quizForm.questions.length})</h3>
              <button onClick={addQ} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            {quizForm.questions.map((q, qi) => (
              <div key={qi} className="bg-dark-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Question {qi + 1}</span>
                  {quizForm.questions.length > 1 && (
                    <button onClick={() => removeQ(qi)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input value={q.question} onChange={e => setQ(qi, 'question', e.target.value)}
                  className="input text-sm" placeholder="Question text" />
                <div className="space-y-2">
                  {q.options.map((opt: string, oi: number) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button onClick={() => setQ(qi, 'correctAnswer', oi)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${q.correctAnswer === oi ? 'border-green-400 bg-green-400' : 'border-gray-500'}`} />
                      <input value={opt} onChange={e => setOpt(qi, oi, e.target.value)}
                        className="input text-sm flex-1" placeholder={`Option ${oi + 1}`} />
                    </div>
                  ))}
                </div>
                <input value={q.explanation} onChange={e => setQ(qi, 'explanation', e.target.value)}
                  className="input text-sm" placeholder="Explanation (optional)" />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(quizForm)} disabled={createMutation.isPending || !quizForm.title}
              className="btn-primary flex items-center gap-2">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileQuestion className="w-4 h-4" />}
              Create Quiz
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
      ) : !quizzes?.length ? (
        <div className="card text-center py-16">
          <FileQuestion className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No quizzes yet. Create your first quiz!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz: any) => (
            <div key={quiz._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{quiz.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{quiz.course?.title} • {quiz.questions?.length || 0} questions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
