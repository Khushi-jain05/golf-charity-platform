'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    load()
  }, [])

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  const menuItems = [
    { label: 'Dashboard',  href: '/dashboard',          d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'My Scores',  href: '/dashboard/scores',   d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Draws',      href: '/dashboard/draws',    d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Charities',  href: '/dashboard/charity',  d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Winnings',   href: '/dashboard/winnings', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  const accountItems = [
    { label: 'Subscription', href: '/dashboard/subscription', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { label: 'Profile',      href: '/dashboard/profile',      d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Settings',     href: '/dashboard/settings',     d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  const sidebarW = open ? 'w-[240px]' : 'w-[60px]'
  const mainML  = open ? 'ml-[240px]' : 'ml-[60px]'

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

      {/* ── Sidebar ── */}
      <aside className={`bg-[#1a1f1a] flex flex-col fixed h-full z-20 transition-all duration-300 ${sidebarW}`}>

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/[0.06] flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {open && (
            <div>
              <div className="text-white font-bold text-sm tracking-tight whitespace-nowrap">GolfGives</div>
              <div className="text-white/30 text-[10px] tracking-widest uppercase whitespace-nowrap">Play · Win · Give</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
          {open && <div className="text-white/20 text-[10px] uppercase tracking-widest px-3 pb-2 pt-1">Menu</div>}
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href} title={!open ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${isActive ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.d} />
                </svg>
                {open && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}

          {open && <div className="text-white/20 text-[10px] uppercase tracking-widest px-3 pb-2 pt-4">Account</div>}
          {accountItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href} title={!open ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${isActive ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.d} />
                </svg>
                {open && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user */}
        <div className="p-2 border-t border-white/[0.06]">
          {open ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-bold text-green-400 flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white/80 truncate">{profile?.full_name}</div>
                <div className="text-[10px] text-green-400/70">Pro Subscriber</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-bold text-green-400">
                {initials}
              </div>
            </div>
          )}
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            title="Sign out"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/25 hover:text-red-400 transition mt-1
              ${!open ? 'justify-center' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {open && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-4 z-30 w-7 h-7 bg-[#1a1f1a] border border-white/10 rounded-full
          flex items-center justify-center text-white/50 hover:text-white transition-all duration-300
          ${open ? 'left-[226px]' : 'left-[46px]'}`}>
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ── Page content ── */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${mainML}`}>
        {children}
      </div>

    </div>
  )
}