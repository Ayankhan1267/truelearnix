'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, X, GripVertical, AlertCircle, Clock, CheckCircle2, Eye } from 'lucide-react'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-gray-500', bg: 'bg-gray-500/10' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { id: 'review', label: 'Review', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'done', label: 'Done', color: 'border-green-500', bg: 'bg-green-500/10' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400 bg-gray-500/20',
  medium: 'text-blue-400 bg-blue-500/20',
  high: 'text-orange-400 bg-orange-500/20',
  urgent: 'text-red-400 bg-red-500/20',
}

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate?: string
  tags: string[]
  assignedTo?: { name: string; avatar?: string }
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' })
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const res = await adminAPI.tasks()
      setTasks(res.data.data || [])
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  const createTask = async () => {
    if (!newTask.title) return toast.error('Title required')
    try {
      await adminAPI.createTask(newTask)
      toast.success('Task created')
      setShowNew(false)
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' })
      fetchTasks()
    } catch { toast.error('Failed to create task') }
  }

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      await adminAPI.updateTask(taskId, { status: newStatus })
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    } catch { toast.error('Failed to move task') }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await adminAPI.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t._id !== taskId))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete task') }
  }

  const getColTasks = (colId: string) => tasks.filter(t => t.status === colId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
            <p className="text-gray-400 text-sm mt-1">{tasks.length} tasks across all columns</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {showNew && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold">New Task</h2>
                <button onClick={() => setShowNew(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="Task title" className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 outline-none focus:border-violet-500" />
              <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)" rows={3}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 outline-none focus:border-violet-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 text-sm border border-white/10 outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Column</label>
                  <select value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 text-sm border border-white/10 outline-none">
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 outline-none" />
              <div className="flex gap-3">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5">Cancel</button>
                <button onClick={createTask} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">Create</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map(col => (
              <div key={col.id}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (dragging) moveTask(dragging, col.id) }}
                className={`rounded-2xl border ${col.color} ${col.bg} p-4 min-h-[400px]`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">{col.label}</h3>
                  <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{getColTasks(col.id).length}</span>
                </div>
                <div className="space-y-3">
                  {getColTasks(col.id).map(task => (
                    <div key={task._id}
                      draggable
                      onDragStart={() => setDragging(task._id)}
                      onDragEnd={() => setDragging(null)}
                      className="bg-slate-800 rounded-xl p-3 border border-white/5 cursor-grab hover:border-violet-500/30 transition-colors group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white text-sm font-medium leading-snug">{task.title}</p>
                        <button onClick={() => deleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {task.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.tags.map(tag => <span key={tag} className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">{tag}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                  {getColTasks(col.id).length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-sm">Drop tasks here</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
