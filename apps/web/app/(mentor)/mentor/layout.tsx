'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import {
  LayoutDashboard, BookOpen, Users, Video, User, LogOut,
  Coins, TrendingUp, Menu, X, ChevronRight, Wallet,
  ExternalLink, GraduationCap
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { authAPI } from '@/lib/api'

const navItems = [
  { href: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/mentor/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/mentor/students', icon: Users, label: 'Students' },
  { href: '/mentor/classes', icon: Video, label: 'Live Classes' },
  { href: '/mentor/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/mentor/profile', icon: User, label: 'Profile' },
]

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated()) router.push('/login')
    else if (user?.role !== 'mentor') router.push('/')
  }, [mounted, user])

  if (!mounted || !user || user.role !== 'mentor') return null

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Logo size="sm" href="/" />
      </div>

      {/* User card */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            {user.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" /> : <span className="text-white font-bold text-sm">{user.name[0]}</span>}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.name}</p>
            <p className="text-xs text-primary-400 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Mentor</p>
          </div>
        </div>
        {(user as any).isAffiliate && (
          <div className="bg-white/5 rounded-lg p-2 text-xs flex items-center justify-between">
            <span className="text-gray-400">Wallet</span>
            <span className="text-white font-semibold">₹{(user as any).wallet || 0}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}

        {/* Partner panel link */}
        {(user as any).isAffiliate && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-600 px-3 mb-1 uppercase tracking-wider">Earn Program</p>
            <Link href="/partner/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
              <span>Partner Panel</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Link>
            <Link href="/partner/earnings" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Coins className="w-4 h-4" />
              <span>My Earnings</span>
            </Link>
          </div>
        )}

        {!(user as any).isAffiliate && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="mx-1 rounded-xl bg-gradient-to-br from-violet-500/10 to-primary-500/10 border border-primary-500/20 p-3">
              <p className="text-xs font-semibold text-white mb-1">Unlock Earn Program</p>
              <p className="text-xs text-gray-400 mb-2">Get a package to access partner commissions</p>
              <Link href="/student/upgrade" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View Packages <ChevronRight className="w-3 h-3" /></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-white/5 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-dark-800 flex flex-col h-full z-50">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-dark-800 border-b border-white/5 flex items-center justify-between px-4 z-30">
        <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" href="/" />
        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
          <span className="text-primary-400 font-bold text-xs">{user.name[0]}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/5 flex items-center justify-around px-2 h-16 z-30">
        {navItems.slice(0, 5).map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-primary-400' : 'text-gray-500'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
