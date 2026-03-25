'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SparklineChart({ scores }: { scores: any[] }) {
  if (scores.length === 0) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">No scores yet — add your first round</div>
  )
  const data = [...scores].reverse()
  const values = data.map(s => s.score)
  const min = 20
  const max = 45
  const width = 800, height = 220
  const padding = { top: 20, right: 30, bottom: 40, left: 45 }
  const xStep = (width - padding.left - padding.right) / Math.max(data.length - 1, 1)
  const yScale = (v: number) => padding.top + ((max - v) / (max - min)) * (height - padding.top - padding.bottom)
  const points = data.map((s, i) => ({
    x: padding.left + i * xStep,
    y: yScale(s.score),
    date: new Date(s.played_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
  }))

  // Smooth curve using cubic bezier
  const smoothPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`
  }, '')

  const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
  const yLabels = [45, 34, 27, 20].map(v => ({ val: v, y: yScale(v) }))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map((l) => (
        <g key={l.val}>
          <line x1={padding.left} y1={l.y} x2={width - padding.right} y2={l.y}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 5" />
          <text x={padding.left - 8} y={l.y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{l.val}</text>
        </g>
      ))}
      {/* X axis line */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom}
        stroke="#e5e7eb" strokeWidth="1" />
      {/* Area */}
      <path d={areaPath} fill="url(#scoreGrad)" />
      {/* Line */}
      <path d={smoothPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#22c55e" />
          <circle cx={p.x} cy={p.y} r="2" fill="white" />
          <text x={p.x} y={height - 10} textAnchor="middle" fill="#9ca3af" fontSize="10">{p.date}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Scores() {
  const router = useRouter()
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [score, setScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [course, setCourse] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      await fetchScores(user.id)
      setLoading(false)
    }
    load()
  }, [])

  const fetchScores = async (uid: string) => {
    const { data } = await supabase.from('scores').select('*').eq('user_id', uid)
      .order('played_at', { ascending: false })
    setScores(data || [])
  }

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const val = parseInt(score)
    if (isNaN(val) || val < 1 || val > 45) { setError('Score must be between 1 and 45'); return }
    setAdding(true)
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }
    const { error: insertError } = await supabase.from('scores').insert({
      user_id: userId, score: val, played_at: date,
      ...(course ? { course_name: course } : {})
    })
    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess('Score added!')
      setScore(''); setDate(new Date().toISOString().split('T')[0]); setCourse('')
      await fetchScores(userId)
      setTimeout(() => { setShowModal(false); setSuccess('') }, 1000)
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('scores').delete().eq('id', id)
    await fetchScores(userId)
  }

  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length * 10) / 10 : 0
  const bestScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  const getStatus = (s: number) => {
    if (s >= 38) return { label: 'Top 5', color: 'text-green-600 bg-green-50' }
    if (s >= 32) return { label: 'Top 10', color: 'text-blue-600 bg-blue-50' }
    return { label: 'Entered', color: 'text-gray-500 bg-gray-100' }
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
            { label: 'Dashboard', href: '/dashboard', active: false, d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { label: 'My Scores', href: '/dashboard/scores', active: true, d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { label: 'Draws', href: '/dashboard/draws', active: false, d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Charities', href: '/dashboard/charity', active: false, d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
            { label: 'Winnings', href: '/dashboard/winnings', active: false, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
            { label: 'Profile', href: '/dashboard/profile', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Settings', href: '/dashboard/settings', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
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

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-base font-semibold text-gray-900">My Scores</h1>
          </div>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <div className="p-8 space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Rolling Average', value: avgScore || '—',
                iconBg: 'bg-green-50',
                icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg>
              },
              {
                label: 'Best Score', value: bestScore || '—',
                iconBg: 'bg-orange-50',
                icon: <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              },
              {
                label: 'Rounds Played', value: `${scores.length} / 5`,
                iconBg: 'bg-blue-50',
                icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-0.5">{c.label}</div>
                  <div className="text-3xl font-bold text-gray-900">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-0.5">Recent Scores</h3>
            <p className="text-xs text-gray-400 mb-4">Last 5 Stableford scores</p>
            <div className="h-[240px]">
              <SparklineChart scores={scores} />
            </div>
          </div>

          {/* Score History Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Score History</h3>
                <p className="text-xs text-gray-400 mt-0.5">Your last {scores.length} submitted Stableford scores</p>
              </div>
              <button onClick={() => { setShowModal(true); setError(''); setSuccess('') }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Score
              </button>
            </div>

            {scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">⛳</div>
                <div className="text-sm font-medium text-gray-500">No scores yet</div>
                <div className="text-xs text-gray-400 mt-1">Log your first round to get started</div>
                <button onClick={() => setShowModal(true)}
                  className="mt-4 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                  + Add your first score
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Course</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Score</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => {
                    const status = getStatus(s.score)
                    return (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(s.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {s.course_name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900">{s.score}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                            </svg>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(s.id)}
                            className="text-gray-300 hover:text-red-400 transition p-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {/* Slot indicator */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < scores.length ? 'bg-green-500' : 'bg-gray-100'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {scores.length}/5 slots used
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Score Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Log New Score</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-4">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-3 rounded-xl mb-4">{success}</div>}

            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Stableford Score (1–45)
                </label>
                <input type="number" min="1" max="45" value={score} onChange={(e) => setScore(e.target.value)}
                  required placeholder="e.g. 36"
                  className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-2xl font-bold placeholder-gray-300 outline-none transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Course Name (optional)</label>
                <input type="text" value={course} onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. St Andrews Links"
                  className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Date Played</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  required max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none transition" />
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                {[
                  { range: '1–24', label: 'Below avg', color: 'text-red-500 bg-red-50 border-red-100' },
                  { range: '25–34', label: 'Average', color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
                  { range: '35–45', label: 'Excellent', color: 'text-green-600 bg-green-50 border-green-100' },
                ].map((g) => (
                  <div key={g.range} className={`border rounded-xl p-2.5 text-center ${g.color}`}>
                    <div className="text-xs font-bold">{g.range}</div>
                    <div className="text-xs opacity-70 mt-0.5">{g.label}</div>
                  </div>
                ))}
              </div>

              {scores.length >= 5 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-4 py-3 rounded-xl">
                  ⚠️ Adding this will remove your oldest score
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl text-sm transition">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition">
                  {adding ? 'Saving...' : '+ Add Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}