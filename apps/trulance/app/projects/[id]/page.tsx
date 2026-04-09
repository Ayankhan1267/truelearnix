'use client'
import { useQuery } from '@tanstack/react-query'
import { trulanceAPI, freelanceAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { ArrowLeft, Clock, Users, Briefcase, CheckCircle } from 'lucide-react'

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/15 text-green-400',
  intermediate: 'bg-blue-500/15 text-blue-400',
  expert: 'bg-purple-500/15 text-purple-400',
}

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => trulanceAPI.getProject(params.id).then(r => r.data.data),
  })

  const handleApply = async () => {
    if (!_hasHydrated) return
    if (!user) {
      toast.error('Please login to apply')
      return router.push(`/login?redirect=/projects/${params.id}`)
    }
    setApplying(true)
    try {
      await freelanceAPI.apply(params.id)
      setApplied(true)
      toast.success('Application submitted!')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Project not found</p>
        <Link href="/projects" className="btn-primary">Browse Projects</Link>
      </div>
    </div>
  )

  const isOwner = user && ((user as any).id === data.postedBy?._id?.toString() || (user as any)._id === data.postedBy?._id?.toString())
  const alreadyApplied = applied || (user && data.applicants?.some((id: any) => id.toString() === ((user as any)._id || (user as any).id)?.toString()))

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-5">
                <h1 className="text-2xl font-black text-white leading-snug">{data.title}</h1>
                <span className={`badge flex-shrink-0 capitalize ${LEVEL_COLORS[data.experienceLevel] || ''}`}>
                  {data.experienceLevel}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">₹{data.budget?.toLocaleString()}</span>
                  <span className="capitalize text-gray-600">{data.budgetType}</span>
                </span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-600" />{data.duration}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-600" />{data.category}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-600" />{data.applicants?.length || 0} applicants</span>
              </div>
              <h3 className="text-white font-bold mb-3">Project Description</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{data.description}</p>
            </div>

            {data.skills?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-white mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((s: string) => (
                    <span key={s} className="px-3 py-1.5 rounded-xl text-sm font-medium text-teal-400"
                      style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card" style={{ border: '1px solid rgba(13,148,136,0.25)' }}>
              <div className="text-center mb-5">
                <p className="text-4xl font-black text-teal-400">₹{data.budget?.toLocaleString()}</p>
                <p className="text-xs text-gray-600 capitalize mt-1">{data.budgetType} project</p>
              </div>
              {isOwner ? (
                <div className="text-center py-2 text-violet-400 font-bold text-sm bg-violet-500/10 rounded-xl">Your Project</div>
              ) : (
                <button onClick={handleApply} disabled={applying || !!alreadyApplied}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    alreadyApplied ? 'bg-green-500/15 text-green-400 cursor-default' : 'btn-primary'
                  }`}>
                  {alreadyApplied
                    ? <><CheckCircle className="w-4 h-4 inline mr-1.5" />Applied!</>
                    : applying ? 'Submitting...' : 'Apply for this Project'}
                </button>
              )}
              {!user && !alreadyApplied && (
                <p className="text-xs text-gray-600 text-center mt-2">
                  <Link href="/login" className="text-teal-400 hover:underline">Login</Link> required to apply
                </p>
              )}
            </div>

            {data.postedBy && (
              <div className="card">
                <h3 className="font-bold text-white text-sm mb-3">Posted By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}>
                    {data.postedBy.avatar
                      ? <img src={data.postedBy.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      : <span className="text-white">{data.postedBy.name?.[0]}</span>}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{data.postedBy.name}</p>
                    <p className="text-xs text-gray-600">Project Owner</p>
                  </div>
                </div>
              </div>
            )}

            <Link href="/freelancers" className="btn-secondary w-full py-2.5 text-sm block text-center">
              Browse Freelancers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
