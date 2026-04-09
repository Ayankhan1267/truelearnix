'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import PartnerSidebar from '@/components/layout/PartnerSidebar'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated()) router.push('/login')
    else if (user && user.role !== 'student' && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/student/dashboard')
    }
  }, [mounted, user])

  if (!mounted || !user) return null

  return (
    <div className="flex min-h-screen bg-dark-900">
      <PartnerSidebar />
      <main className="flex-1 lg:ml-72">
        <div className="lg:hidden h-14" />
        <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
