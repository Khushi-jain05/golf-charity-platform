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
      try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.map(Number) } catch { return raw.replace(/[{}]/g, '').split(',').map(Number) }
    }
    return []
  }

  const getMatches = (raw: any) => parseDrawnNumbers(raw).filter(n => scores.map(s => Number(s.score)).includes(n))
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length * 10) / 10 : 0

  const mockDraws = [
    { id: 'm0', draw_date: '2026-03-01', drawn_numbers: [32, 14, 27, 41, 9], total_pool: 310000 },
    { id: 'm1', draw_date: '2026-02-01', drawn_numbers: [5, 18, 33, 22, 40], total_pool: 280000 },
    { id: 'm2', draw_date: '2026-01-01', drawn_numbers: [11, 29, 7, 38, 16], total_pool: 250000 },
    { id: 'm3', draw_date: '2025-12-01', drawn_numbers: [3, 19, 28, 35, 42], total_pool: 220000 },
  ]
  const displayDraws = draws.length > 0 ? draws : mockDraws

  const prizes = [
    { label: '5-Match Jackpot', pct: '40% pool share', amt: '₹1,24,000', icon: '🏆', bg: 'bg-yellow-50 border-yellow-200' },
    { label: '4-Match', pct: '35% pool share', amt: '₹1,08,500', icon: '⚡', bg: 'bg-green-50 border-green-200' },
    { label: '3-Match', pct: '25% pool share', amt: '₹77,500', icon: '⚡', bg: 'bg-green-50 border-green-200' },
  ]

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Draws</h1>
       
      </header>

      <div className="p-8 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">March 2026 Draw</h2>
              <p className="text-sm text-gray-400 mt-0.5">Monthly prize draw — entries close 31 March</p>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              7 days left
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {prizes.map((p) => (
              <div key={p.label} className={`border rounded-2xl p-4 ${p.bg}`}>
                <div className="flex items-center gap-2 mb-2"><span className="text-base">{p.icon}</span><span className="text-sm font-semibold text-gray-700">{p.label}</span></div>
                <div className="text-2xl font-bold text-gray-900">{p.amt}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.pct}</div>
              </div>
            ))}
          </div>
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Scores logged this month</span>
              <span className="font-semibold text-gray-700">{scores.length} / 5</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min((scores.length / 5) * 100, 100)}%` }} />
            </div>
          </div>
          {scores.length >= 3 ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-800">You're entered!</div>
                <div className="text-xs text-green-600 mt-0.5">Your rolling average of {avgScore} qualifies. Good luck! 🍀</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-yellow-800">Log more scores to enter ({scores.length}/3 minimum)</div>
                <div className="text-xs text-yellow-600 mt-0.5">You need at least 3 scores to qualify.</div>
              </div>
              <Link href="/dashboard/scores" className="text-xs font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg transition flex-shrink-0">Add scores →</Link>
            </div>
          )}
        </div>

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
              const matchLabel = matchCount === 5 ? '5-Match Jackpot 🏆' : matchCount === 4 ? '4-Match ⚡' : matchCount === 3 ? '3-Match ✅' : matchCount === 2 ? '2 matched' : matchCount === 1 ? '1 matched' : 'No match'
              const prize = matchCount === 5 ? Math.round(draw.total_pool * 0.4) : matchCount === 4 ? Math.round(draw.total_pool * 0.35) : matchCount === 3 ? Math.round(draw.total_pool * 0.25) : 0
              return (
                <div key={draw.id} className={`px-6 py-4 hover:bg-gray-50/50 transition ${isLatest ? 'bg-green-50/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${won ? 'bg-green-50' : isLatest ? 'bg-blue-50' : 'bg-gray-100'}`}>
                      {won ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{new Date(draw.draw_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                        {isLatest && <span className="text-xs bg-blue-100 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Latest</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{matchLabel}</div>
                    </div>
                    <div className="hidden md:flex gap-1.5">
                      {parseDrawnNumbers(draw.drawn_numbers).map((n: number) => {
                        const isMatch = scores.map(s => Number(s.score)).includes(n)
                        return (
                          <div key={n} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${isMatch ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>{n}</div>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {won && prize > 0 && <span className="text-sm font-bold text-gray-900">₹{prize.toLocaleString('en-IN')}</span>}
                      {won ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">Won</span>
                      ) : isLatest ? (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">In progress</span>
                      ) : (
                        <span className="text-xs text-gray-400">No win</span>
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
  )
}