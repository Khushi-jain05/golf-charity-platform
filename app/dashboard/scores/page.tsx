'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function SparklineChart({ scores }: { scores: any[] }) {
  if (scores.length === 0) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">No scores yet — add your first round</div>
  )
  const data = [...scores].reverse()
  const min = 20, max = 45
  const width = 800, height = 220
  const padding = { top: 20, right: 30, bottom: 40, left: 45 }
  const xStep = (width - padding.left - padding.right) / Math.max(data.length - 1, 1)
  const yScale = (v: number) => padding.top + ((max - v) / (max - min)) * (height - padding.top - padding.bottom)
  const points = data.map((s, i) => ({ x: padding.left + i * xStep, y: yScale(s.score), date: new Date(s.played_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) }))
  const smoothPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1], cpx = (prev.x + p.x) / 2
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
      {yLabels.map((l) => (
        <g key={l.val}>
          <line x1={padding.left} y1={l.y} x2={width - padding.right} y2={l.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 5" />
          <text x={padding.left - 8} y={l.y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{l.val}</text>
        </g>
      ))}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="1" />
      <path d={areaPath} fill="url(#scoreGrad)" />
      <path d={smoothPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      await fetchScores(user.id)
      setLoading(false)
    }
    load()
  }, [])

  const fetchScores = async (uid: string) => {
    const { data } = await supabase.from('scores').select('*').eq('user_id', uid).order('played_at', { ascending: false })
    setScores(data || [])
  }

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const val = parseInt(score)
    if (isNaN(val) || val < 1 || val > 45) { setError('Score must be between 1 and 45'); return }
    setAdding(true)
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }
    const { error: insertError } = await supabase.from('scores').insert({ user_id: userId, score: val, played_at: date, ...(course ? { course_name: course } : {}) })
    if (insertError) { setError(insertError.message) }
    else {
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
  const getStatus = (s: number) => {
    if (s >= 38) return { label: 'Top 5', color: 'text-green-600 bg-green-50' }
    if (s >= 32) return { label: 'Top 10', color: 'text-blue-600 bg-blue-50' }
    return { label: 'Entered', color: 'text-gray-500 bg-gray-100' }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">My Scores</h1>
        <button className="relative text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      <div className="p-8 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Rolling Average', value: avgScore || '—', iconBg: 'bg-green-50', icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg> },
            { label: 'Best Score', value: bestScore || '—', iconBg: 'bg-orange-50', icon: <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { label: 'Rounds Played', value: `${scores.length} / 5`, iconBg: 'bg-blue-50', icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>{c.icon}</div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-0.5">{c.label}</div>
                <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-0.5">Recent Scores</h3>
          <p className="text-xs text-gray-400 mb-4">Last 5 Stableford scores</p>
          <div className="h-[240px]"><SparklineChart scores={scores} /></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Score History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your last {scores.length} submitted Stableford scores</p>
            </div>
            <button onClick={() => { setShowModal(true); setError(''); setSuccess('') }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Score
            </button>
          </div>
          {scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">⛳</div>
              <div className="text-sm font-medium text-gray-500">No scores yet</div>
              <div className="text-xs text-gray-400 mt-1">Log your first round to get started</div>
              <button onClick={() => setShowModal(true)} className="mt-4 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">+ Add your first score</button>
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
                {scores.map((s) => {
                  const status = getStatus(s.score)
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.course_name || '—'}</td>
                      <td className="px-6 py-4"><span className="text-lg font-bold text-gray-900">{s.score}</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" /></svg>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-400 transition p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < scores.length ? 'bg-green-500' : 'bg-gray-100'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">{scores.length}/5 slots used</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Log New Score</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-4">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-3 rounded-xl mb-4">{success}</div>}
            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stableford Score (1–45)</label>
                <input type="number" min="1" max="45" value={score} onChange={(e) => setScore(e.target.value)} required placeholder="e.g. 36" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-2xl font-bold placeholder-gray-300 outline-none transition text-center" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Course Name (optional)</label>
                <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. St Andrews Links" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Date Played</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required max={new Date().toISOString().split('T')[0]} className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none transition" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ range: '1–24', label: 'Below avg', color: 'text-red-500 bg-red-50 border-red-100' }, { range: '25–34', label: 'Average', color: 'text-yellow-600 bg-yellow-50 border-yellow-100' }, { range: '35–45', label: 'Excellent', color: 'text-green-600 bg-green-50 border-green-100' }].map((g) => (
                  <div key={g.range} className={`border rounded-xl p-2.5 text-center ${g.color}`}>
                    <div className="text-xs font-bold">{g.range}</div>
                    <div className="text-xs opacity-70 mt-0.5">{g.label}</div>
                  </div>
                ))}
              </div>
              {scores.length >= 5 && <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-4 py-3 rounded-xl">⚠️ Adding this will remove your oldest score</div>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl text-sm transition">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition">{adding ? 'Saving...' : '+ Add Score'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}