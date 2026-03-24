'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Scores() {
  const router = useRouter()
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [score, setScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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
    const { data } = await supabase
      .from('scores').select('*').eq('user_id', uid)
      .order('played_at', { ascending: false })
    setScores(data || [])
  }

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const val = parseInt(score)

    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    setAdding(true)

    // If already 5 scores, delete the oldest one first
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }

    const { error: insertError } = await supabase.from('scores').insert({
      user_id: userId,
      score: val,
      played_at: date
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess('Score added successfully!')
      setScore('')
      setDate(new Date().toISOString().split('T')[0])
      await fetchScores(userId)
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('scores').delete().eq('id', id)
    await fetchScores(userId)
  }

  const getScoreColor = (s: number) => {
    if (s >= 35) return 'text-green-400'
    if (s >= 25) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBarColor = (s: number) => {
    if (s >= 35) return 'bg-green-400'
    if (s >= 25) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050a06] flex items-center justify-center">
      <div className="text-green-400 text-sm animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#050a06] text-white">

      {/* Sidebar */}
      <aside className="w-[220px] bg-[#080f09] border-r border-white/5 flex flex-col p-4 fixed h-full">
        <div className="text-lg font-bold text-green-400 px-2 pb-5 tracking-tight">GolfGives</div>
        {[
          { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { label: 'My Scores', href: '/dashboard/scores', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', active: true },
          { label: 'Draw History', href: '/dashboard/draws', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
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
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">My Scores</h1>
          <p className="text-xs text-white/25 mt-1">
            {scores.length}/5 scores logged · Stableford format (1–45)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Add score form */}
          <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-5">Log new score</h3>

            {error && (
              <div className="bg-red-500/8 border border-red-500/15 text-red-400 text-xs px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/8 border border-green-500/15 text-green-400 text-xs px-4 py-3 rounded-xl mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Stableford Score (1–45)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                  placeholder="e.g. 32"
                  className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-green-400/50 rounded-xl px-4 py-3 text-white text-2xl font-bold placeholder-white/15 outline-none transition text-center"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Date played
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-green-400/50 rounded-xl px-4 py-3 text-white outline-none transition"
                />
              </div>

              {/* Score guide */}
              <div className="grid grid-cols-3 gap-2 py-2">
                {[
                  { range: '1–24', label: 'Below avg', color: 'text-red-400', bg: 'bg-red-400/8' },
                  { range: '25–34', label: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-400/8' },
                  { range: '35–45', label: 'Excellent', color: 'text-green-400', bg: 'bg-green-400/8' },
                ].map((g) => (
                  <div key={g.range} className={`${g.bg} rounded-xl p-2.5 text-center`}>
                    <div className={`text-xs font-bold ${g.color}`}>{g.range}</div>
                    <div className="text-xs text-white/25 mt-0.5">{g.label}</div>
                  </div>
                ))}
              </div>

              {scores.length >= 5 && (
                <div className="bg-yellow-400/8 border border-yellow-400/15 text-yellow-400 text-xs px-4 py-3 rounded-xl">
                  ⚠️ Adding this will remove your oldest score
                </div>
              )}

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-green-400 hover:bg-green-300 disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm transition">
                {adding ? 'Saving...' : '+ Add score'}
              </button>
            </form>
          </div>

          {/* Scores list */}
          <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-semibold">Score history</h3>
              <span className="text-xs text-white/25">{scores.length}/5 slots used</span>
            </div>

            {scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">⛳</div>
                <div className="text-sm text-white/25">No scores yet</div>
                <div className="text-xs text-white/15 mt-1">Log your first round to get started</div>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((s, i) => (
                  <div key={s.id}
                    className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <div className="w-6 text-xs text-white/20 font-mono">#{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/30">
                          {new Date(s.played_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                        <span className={`text-xl font-bold ${getScoreColor(s.score)}`}>
                          {s.score}
                        </span>
                      </div>
                      <div className="bg-white/[0.04] rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${getBarColor(s.score)}`}
                          style={{ width: `${(s.score / 45) * 100}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-white/15 hover:text-red-400 transition p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Slot indicators */}
            <div className="flex gap-2 mt-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    i < scores.length ? 'bg-green-400' : 'bg-white/[0.08]'
                  }`} />
              ))}
            </div>
            <div className="text-xs text-white/20 mt-2 text-center">
              {5 - scores.length === 0
                ? 'All 5 slots filled — next score replaces oldest'
                : `${5 - scores.length} slot${5 - scores.length > 1 ? 's' : ''} remaining`}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}