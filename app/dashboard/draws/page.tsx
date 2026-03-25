'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Draws() {
  const router = useRouter()
  const [draws, setDraws] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      const { data: d } = await supabase.from('draws').select('*').order('draw_date', { ascending: false })
      setDraws(d || [])

      const { data: s } = await supabase.from('scores').select('*').eq('user_id', user.id)
      setScores(s || [])

      setLoading(false)
    }
    load()
  }, [])

  const parseDrawnNumbers = (raw: any): number[] => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(Number)
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(Number)
      } catch {
        const cleaned = raw.replace(/[{}]/g, '')
        if (cleaned) return cleaned.split(',').map(Number)
      }
    }
    return []
  }

  const getMatches = (rawNumbers: any): number[] => {
    const drawnNumbers = parseDrawnNumbers(rawNumbers)
    const userScoreValues = scores.map(s => Number(s.score))
    return drawnNumbers.filter(n => userScoreValues.includes(n))
  }

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length * 10) / 10
    : 0

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  const mockDraws = [
    { id: 'mock-0', draw_date: '2026-03-01', drawn_numbers: [32, 14, 27, 41, 9],  total_pool: 310000 },
    { id: 'mock-1', draw_date: '2026-02-01', drawn_numbers: [5, 18, 33, 22, 40],  total_pool: 280000 },
    { id: 'mock-2', draw_date: '2026-01-01', drawn_numbers: [11, 29, 7, 38, 16],  total_pool: 250000 },
    { id: 'mock-3', draw_date: '2025-12-01', drawn_numbers: [3, 19, 28, 35, 42],  total_pool: 220000 },
  ]

  const displayDraws = draws.length > 0 ? draws : mockDraws

  const currentDraw = {
    title: 'March 2026 Draw',
    subtitle: 'Monthly prize draw — entries close 31 March',
    daysLeft: 7,
    totalEntries: scores.length,
    maxEntries: 5,
    prizes: [
      { label: '5-Match Jackpot', pct: '40% pool share', amt: '₹1,24,000', icon: '🏆', bg: 'bg-yellow-50 border-yellow-200' },
      { label: '4-Match',         pct: '35% pool share', amt: '₹1,08,500', icon: '⚡', bg: 'bg-green-50 border-green-200' },
      { label: '3-Match',         pct: '25% pool share', amt: '₹77,500',   icon: '⚡', bg: 'bg-green-50 border-green-200' },
    ],
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Loading...</div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1a1f1a] flex flex-col fixed h-full z-10">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight">GolfGives</div>
              <div className="text-white/30 text-[10px] tracking-widest uppercase">Play · Win · Give</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="text-white/20 text-[10px] uppercase tracking-widest px-3 pb-2 pt-1">Menu</div>
          {[
            { label: 'Dashboard',  href: '/dashboard',          active: false, d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { label: 'My Scores',  href: '/dashboard/scores',   active: false, d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { label: 'Draws',      href: '/dashboard/draws',    active: true,  d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Charities',  href: '/dashboard/charity',  active: false, d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
            { label: 'Winnings',   href: '/dashboard/winnings', active: false, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${item.active ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.d} />
              </svg>
              {item.label}
            </Link>
          ))}
          <div className="text-white/20 text-[10px] uppercase tracking-widest px-3 pb-2 pt-4">Account</div>
          {[
            { label: 'Subscription', href: '/dashboard/subscription', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { label: 'Profile',      href: '/dashboard/profile',      d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Settings',     href: '/dashboard/settings',     d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.d} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-bold text-green-400">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/80 truncate">{profile?.full_name}</div>
              <div className="text-[10px] text-green-400/70">Pro Subscriber</div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/25 hover:text-red-400 transition mt-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[240px] flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-base font-semibold text-gray-900">Draws</h1>
          </div>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <div className="p-8 space-y-5">

          {/* Current Draw Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentDraw.title}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{currentDraw.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentDraw.daysLeft} days left
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {currentDraw.prizes.map((p) => (
                <div key={p.label} className={`border rounded-2xl p-4 ${p.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{p.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{p.amt}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.pct}</div>
                </div>
              ))}
            </div>

            {/* Live score progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Scores logged this month</span>
                <span className="font-semibold text-gray-700">
                  {currentDraw.totalEntries} / {currentDraw.maxEntries}
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentDraw.totalEntries / currentDraw.maxEntries) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {currentDraw.totalEntries >= currentDraw.maxEntries
                  ? '✅ All 5 scores logged — you are fully entered!'
                  : `Log ${currentDraw.maxEntries - currentDraw.totalEntries} more score${currentDraw.maxEntries - currentDraw.totalEntries > 1 ? 's' : ''} to complete your entry`}
              </p>
            </div>

            {scores.length >= 3 ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-800">You're entered in this month's draw!</div>
                  <div className="text-xs text-green-600 mt-0.5">
                    Your average score of {avgScore} qualifies. Good luck! 🍀
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-800">
                    Log more scores to enter ({scores.length}/3 minimum)
                  </div>
                  <div className="text-xs text-yellow-600 mt-0.5">
                    You need at least 3 scores to qualify for the draw.
                  </div>
                </div>
                <Link href="/dashboard/scores"
                  className="text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg transition flex-shrink-0">
                  Add scores →
                </Link>
              </div>
            )}
          </div>

          {/* Draw History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Draw History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your past draw results and winnings</p>
            </div>

            <div className="divide-y divide-gray-100">
              {displayDraws.map((draw, index) => {
                const matchedNums = getMatches(draw.drawn_numbers)
                const matchCount = matchedNums.length
                const won = matchCount >= 3
                const isLatest = index === 0
                const matchLabel =
                  matchCount === 5 ? '5-Match Jackpot 🏆' :
                  matchCount === 4 ? '4-Match ⚡' :
                  matchCount === 3 ? '3-Match ✅' :
                  matchCount === 2 ? '2 matched' :
                  matchCount === 1 ? '1 matched' : 'No match'
                const prize =
                  matchCount === 5 ? Math.round(draw.total_pool * 0.4) :
                  matchCount === 4 ? Math.round(draw.total_pool * 0.35) :
                  matchCount === 3 ? Math.round(draw.total_pool * 0.25) : 0

                return (
                  <div key={draw.id}
                    className={`px-6 py-4 hover:bg-gray-50/50 transition ${isLatest ? 'bg-green-50/30' : ''}`}>
                    <div className="flex items-center gap-4">

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${won ? 'bg-green-50' : isLatest ? 'bg-blue-50' : 'bg-gray-100'}`}>
                        {won ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        ) : isLatest ? (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(draw.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                          </div>
                          {isLatest && (
                            <span className="text-xs bg-blue-100 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{matchLabel}</div>
                      </div>

                      {/* Number bubbles */}
                      <div className="hidden md:flex gap-1.5">
                        {parseDrawnNumbers(draw.drawn_numbers).map((n: number) => {
                          const isMatch = scores.map(s => Number(s.score)).includes(n)
                          return (
                            <div key={n}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border
                                ${isMatch
                                  ? 'bg-green-100 border-green-400 text-green-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                              {n}
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {won && prize > 0 && (
                          <span className="text-sm font-bold text-gray-900">
                            ₹{prize.toLocaleString('en-IN')}
                          </span>
                        )}
                        {won ? (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            Won
                          </span>
                        ) : isLatest ? (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                            In progress
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="text-gray-300 text-base leading-none">—</span>
                            <span>No win</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}