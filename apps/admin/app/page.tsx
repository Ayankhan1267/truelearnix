'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = Cookies.get('adminToken') || localStorage.getItem('adminToken')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
