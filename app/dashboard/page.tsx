'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SparklineChart({ scores }: { scores: any[] }) {
  if (scores.length === 0) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">No scores yet</div>
  )
  const data = [...scores].reverse()
  const values = data.map(s => s.score)
  const min = Math.min(...values) - 5
  const max = Math.max(...values) + 5
  const width = 440, height = 180
  const padding = { top: 20, right: 20, bottom: 30, left: 35 }
  const xStep = (width - padding.left - padding.right) / Math.max(data.length - 1, 1)
  const yScale = (v: number) => padding.top + ((max - v) / (max - min)) * (height - padding.top - padding.bottom)
  const points = data.map((s, i) => ({
    x: padding.left + i * xStep,
    y: yScale(s.score),
    date: new Date(s.played_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
  const yLabels = [max, Math.round((max + min) / 2), min].map(v => ({ val: Math.round(v), y: yScale(v) }))
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yLabels.map((l) => (
        <g key={l.val}>
          <line x1={padding.left} y1={l.y} x2={width - padding.right} y2={l.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <text x={padding.left - 6} y={l.y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">{l.val}</text>
        </g>
      ))}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#22c55e" />
          <circle cx={p.x} cy={p.y} r="2" fill="white" />
          <text x={p.x} y={height - 5} textAnchor="middle" fill="#9ca3af" fontSize="9">{p.date}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: s } = await supabase.from('scores').select('*').eq('user_id', user.id)
        .order('played_at', { ascending: false }).limit(5)
      setScores(s || [])
      setLoading(false)
    }
    load()
  }, [])

  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length * 10) / 10 : 0

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Loading...</div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
        <button className="relative text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      <div className="p-8 space-y-5">
        <div className="bg-green-600 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">Pro Subscription</span>
                <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white/70 text-xs">Renews April 18, 2026</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/subscription" className="bg-white text-gray-900 text-sm font-semibold px-5 py-2 rounded-xl hover:bg-gray-50 transition">
            Manage Plan
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Average Score', value: avgScore || '—', sub: 'Stableford pts', trend: scores.length >= 2 ? '+2.4 from last month' : null, iconBg: 'bg-green-50', icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg> },
            { label: 'Draws Entered', value: scores.length, sub: '3 upcoming', trend: null, iconBg: 'bg-yellow-50', icon: <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
            { label: 'Charity Given', value: '₹480', sub: 'Across 1 charity', trend: '+₹15 this month', iconBg: 'bg-pink-50', icon: <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
            { label: 'Total Winnings', value: '₹0', sub: '0 prizes claimed', trend: null, iconBg: 'bg-blue-50', icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{c.label}</span>
                <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>{c.icon}</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
              {c.trend && (
                <div className="flex items-center gap-1 mt-1.5">
                  <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  <span className="text-xs text-green-600 font-medium">{c.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Recent Scores</h3>
            <p className="text-xs text-gray-400 mb-4">Last 5 Stableford scores</p>
            <div className="h-[200px]"><SparklineChart scores={scores} /></div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">March Draw</h3>
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                7 DAYS LEFT
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: '5-Match Jackpot', sub: '40% pool share', amt: '₹1,24,000', icon: '🏆', bg: 'bg-yellow-50' },
                { label: '4-Match', sub: '35% pool share', amt: '₹1,08,500', icon: '⚡', bg: 'bg-blue-50' },
                { label: '3-Match', sub: '25% pool share', amt: '₹77,500', icon: '⚡', bg: 'bg-blue-50' },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center text-base flex-shrink-0`}>{p.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{p.label}</div>
                    <div className="text-xs text-gray-400">{p.sub}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{p.amt}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Entries this month</span>
                <span className="font-semibold text-gray-700">{scores.length} / 5</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(scores.length / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Your Charity Impact</h3>
              <div className="flex items-center gap-1 text-sm font-bold text-red-500"><span>❤️</span><span>₹480 total</span></div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Golf Foundation India', pct: 15, amt: '₹45.00' },
                { name: 'Caddie Trust Fund', pct: 10, amt: '₹30.00' },
              ].map((ch) => (
                <div key={ch.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-base flex-shrink-0">🌱</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{ch.name}</div>
                    <div className="text-xs text-gray-400">{ch.pct}% of subscription</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{ch.amt}</div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/charity" className="mt-4 w-full block text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold py-2.5 rounded-xl transition">
              Change Charity
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {scores.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4">No activity yet</div>
              ) : (
                scores.slice(0, 3).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">Score submitted</div>
                      <div className="text-xs text-gray-400">{s.score} points · Stableford</div>
                    </div>
                    <div className="text-xs text-gray-400">{i === 0 ? '2 hours ago' : new Date(s.played_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                ))
              )}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Draw entered</div>
                  <div className="text-xs text-gray-400">March 2026 draw</div>
                </div>
                <div className="text-xs text-gray-400">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}