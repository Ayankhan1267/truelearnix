'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import { ChevronLeft, ChevronRight, Video, Bell, CalendarDays } from 'lucide-react'

interface CalEvent {
  id: string
  title: string
  date: string
  type: 'class' | 'reminder'
  status?: string
  time?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [month, year])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const [classRes, reminderRes] = await Promise.all([
        adminAPI.allClasses({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        adminAPI.reminders().catch(() => ({ data: { data: [] } })),
      ])
      const classEvents: CalEvent[] = (classRes.data.data || []).map((c: any) => ({
        id: c._id, title: c.title, date: c.scheduledAt?.split('T')[0] || '', type: 'class', status: c.status,
        time: c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      }))
      const reminderEvents: CalEvent[] = (reminderRes.data.data || []).map((r: any) => ({
        id: r._id, title: r.title, date: r.scheduledAt?.split('T')[0] || '', type: 'reminder', status: r.status,
        time: r.scheduledAt ? new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      }))
      setEvents([...classEvents, ...reminderEvents])
    } catch { }
    finally { setLoading(false) }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const selectedEvents = selected ? eventsOnDay(selected) : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-gray-400 text-sm mt-1">Live classes & scheduled reminders</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-blue-400" /> Class</span>
              <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5 text-yellow-400" /> Reminder</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-3 bg-slate-800 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prev} className="p-2 hover:bg-white/10 rounded-xl text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-white font-bold text-lg">{MONTHS[month]} {year}</h2>
              <button onClick={next} className="p-2 hover:bg-white/10 rounded-xl text-gray-400"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = eventsOnDay(day)
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
                const isSelected = selected === day
                return (
                  <button key={day} onClick={() => setSelected(isSelected ? null : day)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors
                      ${isToday ? 'bg-violet-600 text-white font-bold' : ''}
                      ${isSelected && !isToday ? 'bg-violet-600/30 text-violet-300' : ''}
                      ${!isToday && !isSelected ? 'text-gray-300 hover:bg-white/5' : ''}`}>
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div key={idx} className={`w-1 h-1 rounded-full ${e.type === 'class' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-white/5">
            {selected ? (
              <>
                <h3 className="text-white font-semibold mb-4">
                  {MONTHS[month]} {selected}, {year}
                </h3>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map(e => (
                      <div key={e.id} className={`p-3 rounded-xl border ${e.type === 'class' ? 'border-blue-500/30 bg-blue-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {e.type === 'class' ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <Bell className="w-3.5 h-3.5 text-yellow-400" />}
                          <span className={`text-xs font-medium ${e.type === 'class' ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {e.type === 'class' ? 'Live Class' : 'Reminder'}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium">{e.title}</p>
                        {e.time && <p className="text-gray-400 text-xs mt-1">{e.time}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events this day</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a day to view events</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming events list */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Upcoming Events</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {events
                .filter(e => e.date >= today.toISOString().split('T')[0])
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 10)
                .map(e => (
                  <div key={e.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${e.type === 'class' ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}>
                      {e.type === 'class' ? <Video className="w-4 h-4 text-blue-400" /> : <Bell className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{e.title}</p>
                      <p className="text-gray-400 text-xs">{e.date} {e.time && `• ${e.time}`}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${e.type === 'class' ? 'text-blue-400 bg-blue-500/20' : 'text-yellow-400 bg-yellow-500/20'}`}>
                      {e.type === 'class' ? 'Class' : 'Reminder'}
                    </span>
                  </div>
                ))}
              {events.filter(e => e.date >= today.toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-8 text-gray-500">No upcoming events</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
