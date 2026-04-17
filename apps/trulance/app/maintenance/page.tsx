import { Zap } from 'lucide-react'

export const metadata = { title: 'Under Maintenance — Trulancer' }

export default async function MaintenancePage() {
  let message = 'We are performing scheduled maintenance. We will be back shortly.'
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.trulearnix.com'
    const res = await fetch(`${apiUrl}/api/public/maintenance`, { next: { revalidate: 30 } })
    const data = await res.json()
    if (data.message) message = data.message
  } catch {}

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Under Maintenance</h1>
          <p className="text-gray-400 text-base leading-relaxed">{message}</p>
        </div>

        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: '60%', animation: 'progress 2s ease-in-out infinite' }} />
        </div>

        <p className="text-gray-600 text-sm">— Team Trulancer</p>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
