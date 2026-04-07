'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, BarChart2, Users, Package, DollarSign, Coins,
  ShoppingCart, Contact, BookOpen, Video, FileText, LifeBuoy,
  Bell, LogOut, ChevronRight, Zap, Kanban, CalendarDays,
  Tag, Target, FolderOpen, AlarmClock, UserCog, Shield,
  Trophy, Megaphone, MousePointerClick, TrendingUp
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Packages', href: '/packages', icon: Package },
  {
    label: 'Finance', icon: DollarSign, children: [
      { label: 'Commissions', href: '/finance?tab=commissions', icon: Coins },
      { label: 'Withdrawals', href: '/finance?tab=withdrawals', icon: DollarSign },
      { label: 'Purchases', href: '/finance?tab=purchases', icon: ShoppingCart },
    ]
  },
  { label: 'CRM', href: '/crm', icon: Contact },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Live Classes', href: '/live-classes', icon: Video },
  { label: 'Blog', href: '/blog', icon: FileText },
  { label: 'Support', href: '/support', icon: LifeBuoy },
  { label: 'Coupons', href: '/coupons', icon: Tag },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  {
    label: 'Operations', icon: Kanban, children: [
      { label: 'Kanban', href: '/kanban', icon: Kanban },
      { label: 'Calendar', href: '/calendar', icon: CalendarDays },
      { label: 'Reminders', href: '/reminders', icon: AlarmClock },
    ]
  },
  {
    label: 'Growth', icon: TrendingUp, children: [
      { label: 'Goals & OKR', href: '/goals', icon: Target },
      { label: 'Funnel', href: '/funnel', icon: TrendingUp },
      { label: 'Ads Tracking', href: '/ads-tracking', icon: MousePointerClick },
    ]
  },
  { label: 'Study Materials', href: '/materials', icon: FolderOpen },
  { label: 'Achievements', href: '/achievements', icon: Trophy },
  { label: 'HR Team', href: '/hr', icon: UserCog },
  { label: 'Security', href: '/security', icon: Shield },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const adminName = typeof window !== 'undefined' ? (localStorage.getItem('adminName') || 'Admin') : 'Admin'
  const adminRole = typeof window !== 'undefined' ? (localStorage.getItem('adminRole') || 'superadmin') : 'superadmin'

  const logout = () => {
    Cookies.remove('adminToken')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      localStorage.removeItem('adminRole')
    }
    router.push('/login')
  }

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return pathname === base || pathname.startsWith(base + '/')
  }

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-white/10 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">TureLearnix</p>
            <span className="text-[10px] text-violet-400 font-medium bg-violet-500/20 px-1.5 py-0.5 rounded-full">Admin v2.0</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.children) {
            const anyActive = item.children.some(c => isActive(c.href.split('?')[0]))
            return (
              <div key={item.label}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-default ${anyActive ? 'text-violet-400' : 'text-gray-400'}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
                <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {item.children.map(child => {
                    const active = isActive(child.href.split('?')[0])
                    return (
                      <Link key={child.href} href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${active ? 'bg-violet-600/20 text-violet-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }
          const active = isActive(item.href!)
          return (
            <Link key={item.href} href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-violet-500/30 rounded-full flex items-center justify-center">
            <span className="text-violet-300 font-bold text-xs">{adminName[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminName}</p>
            <p className="text-gray-500 text-[10px] capitalize">{adminRole}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
