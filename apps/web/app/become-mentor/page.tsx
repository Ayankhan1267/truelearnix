'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, GraduationCap, Star, Users, TrendingUp, CheckCircle, ChevronRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { mentorAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone').optional().or(z.literal('')),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
  experience: z.string().min(10, 'Tell us about your experience'),
  bio: z.string().min(20, 'Bio should be at least 20 characters'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

const benefits = [
  { icon: TrendingUp, title: 'Earn While Teaching', desc: 'Get paid per student enrolled in your courses' },
  { icon: Users, title: 'Build Your Network', desc: 'Access partner program & earn affiliate commissions' },
  { icon: Star, title: 'Admin-Curated Courses', desc: 'Admin assigns courses—you focus on teaching quality' },
  { icon: GraduationCap, title: 'Professional Profile', desc: 'Get a verified mentor badge on the platform' },
]

export default function BecomeMentorPage() {
  const [showPw, setShowPw] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      await mentorAPI.apply(data)
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Application Submitted!</h1>
          <p className="text-gray-400 mb-6">Our team will review your application within 2-3 business days. You'll receive an email once approved.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Back to Home <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size="sm" href="/" />
          <Link href="/login" className="text-sm text-gray-400 hover:text-white">Already applied? <span className="text-primary-400">Sign in</span></Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 text-primary-400 text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" /> Become a Mentor
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Teach. Inspire. <span className="text-primary-400">Earn.</span></h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Join TruLearnix as a mentor, teach assigned courses, and earn commissions through our partner program.</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {benefits.map((b, i) => (
            <div key={i} className="card text-center p-5">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-5 h-5 text-primary-400" />
              </div>
              <p className="font-semibold text-white text-sm mb-1">{b.title}</p>
              <p className="text-gray-500 text-xs">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6">Mentor Application</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                  <input {...register('name')} placeholder="Your full name" className="input" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input {...register('email')} type="email" placeholder="you@example.com" className="input" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone (optional)</label>
                  <input {...register('phone')} placeholder="+91 98765 43210" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn Profile</label>
                  <input {...register('linkedin')} placeholder="https://linkedin.com/in/you" className="input" />
                  {errors.linkedin && <p className="text-red-400 text-xs mt-1">{errors.linkedin.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Portfolio / Website</label>
                <input {...register('portfolio')} placeholder="https://yourportfolio.com" className="input" />
                {errors.portfolio && <p className="text-red-400 text-xs mt-1">{errors.portfolio.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Teaching Experience *</label>
                <textarea {...register('experience')} rows={3} placeholder="Tell us about your teaching or professional experience..." className="input resize-none" />
                {errors.experience && <p className="text-red-400 text-xs mt-1">{errors.experience.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Bio *</label>
                <textarea {...register('bio')} rows={3} placeholder="A short bio about yourself (shown on your mentor profile)..." className="input resize-none" />
                {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
                  <div className="relative">
                    <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" className="input pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password *</label>
                  <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="input" />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
