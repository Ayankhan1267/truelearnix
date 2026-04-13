'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Video, Bot, Users, Award,
  FileQuestion, FileText, User, LogOut, X, Menu, Flame,
  Briefcase, Star, FolderGit2, ChevronRight, Zap, Heart,
  Bell, ArrowUpCircle, Globe, HeartHandshake, TrendingUp, Lock,
  ExternalLink, CreditCard
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { authAPI, userAPI } from '@/lib/api'
import Logo from '@/components/ui/Logo'
import { useQuery } from '@tanstack/react-query'

// ─── Nav structure ────────────────────────────────────────────────────────────
const MAIN_NAV = [
  { href: '/student/dashboard',     icon: LayoutDashboard, label: 'Dashboard',    bottom: true  },
  { href: '/student/courses',       icon: BookOpen,        label: 'My Courses',   bottom: true  },
  { href: '/student/classes',       icon: Video,           label: 'Live Classes', bottom: false },
  { href: '/student/ai-coach',      icon: Bot,             label: 'AI Coach',     bottom: true  },
  { href: '/student/community',     icon: Users,           label: 'Community',    bottom: false },
  { href: '/student/announcements', icon: Bell,            label: 'Announcements',bottom: true  },
  { href: '/student/favorites',     icon: Heart,           label: 'Favorites',    bottom: false },
]

const TOOLS_NAV = [
  { href: '/student/assignments',   icon: FileText,       label: 'Assignments' },
  { href: '/student/quizzes',       icon: FileQuestion,   label: 'Quizzes'     },
  { href: '/student/certificates',  icon: Award,          label: 'Certificates'},
  { href: '/student/jobs',          icon: Briefcase,      label: 'Job Engine'  },
  { href: '/student/brand',         icon: Star,           label: 'Personal Brand'},
  { href: '/student/projects',      icon: FolderGit2,     label: 'Projects'    },
  { href: '/student/freelance',     icon: Briefcase,      label: 'Freelance'   },
  { href: '/student/emi',           icon: CreditCard,     label: 'My EMI'      },
  { href: '/student/profile',       icon: User,           label: 'Profile'     },
]

