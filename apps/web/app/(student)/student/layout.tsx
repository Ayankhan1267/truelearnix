'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import StudentSidebar from '@/components/layout/StudentSidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated()) router.push('/login')
    else if (user?.role !== 'student') router.push(`/${user?.role}`)
  }, [mounted, user])

  if (!mounted || !user || user.role !== 'student') return null

  return (
    <div className="flex min-h-screen bg-dark-900">
      <StudentSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
