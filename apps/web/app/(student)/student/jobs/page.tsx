'use client'
import { useState } from 'react'
import { Briefcase, Search, ExternalLink, Zap, DollarSign, Star, TrendingUp, Filter } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

const mockJobs = [
  { id: 1, title: 'SEO Content Writer', platform: 'Upwork', budget: '₹15,000-25,000/month', skills: ['SEO', 'Content Writing', 'Blogging'], type: 'Fixed', posted: '2h ago', proposals: 12 },
  { id: 2, title: 'Digital Marketing Manager', platform: 'Freelancer', budget: '₹8,000-12,000/project', skills: ['Facebook Ads', 'Google Ads', 'Analytics'], type: 'Project', posted: '5h ago', proposals: 8 },
  { id: 3, title: 'Social Media Manager', platform: 'Internal', budget: '₹20,000/month', skills: ['Instagram', 'Content Creation', 'Reels'], type: 'Retainer', posted: '1d ago', proposals: 5 },
  { id: 4, title: 'YouTube Video Editor', platform: 'Upwork', budget: '₹500-1,000/video', skills: ['Premiere Pro', 'After Effects', 'Thumbnail Design'], type: 'Hourly', posted: '2d ago', proposals: 20 },
  { id: 5, title: 'Affiliate Marketing Consultant', platform: 'Internal', budget: '₹30,000/month', skills: ['Affiliate Marketing', 'Email Marketing', 'CRM'], type: 'Retainer', posted: '3d ago', proposals: 3 },
]

const platformColors: Record<string, string> = {
  Upwork: 'bg-green-500/20 text-green-400',
  Freelancer: 'bg-blue-500/20 text-blue-400',
  Internal: 'bg-violet-500/20 text-violet-400',
}

export default function JobEnginePage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('All')
  const [earnings, setEarnings] = useState('')
  const [proposalJob, setProposalJob] = useState<any>(null)
  const [proposal, setProposal] = useState('')
  const [generatingProposal, setGeneratingProposal] = useState(false)

  const filtered = mockJobs.filter(j =>
    (platform === 'All' || j.platform === platform) &&
    (j.title.toLowerCase().includes(search.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  )

  const generateProposal = async (job: any) => {
    setProposalJob(job)
    setGeneratingProposal(true)
    await new Promise(r => setTimeout(r, 1500))
    setProposal(`Dear Client,

I am ${user?.name}, a skilled professional with expertise in ${job.skills.join(', ')}. I recently completed advanced training in these areas through TureLearnix platform.

For your "${job.title}" position, I can deliver:
• Professional quality work within your timeline
• Regular updates and transparent communication
• Results-focused approach with measurable outcomes

My relevant skills: ${job.skills.join(', ')}

Budget: ${job.budget} — I'm flexible and open to discussion.

I would love to discuss how I can contribute to your project. Please feel free to reach out!

Best regards,
${user?.name}`)
    setGeneratingProposal(false)
  }

  const logEarnings = () => {
    if (!earnings || isNaN(Number(earnings))) return toast.error('Enter a valid amount')
    toast.success(`₹${Number(earnings).toLocaleString()} logged as freelance earnings!`)
    setEarnings('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Briefcase className="w-8 h-8 text-primary-400" /> Job Engine</h1>
        <p className="text-gray-400 mt-1">Find freelance opportunities matched to your skills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-2xl font-bold text-white">{mockJobs.length}</p><p className="text-xs text-gray-400 mt-1">Open Opportunities</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-400">3</p><p className="text-xs text-gray-400 mt-1">Internal Jobs</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-yellow-400">AI</p><p className="text-xs text-gray-400 mt-1">Proposals Ready</p></div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job title or skill..."
            className="w-full bg-dark-700 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
        </div>
        <select value={platform} onChange={e => setPlatform(e.target.value)}
          className="bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500">
          <option value="All">All Platforms</option>
          <option value="Upwork">Upwork</option>
          <option value="Freelancer">Freelancer</option>
          <option value="Internal">Internal Board</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="card hover:border-primary-500/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${platformColors[job.platform]}`}>{job.platform}</span>
                    {job.platform === 'Internal' && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">⭐ Platform Job</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-green-400" />{job.budget}</span>
                    <span>{job.type}</span>
                    <span>{job.posted}</span>
                    <span>{job.proposals} proposals</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-white/5 text-gray-300 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button onClick={() => generateProposal(job)} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> AI Proposal
                </button>
                <button className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" /> Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Earnings tracker */}
          <div className="card border border-green-500/20 bg-green-500/5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Earnings Tracker</h3>
            <p className="text-xs text-gray-400 mb-3">Log your freelance earnings to track progress</p>
            <div className="flex gap-2">
              <input value={earnings} onChange={e => setEarnings(e.target.value)} placeholder="₹ Amount" type="number"
                className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-500" />
              <button onClick={logEarnings} className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl text-sm font-medium transition-colors">Log</button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>✅ Complete your profile to get better matches</li>
              <li>✅ Use AI proposals — 3x higher response rate</li>
              <li>✅ Internal jobs have no platform fee</li>
              <li>✅ Build a portfolio with your assignments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {proposalJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setProposalJob(null)}>
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> AI-Generated Proposal</h3>
              <button onClick={() => setProposalJob(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-3">For: <span className="text-primary-400">{proposalJob.title}</span></p>
            {generatingProposal ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">Generating your proposal...</p></div>
            ) : (
              <>
                <textarea value={proposal} onChange={e => setProposal(e.target.value)} rows={12}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-primary-500 leading-relaxed" />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { navigator.clipboard.writeText(proposal); toast.success('Proposal copied!') }} className="btn-primary text-sm py-2 px-5">Copy Proposal</button>
                  <button onClick={() => setProposalJob(null)} className="btn-outline text-sm py-2 px-5">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
