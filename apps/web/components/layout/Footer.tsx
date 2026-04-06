import Link from 'next/link'
import { BookOpen, Mail, Phone, MapPin, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-800/60 border-t border-white/[0.06]">
      {/* Newsletter strip */}
      <div className="border-b border-white/[0.06] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-xl mb-1">Get free learning resources</h3>
            <p className="text-gray-400 text-sm">Weekly courses, tips & affiliate opportunities in your inbox</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Enter your email" className="input max-w-xs flex-1" />
            <button className="btn-primary px-6 whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">TruLearnix</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">India's premium EdTech platform for live learning, earning, and career growth.</p>
            <div className="flex gap-3">
              {[{Icon:Youtube,href:'#'},{Icon:Instagram,href:'#'},{Icon:Twitter,href:'#'},{Icon:Linkedin,href:'#'}].map(({Icon,href},i) => (
                <a key={i} href={href} className="w-9 h-9 bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              {['Courses','Live Classes','Certifications','Affiliate Program','Become Mentor','Pricing'].map(l => (
                <li key={l}><Link href="#" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              {['About Us','Careers','Blog','Press Kit','Privacy Policy','Terms of Service'].map(l => (
                <li key={l}><Link href="#" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-400 flex-shrink-0" />hello@trulearnix.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-400 flex-shrink-0" />+91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />Bengaluru, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2024 TruLearnix. All rights reserved. Made with ❤️ in India</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
