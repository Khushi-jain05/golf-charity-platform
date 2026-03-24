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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: d } = await supabase
        .from('draws').select('*')
        .order('draw_date', { ascending: false })
      setDraws(d || [])

      const { data: s } = await supabase
        .from('scores').select('*').eq('user_id', user.id)
      setScores(s || [])

      setLoading(false)
    }
    load()
  }, [])

  const getMatches = (drawnNumbers: number[]) => {
    return scores.filter(s => drawnNumbers.includes(s.score)).length
  }

  const getMatchLabel = (count: number) => {
    if (count === 5) return { label: '🏆 Jackpot!', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' }
    if (count === 4) return { label: '🥈 4 Match', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' }
    if (count === 3) return { label: '🥉 3 Match', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' }
    if (count === 2) return { label: '2 matches', color: 'text-white/40', bg: 'bg-white/5 border-white/10' }
    if (count === 1) return { label: '1 match', color: 'text-white/40', bg: 'bg-white/5 border-white/10' }
    return { label: 'No match', color: 'text-white/20', bg: 'bg-white/[0.02] border-white/5' }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050a06] flex items-center justify-center">
      <div className="text-green-400 text-sm animate-pulse">Loading...</div>
    </div>
  )

  // Mock draws if none exist yet
  const displayDraws = draws.length > 0 ? draws : [
    {
      id: 'mock-1',
      draw_date: '2026-03-01',
      drawn_numbers: [32, 14, 27, 41, 9],
      status: 'published',
      total_pool: 310000,
      jackpot_rolled_over: false,
    },
    {
      id: 'mock-2',
      draw_date: '2026-02-01',
      drawn_numbers: [5, 18, 33, 22, 40],
      status: 'published',
      total_pool: 280000,
      jackpot_rolled_over: true,
    },
    {
      id: 'mock-3',
      draw_date: '2026-01-01',
      drawn_numbers: [11, 29, 7, 38, 16],
      status: 'published',
      total_pool: 250000,
      jackpot_rolled_over: false,
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#050a06] text-white">

      {/* Sidebar */}
      <aside className="w-[220px] bg-[#080f09] border-r border-white/5 flex flex-col p-4 fixed h-full">
        <div className="text-lg font-bold text-green-400 px-2 pb-5 tracking-tight">GolfGives</div>
        {[
          { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { label: 'My Scores', href: '/dashboard/scores', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { label: 'Draw History', href: '/dashboard/draws', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', active: true },
          { label: 'My Charity', href: '/dashboard/charity', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
          { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        ].map((item) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition mb-0.5
              ${item.active ? 'bg-green-400/10 text-green-400' : 'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 transition w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[220px] flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">Draw History</h1>
          <p className="text-xs text-white/25 mt-1">Monthly draws · Match your scores to win</p>
        </div>

        {/* How prizes work */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { match: '5 numbers', prize: '40% of pool', icon: '🏆', color: 'border-yellow-400/20 bg-yellow-400/5' },
            { match: '4 numbers', prize: '35% of pool', icon: '🥈', color: 'border-blue-400/20 bg-blue-400/5' },
            { match: '3 numbers', prize: '25% of pool', icon: '🥉', color: 'border-green-400/20 bg-green-400/5' },
          ].map((p) => (
            <div key={p.match} className={`border rounded-2xl p-4 text-center ${p.color}`}>
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="text-sm font-semibold">{p.match}</div>
              <div className="text-xs text-white/30 mt-1">{p.prize}</div>
            </div>
          ))}
        </div>

        {/* Draws list */}
        <div className="space-y-4">
          {displayDraws.map((draw, index) => {
            const matchCount = getMatches(draw.drawn_numbers)
            const matchInfo = getMatchLabel(matchCount)
            const isLatest = index === 0

            return (
              <div key={draw.id}
                className={`bg-[#0d1a10] border rounded-2xl p-6 transition
                  ${isLatest ? 'border-green-400/15' : 'border-white/5'}`}>

                {/* Draw header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {new Date(draw.draw_date).toLocaleDateString('en-IN', {
                            month: 'long', year: 'numeric'
                          })} Draw
                        </h3>
                        {isLatest && (
                          <span className="text-xs bg-green-400/10 border border-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                        {draw.jackpot_rolled_over && (
                          <span className="text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            Jackpot rolled over
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/25 mt-0.5">
                        Total pool · ₹{draw.total_pool.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${matchInfo.bg} ${matchInfo.color}`}>
                    {matchInfo.label}
                  </div>
                </div>

                {/* Drawn numbers */}
                <div className="mb-4">
                  <div className="text-xs text-white/25 mb-3">Drawn numbers</div>
                  <div className="flex gap-2">
                    {draw.drawn_numbers.map((n: number) => {
                      const isMatch = scores.some(s => s.score === n)
                      return (
                        <div key={n}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition
                            ${isMatch
                              ? 'bg-green-400/20 border-green-400 text-green-400 ring-2 ring-green-400/20'
                              : 'bg-white/[0.04] border-white/10 text-white/40'}`}>
                          {n}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Prize breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.04]">
                  {[
                    { label: '5 match · jackpot', amt: Math.round(draw.total_pool * 0.4) },
                    { label: '4 match', amt: Math.round(draw.total_pool * 0.35) },
                    { label: '3 match', amt: Math.round(draw.total_pool * 0.25) },
                  ].map((prize) => (
                    <div key={prize.label} className="text-center">
                      <div className="text-xs text-white/20 mb-1">{prize.label}</div>
                      <div className="text-sm font-bold text-green-400">
                        ₹{prize.amt.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Match message */}
                {matchCount >= 3 && (
                  <div className="mt-4 bg-green-400/8 border border-green-400/15 rounded-xl px-4 py-3 text-xs text-green-400">
                    🎉 You won this draw! Check your winnings in your profile.
                  </div>
                )}
                {matchCount < 3 && matchCount > 0 && (
                  <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-white/25">
                    You matched {matchCount} number{matchCount > 1 ? 's' : ''} — need 3+ to win. Keep playing!
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Next draw countdown */}
        <div className="mt-6 bg-[#0d1a10] border border-green-400/10 rounded-2xl p-6 text-center">
          <div className="text-xs text-white/25 mb-2">Next draw</div>
          <div className="text-2xl font-bold text-green-400 mb-1">April 1, 2026</div>
          <div className="text-xs text-white/20">Make sure your scores are up to date to participate</div>
          <Link href="/dashboard/scores"
            className="inline-block mt-4 bg-green-400/10 hover:bg-green-400/15 border border-green-400/20 text-green-400 text-xs font-semibold px-5 py-2.5 rounded-full transition">
            Update my scores →
          </Link>
        </div>

      </main>
    </div>
  )
}