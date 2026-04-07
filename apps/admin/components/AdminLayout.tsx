'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import Sidebar from './Sidebar'
import { Bell, Menu, X } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/users': 'Users',
  '/packages': 'Packages',
  '/finance': 'Finance',
  '/crm': 'CRM',
  '/courses': 'Courses',
  '/live-classes': 'Live Classes',
  '/blog': 'Blog',
  '/support': 'Support',
  '/notifications': 'Notifications',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = Cookies.get('adminToken') || (typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null)
    if (!token) {
      if (pathname !== '/login') router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [router, pathname])

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const title = pageTitles[pathname] || Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || 'Admin'

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-400" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-violet-500/30 rounded-full flex items-center justify-center">
              <span className="text-violet-300 font-bold text-xs">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