const TIER_CONFIG: Record<string, { label: string; cls: string; glow: string }> = {
  free:    { label: 'Free',    cls: 'text-gray-400 bg-gray-400/10 border-gray-400/15',   glow: '#9ca3af' },
  starter: { label: 'Starter', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/15',  glow: '#60a5fa' },
  pro:     { label: 'Pro',     cls: 'text-violet-400 bg-violet-400/10 border-violet-400/15', glow: '#a78bfa' },
  elite:   { label: 'Elite',   cls: 'text-amber-400 bg-amber-400/10 border-amber-400/15', glow: '#fbbf24' },
  supreme: { label: 'Supreme', cls: 'text-rose-400 bg-rose-400/10 border-rose-400/15',  glow: '#fb7185' },
}

// ─── NavLink ─────────────────────────────────────────────────────────────────
function NavLink({ href, icon: Icon, label, badge, active, onClick }: {
  href: string; icon: any; label: string; badge?: number; active: boolean; onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
        active
          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : 'group-hover:text-white transition-colors'}`} />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : active ? (
        <ChevronRight className="w-3 h-3 text-indigo-400/50 flex-shrink-0" />
      ) : null}
    </Link>
  )
}

// ─── Sidebar inner content ────────────────────────────────────────────────────
function SidebarInner({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const tier = (user as any)?.packageTier || 'free'
  const tc = TIER_CONFIG[tier] || TIER_CONFIG.free
  const isLocked = tier === 'free' && !(user as any)?.isAffiliate && !((user as any)?.enrollmentCount > 0)

  const { data: annData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => userAPI.announcements().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const annCount = annData?.announcements?.length || 0

  const isActive = (href: string) => !!pathname?.startsWith(href)

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
    router.push('/')
  }

  const close = () => onClose?.()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top: Logo + close ── */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <Logo size="sm" href="/" />
        {onClose && (
          <button onClick={close} className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Quick links: Website + Partner ── */}
      <div className="mx-3 mt-3 flex gap-2 flex-shrink-0">
        <a
          href="/"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white transition-all text-xs font-medium group"
        >
          <Globe className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
          <span>Website</span>
        </a>
        <Link
          href="/partner/dashboard"
          onClick={close}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 hover:text-indigo-300 transition-all text-xs font-medium group"
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Partner</span>
        </Link>
      </div>

      {/* ── User card ── */}
      <div className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/8 border border-indigo-500/15 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
              {(user as any)?.avatar
                ? <img src={(user as any).avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0d1120]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate leading-none">{user?.name}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full border capitalize ${tc.cls}`}>
              {tc.label}
            </span>
          </div>
          <Link href="/student/upgrade" onClick={close}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Upgrade plan">
            <ArrowUpCircle className="w-4 h-4 text-indigo-400" />
          </Link>
        </div>
        {/* Streak + XP */}
        <div className="mt-2.5 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-orange-400 font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>{(user as any)?.streak || 0} day</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1 text-indigo-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>{(user as any)?.xpPoints || 0} XP</span>
          </div>
          {tier !== 'free' && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <Link href="/student/upgrade" onClick={close} className="text-gray-500 hover:text-indigo-400 transition-colors text-[10px] font-medium">
                Upgrade ↑
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Nav scrollable area ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {isLocked && (
          <Link href="/packages" onClick={close}
            className="flex items-center gap-2 mx-0 mb-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors">
            <Lock className="w-3 h-3 flex-shrink-0" />
            <span className="flex-1">Purchase to unlock dashboard</span>
          </Link>
        )}
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 py-1.5">Learn</p>
        {MAIN_NAV.map(item => (
          isLocked ? (
            <div key={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed select-none">
              <item.icon className="w-4 h-4 flex-shrink-0 opacity-40" />
              <span className="flex-1 opacity-40">{item.label}</span>
              <Lock className="w-3 h-3 opacity-30 flex-shrink-0" />
            </div>
          ) : (
            <NavLink
              key={item.href}
              {...item}
              badge={item.href === '/student/announcements' && annCount > 0 ? annCount : undefined}
              active={isActive(item.href)}
              onClick={close}
            />
          )
        ))}

        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 py-1.5 mt-2">Tools</p>
        {TOOLS_NAV.map(item => {
          const freeAllowed = item.href.startsWith('/student/profile') || item.href.startsWith('/student/upgrade')
          if (isLocked && !freeAllowed) {
            return (
              <div key={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed select-none">
                <item.icon className="w-4 h-4 flex-shrink-0 opacity-40" />
                <span className="flex-1 opacity-40">{item.label}</span>
                <Lock className="w-3 h-3 opacity-30 flex-shrink-0" />
              </div>
            )
          }
          return <NavLink key={item.href} {...item} active={isActive(item.href)} onClick={close} />
        })}

        {/* Earn & Grow (affiliate) */}
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 py-1.5 mt-2">Earn</p>
        {isLocked ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed select-none">
            <TrendingUp className="w-4 h-4 flex-shrink-0 opacity-40" />
            <span className="flex-1 opacity-40">Earn & Grow</span>
            <Lock className="w-3 h-3 opacity-30 flex-shrink-0" />
          </div>
        ) : (
          <Link href="/student/affiliate" onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isActive('/student/affiliate')
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}>
            <TrendingUp className="w-4 h-4 flex-shrink-0 text-green-400" />
            <span className="flex-1">Earn & Grow</span>
            {!(user as any)?.isAffiliate && <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />}
          </Link>
        )}

        {/* Upgrade plan */}
        {tier === 'free' && (
          <Link href="/student/upgrade" onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/25 hover:to-violet-500/15 mt-2">
            <ArrowUpCircle className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span className="flex-1">Upgrade Plan</span>
            <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded-full text-indigo-300">FREE→PRO</span>
          </Link>
        )}
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3 flex-shrink-0">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/8 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Bottom Nav Item ──────────────────────────────────────────────────────────
function BottomNavItem({ href, icon: Icon, label, active, badge }: {
  href: string; icon: any; label: string; active: boolean; badge?: number
}) {
  return (
    <Link href={href}
      className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all relative ${
        active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
      }`}>
      <div className="relative">
        <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
        {badge ? (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[9px] font-medium truncate max-w-[44px] text-center leading-none mt-0.5">{label}</span>
      {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />}
    </Link>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function LearnerSidebar() {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const { data: annData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => userAPI.announcements().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const annCount = annData?.announcements?.length || 0

  const isActive = (href: string) => !!pathname?.startsWith(href)

  const bottomNav = MAIN_NAV.filter(i => i.bottom)

  return (
    <>
      {/* ────── Desktop Sidebar ────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-white/5 flex-col z-40">
        <SidebarInner />
      </aside>

      {/* ────── Mobile: Top Bar ────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-dark-800/95 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <Menu className="w-5 h-5" />
        </button>

        <Logo size="sm" href="/" className="flex-1" />

        {/* Quick top links */}
        <div className="flex items-center gap-2">
          {/* Website */}
          <a href="/" className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium border border-white/8">
            <Globe className="w-3 h-3" />
            <span className="hidden sm:inline">Website</span>
          </a>
          {/* Partner */}
          <Link href="/partner/dashboard" className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all text-xs font-medium border border-indigo-500/15">
            <HeartHandshake className="w-3 h-3" />
            <span className="hidden sm:inline">Partner</span>
          </Link>
          {/* Streak */}
          <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
            <Flame className="w-4 h-4" />
            <span>{(user as any)?.streak || 0}</span>
          </div>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {(user as any)?.avatar
              ? <img src={(user as any).avatar} className="w-full h-full object-cover" alt="" />
              : <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
        </div>
      </header>

      {/* ────── Mobile Drawer ────── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-72 bg-dark-800 z-50 shadow-2xl shadow-black/50">
            <SidebarInner onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ────── Mobile Bottom Nav ────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-800/95 backdrop-blur-md border-t border-white/8 flex items-stretch justify-around px-1 safe-area-bottom">
        {bottomNav.map(item => (
          <BottomNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActive(item.href)}
            badge={item.href === '/student/announcements' ? annCount : undefined}
          />
        ))}
        {/* More button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 px-2 text-gray-500 hover:text-gray-300 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-0.5">More</span>
        </button>
      </nav>
    </>
  )
}
