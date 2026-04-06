'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, BookOpen, LogOut, LayoutDashboard, ChevronRight, Zap, Video, Award, Users, Home, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/live-classes', label: 'Live Classes', icon: Video, badge: 'LIVE' },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
]

const sidebarExtras = [
  { href: '/about', label: 'About Us', icon: Users },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/affiliate', label: 'Earn Money', icon: Zap },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout(); setOpen(false); router.push('/')
  }

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'mentor' ? '/mentor' : '/student'

  return (
    <>
      <nav className={`fixed top-0 w-full z-30 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-white/[0.06]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">TruLearnix</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${pathname === link.href ? 'text-violet-400 bg-violet-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {link.label}
                  {link.badge && (
                    <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot inline-block" />{link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link href={dashboardPath} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{user.name[0]}</div>
                    <span>{user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Login</Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-5">Start Free →</Link>
                </>
              )}
            </div>

            <button onClick={() => setOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar-panel ${open ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black gradient-text">TruLearnix</span>
          </Link>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {user && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">{user.name[0]}</div>
              <div>
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-gray-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-1">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 mb-3">Navigate</p>
          {navLinks.map(link => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge && (
                    <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot inline-block" />LIVE
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 opacity-30" />
              </Link>
            )
          })}
        </div>

        <div className="px-4 pb-4 space-y-1">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 mb-3">More</p>
          {sidebarExtras.map(link => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="w-4 h-4" /><span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.08]" style={{background:'#0d1120'}}>
          {user ? (
            <div className="space-y-2">
              <Link href={dashboardPath} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all font-medium">
                <LayoutDashboard className="w-4 h-4" /><span>My Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/register" onClick={() => setOpen(false)} className="btn-primary block text-center py-3 text-sm">
                Start Learning Free →
              </Link>
              <Link href="/login" onClick={() => setOpen(false)} className="block text-center text-sm text-gray-400 hover:text-white py-2 transition-colors">
                Already have an account? Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
