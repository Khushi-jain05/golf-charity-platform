'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Winnings() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [winnings, setWinnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      // Try to fetch from a winnings table, fallback to mock
      const { data: w } = await supabase
        .from('winnings')
        .select('*')
        .eq('user_id', user.id)
        .order('won_at', { ascending: false })
      setWinnings(w || [])

      setLoading(false)
    }
    load()
  }, [])

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  // Use real data or mock
  const mockWinnings = [
    { id: 'm1', won_at: '2026-02-01', draw_name: 'February Draw', tier: '4-Match', amount: 18000, status: 'claimed' },
    { id: 'm2', won_at: '2025-12-01', draw_name: 'December Draw', tier: '3-Match', amount: 4500,  status: 'claimed' },
    { id: 'm3', won_at: '2025-10-01', draw_name: 'October Draw',  tier: '3-Match', amount: 5200,  status: 'claimed' },
    { id: 'm4', won_at: '2025-08-01', draw_name: 'August Draw',   tier: '3-Match', amount: 4300,  status: 'claimed' },
  ]

  const displayWinnings = winnings.length > 0 ? winnings : mockWinnings

  const totalWinnings = displayWinnings.reduce((a, w) => a + (w.amount || 0), 0)
  const drawsWon = displayWinnings.length
  const bestPrize = displayWinnings.length ? Math.max(...displayWinnings.map(w => w.amount || 0)) : 0
  const unclaimed = displayWinnings.filter(w => w.status === 'unclaimed')

  const handleExport = () => {
    const rows = [
      ['Date', 'Draw', 'Tier', 'Amount', 'Status'],
      ...displayWinnings.map(w => [
        new Date(w.won_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        w.draw_name,
        w.tier,
        `₹${(w.amount / 100).toFixed(2)}`,
        w.status,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'winnings.csv'; a.click()
    URL.revokeObjectURL(url)
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
            { label: 'My Scores', href: '/dashboard/scores',   active: false, d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { label: 'Draws',     href: '/dashboard/draws',    active: false, d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Charities', href: '/dashboard/charity',  active: false, d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
            { label: 'Winnings',  href: '/dashboard/winnings', active: true,  d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-base font-semibold text-gray-900">Winnings</h1>
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
                label: 'Total Winnings',
                value: `₹${(totalWinnings / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                iconBg: 'bg-blue-50',
                icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              },
              {
                label: 'Draws Won',
                value: drawsWon,
                iconBg: 'bg-yellow-50',
                icon: <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              },
              {
                label: 'Best Prize',
                value: `₹${(bestPrize / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                iconBg: 'bg-green-50',
                icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
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

          {/* Winnings History Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Winnings History</h3>
                <p className="text-xs text-gray-400 mt-0.5">All your prize draw winnings</p>
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>

            {displayWinnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-5xl mb-4">🏆</div>
                <div className="text-sm font-medium text-gray-500">No winnings yet</div>
                <div className="text-xs text-gray-400 mt-1">Keep playing draws to win prizes!</div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Draw</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Tier</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayWinnings.map((w) => (
                    <tr key={w.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(w.won_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {w.draw_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {w.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₹{(w.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        {w.status === 'claimed' ? (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                            Claimed
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                            Unclaimed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Unclaimed / All Clear banner */}
          {unclaimed.length > 0 ? (
            <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  You have {unclaimed.length} unclaimed prize{unclaimed.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Contact support to claim your winnings.
                </div>
              </div>
              <a href="mailto:support@golfgives.com"
                className="text-xs font-semibold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-xl transition">
                Contact support
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">No unclaimed prizes</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  All your winnings have been claimed. Keep playing to win more!
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}