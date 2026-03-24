'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: p } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      const { data: s } = await supabase
        .from('scores').select('*').eq('user_id', user.id)
        .order('played_at', { ascending: false }).limit(5)
      setScores(s || [])
      setLoading(false)
    }
    load()
  }, [])

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
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
          { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
          { label: 'My Scores', href: '/dashboard/scores', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { label: 'Draw History', href: '/dashboard/draws', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'My Charity', href: '/dashboard/charity', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
          { label: 'Profile', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        ].map((item) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition mb-0.5
              ${item.active
                ? 'bg-green-400/10 text-green-400'
                : 'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}

        {/* Bottom user */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 transition w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-green-400/15 flex items-center justify-center text-xs font-bold text-green-400">
              {initials}
            </div>
            <div>
              <div className="text-xs font-medium text-white/60">{profile?.full_name}</div>
              <div className="text-xs text-green-400/60">
                {profile?.subscription_status === 'active' ? 'Pro · Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[220px] flex-1 p-8">

        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {greeting()}, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-white/25 mt-1">Next draw in 12 days · March 2026</p>
          </div>
          <div className={`text-xs px-3 py-1.5 rounded-full border ${
            profile?.subscription_status === 'active'
              ? 'bg-green-400/10 border-green-400/20 text-green-400'
              : 'bg-red-400/10 border-red-400/20 text-red-400'
          }`}>
            ● {profile?.subscription_status === 'active' ? 'Active subscriber' : 'Inactive'}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Subscription', value: profile?.subscription_status === 'active' ? 'Active' : 'Inactive', sub: 'Renews Apr 24, 2026', green: true },
            { label: 'Scores logged', value: `${scores.length} / 5`, sub: `${5 - scores.length} more to complete` },
            { label: 'Total winnings', value: '₹0', sub: '0 draws won', green: true },
            { label: 'Charity donated', value: '₹480', sub: '10% of subscription' },
          ].map((c) => (
            <div key={c.label} className="bg-[#0d1a10] border border-white/5 rounded-2xl p-5">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-2">{c.label}</div>
              <div className={`text-2xl font-bold ${c.green ? 'text-green-400' : 'text-white'}`}>{c.value}</div>
              <div className="text-xs text-white/20 mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Two column row */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Scores panel */}
          <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">My Scores</h3>
              <Link href="/dashboard/scores" className="text-xs text-green-400 hover:text-green-300">+ Add score</Link>
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/20 text-sm">No scores yet</div>
                <div className="text-white/10 text-xs mt-1">Add your first score to enter draws</div>
              </div>
            ) : (
              scores.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                  <div className="w-14">
                    <div className="text-xs font-medium">
                      {new Date(s.played_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-white/20">score</div>
                  </div>
                  <div className="flex-1 bg-white/[0.04] rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full transition-all"
                      style={{ width: `${(s.score / 45) * 100}%` }} />
                  </div>
                  <div className="text-lg font-bold text-green-400 w-8 text-right">{s.score}</div>
                </div>
              ))
            )}
            <Link href="/dashboard/scores"
              className="w-full mt-4 bg-green-400/[0.06] border border-dashed border-green-400/20 text-green-400 text-xs font-semibold py-3 rounded-xl flex items-center justify-center hover:bg-green-400/10 transition">
              + Log new score
            </Link>
          </div>

          {/* Draw panel */}
          <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Last Draw · Mar 1</h3>
              <Link href="/dashboard/draws" className="text-xs text-green-400">View all</Link>
            </div>
            <div className="text-xs text-white/25 mb-3">Drawn numbers</div>
            <div className="flex gap-2 mb-4">
              {[32, 14, 27, 41, 9].map((n) => (
                <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border
                  ${scores.some(s => s.score === n)
                    ? 'bg-green-400/20 border-green-400 text-green-400'
                    : 'bg-white/[0.04] border-white/10 text-white/40'}`}>
                  {n}
                </div>
              ))}
            </div>
            <div className="text-xs text-white/25 mb-1">Your matches</div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {scores.filter(s => [32, 14, 27, 41, 9].includes(s.score)).length} matches
            </div>
            <div className="text-xs text-white/20 mb-4">Need 3+ to win a prize</div>
            <div className="space-y-2">
              {[
                { match: '5 match', pct: '40% pool', amt: '₹1,24,000' },
                { match: '4 match', pct: '35% pool', amt: '₹1,08,500' },
                { match: '3 match', pct: '25% pool', amt: '₹77,500' },
              ].map((p) => (
                <div key={p.match} className="flex justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-white/35">{p.match}</span>
                  <span>
                    <span className="text-white/20">{p.pct} · </span>
                    <span className="text-green-400 font-semibold">{p.amt}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charity panel */}
        <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">My Charity</h3>
            <Link href="/dashboard/charity" className="text-xs text-green-400">Change charity</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-400/[0.08] border border-green-400/10 flex items-center justify-center text-lg">
              🌱
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {profile?.charity_id ? 'Your selected charity' : 'No charity selected yet'}
              </div>
              <div className="text-xs text-white/25 mt-0.5">
                {profile?.charity_percentage || 10}% of your subscription · ₹480/month
              </div>
              <div className="mt-2 bg-white/[0.04] rounded-full h-1">
                <div className="bg-green-400 h-1 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">₹480</div>
              <div className="text-xs text-white/20">contributed</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}