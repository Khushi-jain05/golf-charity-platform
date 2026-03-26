'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPanel() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [draws, setDraws] = useState<any[]>([])
  const [winners, setWinners] = useState<any[]>([])
  const [charities, setCharities] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [drawNumbers, setDrawNumbers] = useState<number[]>([])
  const [simResult, setSimResult] = useState<any[]>([])
  const [simulating, setSimulating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [drawSuccess, setDrawSuccess] = useState('')

  const [newCharity, setNewCharity] = useState({ name: '', description: '', website: '', is_featured: false })
  const [addingCharity, setAddingCharity] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If no profile or not admin, redirect to dashboard
      if (!p || p.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setProfile(p)
      setAuthChecked(true)

      // Load all data in parallel
      const [u, d, w, c, s] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('draws').select('*').order('draw_date', { ascending: false }),
        supabase.from('winners').select('*, profiles(full_name, email), draws(draw_date)').order('created_at', { ascending: false }),
        supabase.from('charities').select('*').order('created_at', { ascending: false }),
        supabase.from('scores').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      ])

      setUsers(u.data || [])
      setDraws(d.data || [])
      setWinners(w.data || [])
      setCharities(c.data || [])
      setScores(s.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const generateNumbers = () => {
    const nums: number[] = []
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!nums.includes(n)) nums.push(n)
    }
    setDrawNumbers(nums)
    setSimResult([])
    setDrawSuccess('')
  }

  const simulateDraw = async () => {
    if (drawNumbers.length !== 5) return
    setSimulating(true)

    const { data: allScores } = await supabase
      .from('scores')
      .select('*, profiles(full_name, email)')

    const userMap: Record<string, any> = {}
    allScores?.forEach(s => {
      if (!userMap[s.user_id]) {
        userMap[s.user_id] = {
          user_id: s.user_id,
          name: s.profiles?.full_name || 'Unknown',
          email: s.profiles?.email || '',
          scores: []
        }
      }
      userMap[s.user_id].scores.push(Number(s.score))
    })

    const results = Object.values(userMap).map((u: any) => {
      const matched = u.scores.filter((sc: number) => drawNumbers.includes(sc))
      return { ...u, matched, matchCount: matched.length }
    }).filter(u => u.matchCount >= 3).sort((a, b) => b.matchCount - a.matchCount)

    setSimResult(results)
    setSimulating(false)
  }

  const publishDraw = async () => {
    if (drawNumbers.length !== 5) return
    setPublishing(true)

    const activeUsers = users.filter(u => u.subscription_status === 'active').length
    const totalPool = Math.round(activeUsers * 599 * 0.5)

    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .insert({
        draw_date: new Date().toISOString().split('T')[0],
        drawn_numbers: drawNumbers,
        status: 'published',
        total_pool: totalPool,
        jackpot_rolled_over: simResult.filter(r => r.matchCount === 5).length === 0
      })
      .select()
      .single()

    if (drawError || !draw) {
      console.error('Draw insert error:', drawError)
      setPublishing(false)
      return
    }

    for (const winner of simResult) {
      const pct = winner.matchCount === 5 ? 0.4 : winner.matchCount === 4 ? 0.35 : 0.25
      const prize = Math.round(totalPool * pct)
      await supabase.from('winners').insert({
        draw_id: draw.id,
        user_id: winner.user_id,
        match_type: `${winner.matchCount}-Match`,
        prize_amount: prize,
        status: 'pending'
      })
    }

    setDrawSuccess(`Draw published! ${simResult.length} winner${simResult.length !== 1 ? 's' : ''} found.`)
    setDrawNumbers([])
    setSimResult([])
    setPublishing(false)

    const { data: d } = await supabase.from('draws').select('*').order('draw_date', { ascending: false })
    setDraws(d || [])
  }

  const updateWinnerStatus = async (id: string, status: string) => {
    await supabase.from('winners').update({ status }).eq('id', id)
    const { data: w } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_date)')
      .order('created_at', { ascending: false })
    setWinners(w || [])
  }

  const handleAddCharity = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingCharity(true)
    await supabase.from('charities').insert({ ...newCharity, total_raised: 0 })
    setNewCharity({ name: '', description: '', website: '', is_featured: false })
    const { data: c } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    setCharities(c || [])
    setAddingCharity(false)
  }

  const deleteCharity = async (id: string) => {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    setCharities(c => c.filter(x => x.id !== id))
  }

  const activeUsersCount = users.filter(u => u.subscription_status === 'active').length
  const totalPool = Math.round(activeUsersCount * 599 * 0.5)
  const totalCharity = Math.round(activeUsersCount * 599 * 0.1)
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A'

  // Show nothing while checking auth (prevents flash of dashboard)
  if (!authChecked && loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Checking access...</div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Loading admin panel...</div>
    </div>
  )

  const tabs = [
    { id: 'overview',  label: 'Overview',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'draws',     label: 'Draw Engine', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'winners',   label: 'Winners',     icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { id: 'users',     label: 'Users',       icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'charities', label: 'Charities',   icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top navbar */}
      <header className="bg-[#1a1f1a] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm">GolfGives</span>
            <span className="text-white/40 text-xs ml-2">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-white/50 hover:text-white text-xs transition">
            ← Back to app
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xs font-bold text-green-400">
              {initials}
            </div>
            <span className="text-xs text-white/60">{profile?.full_name}</span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-xs text-white/30 hover:text-red-400 transition">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-[220px] bg-white border-r border-gray-100 min-h-[calc(100vh-57px)] sticky top-[57px]">
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-left
                  ${activeTab === tab.id
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Overview</h1>
                <p className="text-sm text-gray-400 mt-0.5">Platform stats at a glance</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: users.length, sub: `${activeUsersCount} active`, iconBg: 'bg-blue-50', icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                  { label: 'Prize Pool', value: `₹${totalPool.toLocaleString('en-IN')}`, sub: 'This month', iconBg: 'bg-yellow-50', icon: <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                  { label: 'Charity Pool', value: `₹${totalCharity.toLocaleString('en-IN')}`, sub: 'This month', iconBg: 'bg-pink-50', icon: <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
                  { label: 'Total Draws', value: draws.length, sub: `${winners.length} total winners`, iconBg: 'bg-green-50', icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs text-gray-400 font-medium">{c.label}</span>
                      <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>{c.icon}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Recent Draws</h3>
                </div>
                {draws.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No draws yet — run your first draw!</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Date</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Numbers</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Pool</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draws.slice(0, 5).map(d => (
                        <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(d.draw_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              {(Array.isArray(d.drawn_numbers) ? d.drawn_numbers : []).map((n: number) => (
                                <span key={n} className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{n}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{Number(d.total_pool).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>{d.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DRAW ENGINE ── */}
          {activeTab === 'draws' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Draw Engine</h1>
                <p className="text-sm text-gray-400 mt-0.5">Generate, simulate and publish monthly draws</p>
              </div>
              {drawSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">✓ {drawSuccess}</div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Step 1 — Generate Numbers</h3>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {drawNumbers.length > 0
                      ? drawNumbers.map((n, i) => (
                          <div key={i} className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-400 text-green-700 font-bold text-lg flex items-center justify-center">{n}</div>
                        ))
                      : Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-12 h-12 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-300 font-bold text-lg flex items-center justify-center">?</div>
                        ))}
                  </div>
                  <button onClick={generateNumbers} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl text-sm transition">
                    🎲 Generate Random Numbers
                  </button>
                  {drawNumbers.length === 5 && (
                    <button onClick={simulateDraw} disabled={simulating}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition">
                      {simulating ? 'Simulating...' : '🔍 Simulate Draw (Preview)'}
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Step 2 — Simulation Results</h3>
                  {simResult.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      {drawNumbers.length === 5 ? 'Click simulate to preview winners' : 'Generate numbers first'}
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {simResult.map((r, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-400">{r.email}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.matchCount === 5 ? 'bg-yellow-100 text-yellow-700' : r.matchCount === 4 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {r.matchCount}-Match
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Matched: {r.matched.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {drawNumbers.length === 5 && (
                    <button onClick={publishDraw} disabled={publishing}
                      className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition">
                      {publishing ? 'Publishing...' : `🚀 Publish Draw (${simResult.length} winners)`}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Draw History</h3></div>
                {draws.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No draws published yet</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Date</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Numbers</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Pool</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Jackpot</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draws.map(d => (
                        <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(d.draw_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              {(Array.isArray(d.drawn_numbers) ? d.drawn_numbers : []).map((n: number) => (
                                <span key={n} className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{n}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{Number(d.total_pool).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            {d.jackpot_rolled_over
                              ? <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Rolled over</span>
                              : <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Won</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>{d.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── WINNERS ── */}
          {activeTab === 'winners' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Winners Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">Verify and manage prize payouts</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {winners.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm"><div className="text-4xl mb-3">🏆</div>No winners yet — publish a draw first</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Winner</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Draw</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Tier</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Prize</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Status</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map(w => (
                        <tr key={w.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{w.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{w.profiles?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{w.match_type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{Number(w.prize_amount).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${w.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : w.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {w.status === 'pending' && (
                              <button onClick={() => updateWinnerStatus(w.id, 'approved')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition">Approve</button>
                            )}
                            {w.status === 'approved' && (
                              <button onClick={() => updateWinnerStatus(w.id, 'paid')} className="text-xs bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg transition">Mark Paid</button>
                            )}
                            {w.status === 'paid' && <span className="text-xs text-green-600 font-medium">✓ Complete</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">{users.length} total users · {activeUsersCount} active</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">User</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Role</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Subscription</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Scores</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const userScores = scores.filter(s => s.user_id === u.id)
                      return (
                        <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                                {u.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{u.full_name || 'Unknown'}</div>
                                <div className="text-xs text-gray-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                              {u.role || 'subscriber'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${u.subscription_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {u.subscription_status || 'inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{userScores.length} / 5</td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CHARITIES ── */}
          {activeTab === 'charities' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Charity Management</h1>
                <p className="text-sm text-gray-400 mt-0.5">{charities.length} charities listed</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Charity</h3>
                <form onSubmit={handleAddCharity} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Charity Name</label>
                    <input value={newCharity.name} onChange={e => setNewCharity(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. CRY India" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Website (optional)</label>
                    <input value={newCharity.website} onChange={e => setNewCharity(p => ({ ...p, website: e.target.value }))} placeholder="https://..." className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <textarea value={newCharity.description} onChange={e => setNewCharity(p => ({ ...p, description: e.target.value }))} required rows={2} placeholder="Brief description" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none" />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newCharity.is_featured} onChange={e => setNewCharity(p => ({ ...p, is_featured: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                      <span className="text-sm text-gray-600">Mark as featured</span>
                    </label>
                    <button type="submit" disabled={addingCharity} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
                      {addingCharity ? 'Adding...' : '+ Add Charity'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {charities.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No charities yet — add one above!</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Charity</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Total Raised</th>
                        <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Featured</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {charities.map(c => (
                        <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{c.description}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{Number(c.total_raised).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            {c.is_featured
                              ? <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">Featured</span>
                              : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => deleteCharity(c.id)} className="text-gray-300 hover:text-red-400 transition">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}