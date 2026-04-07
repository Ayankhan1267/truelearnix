'use client'
import { useState } from 'react'
import { Star, Copy, Linkedin, Globe, Download, Sparkles, CheckCircle, User } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

const skills = ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Email Marketing']

export default function PersonalBrandPage() {
  const { user } = useAuthStore()
  const [linkedinSummary, setLinkedinSummary] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')

  const portfolioUrl = `peptly.in/portfolio/${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`

  const completeness = [
    { label: 'Profile Photo', done: !!(user as any)?.avatar },
    { label: 'LinkedIn Link', done: false },
    { label: 'Skills Added', done: true },
    { label: 'Portfolio Published', done: false },
    { label: 'First Certificate', done: false },
  ]
  const doneCount = completeness.filter(c => c.done).length
  const pct = Math.round((doneCount / completeness.length) * 100)

  const generateLinkedIn = async () => {
    setGenerating('linkedin')
    await new Promise(r => setTimeout(r, 2000))
    setLinkedinSummary(`🚀 Digital Marketing Professional | Content Strategist | Affiliate Marketing Expert

I am ${user?.name}, a results-driven digital marketer with expertise in SEO, Content Marketing, and Performance Marketing. Currently upskilling through TureLearnix's industry-leading EdTech platform.

💡 What I bring to the table:
• Data-driven marketing strategies that deliver measurable ROI
• Expertise in Meta Ads, Google Ads & organic growth
• Content creation that converts — from blogs to video scripts
• Affiliate marketing network management

🎯 Currently focused on: Building scalable digital marketing systems for D2C brands.

Let's connect and grow together! 🤝

#DigitalMarketing #ContentMarketing #SEO #AffiliateMarketing`)
    setGenerating(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Star className="w-8 h-8 text-yellow-400" /> Personal Brand Builder</h1>
        <p className="text-gray-400 mt-1">Build your professional identity and attract opportunities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile completeness */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Profile Completeness</h2>
              <span className="text-2xl font-black text-primary-400">{pct}%</span>
            </div>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{pct}%</span>
            </div>
            <div className="space-y-2">
              {completeness.map(item => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 ${item.done ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={item.done ? 'text-white' : 'text-gray-500'}>{item.label}</span>
                  {!item.done && <span className="ml-auto text-xs text-primary-400 cursor-pointer hover:underline">Complete</span>}
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Summary Generator */}
          <div className="card">
            <h2 className="font-bold text-white mb-1 flex items-center gap-2"><Linkedin className="w-5 h-5 text-blue-400" /> LinkedIn Summary</h2>
            <p className="text-xs text-gray-400 mb-4">AI generates a professional LinkedIn summary based on your skills</p>
            <div className="flex gap-2 mb-4">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add your skills (comma separated)"
                className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500" />
              <button onClick={generateLinkedIn} disabled={generating === 'linkedin'}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 whitespace-nowrap">
                {generating === 'linkedin' ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-3 h-3" /> Generate</>}
              </button>
            </div>
            {linkedinSummary && (
              <div className="relative">
                <textarea value={linkedinSummary} onChange={e => setLinkedinSummary(e.target.value)} rows={10}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-blue-500 leading-relaxed" />
                <button onClick={() => { navigator.clipboard.writeText(linkedinSummary); toast.success('Copied to clipboard!') }}
                  className="absolute top-3 right-3 p-1.5 bg-dark-800 hover:bg-dark-600 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Portfolio URL */}
          <div className="card">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-green-400" /> Portfolio Page</h2>
            <div className="flex items-center gap-3 bg-dark-700 border border-white/10 rounded-xl p-3">
              <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 flex-1">{portfolioUrl}</span>
              <button onClick={() => { navigator.clipboard.writeText(portfolioUrl); toast.success('URL copied!') }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Your portfolio page automatically updates as you complete courses and earn certificates.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skill Cards */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Download className="w-4 h-4 text-primary-400" /> Skill Cards</h3>
            <p className="text-xs text-gray-400 mb-3">Download shareable cards for each skill</p>
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill} className="flex items-center justify-between p-2 bg-dark-700 rounded-xl">
                  <span className="text-sm text-white">{skill}</span>
                  <button onClick={() => toast.success(`${skill} card downloading...`)} className="text-xs text-primary-400 hover:underline">Download</button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Preview */}
          <div className="card border border-primary-500/20">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><User className="w-4 h-4 text-primary-400" /> Profile Card</h3>
            <div className="text-center py-3">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-primary-400">
                {user?.name?.[0]}
              </div>
              <p className="font-bold text-white text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Digital Marketing Expert</p>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                {skills.slice(0, 3).map(s => <span key={s} className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
