'use client'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import EarningsToast from './EarningsToast'
import EventPopup from './EventPopup'
import PresentationPopup from './PresentationPopup'
import AnnouncementPopup from './AnnouncementPopup'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function PopupManager() {
  const [popups, setPopups] = useState<any[]>([])
  const [milestone, setMilestone] = useState<any>(null)
  const [shown, setShown] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<any | null>(null)
  const [queue, setQueue] = useState<any[]>([])
  const [scrollPct, setScrollPct] = useState(0)
  const [exitListening, setExitListening] = useState(false)

  // Load popups + milestone on mount
  useEffect(() => {
    const seenRaw = localStorage.getItem('popup_seen') || '[]'
    const seen: string[] = JSON.parse(seenRaw)
    setShown(new Set(seen))

    Promise.all([
      axios.get(`${API}/popups/active`).catch(() => ({ data: { popups: [] } })),
      axios.get(`${API}/popups/milestone`).catch(() => ({ data: { user: null } })),
    ]).then(([pRes, mRes]) => {
      setPopups(pRes.data.popups || [])
      setMilestone(mRes.data.user || null)
    })
  }, [])

  // Track scroll %
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = Math.round((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100)
      setScrollPct(isNaN(pct) ? 0 : pct)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const markSeen = useCallback((id: string, showOnce: boolean) => {
    if (!showOnce) return
    setShown(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('popup_seen', JSON.stringify(Array.from(next)))
      return next
    })
  }, [])

  const dismiss = useCallback(() => {
    if (active) markSeen(active._id, active.showOnce)
    setActive(null)
    // Show next in queue after brief delay
    setTimeout(() => {
      setQueue(q => {
        const [next, ...rest] = q
        if (next) setActive(next)
        return rest
      })
    }, 600)
  }, [active, markSeen])

  const enqueue = useCallback((popup: any) => {
    setActive(curr => {
      if (!curr) return popup
      setQueue(q => [...q, popup])
      return curr
    })
  }, [])

  // Schedule popups based on trigger
  useEffect(() => {
    if (!popups.length) return

    popups.forEach(popup => {
      if (shown.has(popup._id)) return

      if (popup.trigger === 'on_load') {
        const delay = (popup.triggerDelay || 5) * 1000
        const t = setTimeout(() => enqueue(popup), delay)
        return () => clearTimeout(t)
      }
    })
  }, [popups, shown, enqueue])

  // Scroll-triggered popups
  useEffect(() => {
    popups.forEach(popup => {
      if (popup.trigger !== 'on_scroll') return
      if (shown.has(popup._id)) return
      if (scrollPct >= (popup.triggerScroll || 50)) {
        enqueue(popup)
        markSeen(popup._id, popup.showOnce)
      }
    })
  }, [scrollPct, popups, shown, enqueue, markSeen])

  // Exit intent popups
  useEffect(() => {
    if (exitListening) return
    const exitPopups = popups.filter(p => p.trigger === 'on_exit' && !shown.has(p._id))
    if (!exitPopups.length) return

    setExitListening(true)
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 20) {
        exitPopups.forEach(p => enqueue(p))
        document.removeEventListener('mouseleave', handler)
      }
    }
    document.addEventListener('mouseleave', handler)
    return () => document.removeEventListener('mouseleave', handler)
  }, [popups, shown, exitListening, enqueue])

  if (!active) return null

  const props = { popup: active, milestone, onClose: dismiss }

  switch (active.type) {
    case 'earnings_toast':  return <EarningsToast {...props} />
    case 'event':           return <EventPopup {...props} />
    case 'presentation':    return <PresentationPopup {...props} />
    case 'announcement':    return <AnnouncementPopup {...props} />
    default:                return null
  }
}
