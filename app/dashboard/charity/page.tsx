'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Charity() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [charities, setCharities] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: p } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setSelected(p?.charity_id || '')
      setPercentage(p?.charity_percentage || 10)

      const { data: c } = await supabase
        .from('charities').select('*').order('is_featured', { ascending: false })
      setCharities(c || [])

      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSuccess('')

    await supabase.from('profiles').update({
      charity_id: selected,
      charity_percentage: percentage
    }).eq('id', userId)

    setSuccess('Charity preference saved!')
    setSaving(false)
  }

  const monthlyAmount = () => {
    const base = profile?.subscription_plan === 'yearly' ? 4800 : 599
    return Math.round((base * percentage) / 100)
  }

  // Mock charities if none in DB
  const displayCharities = charities.length > 0 ? charities : [
    { id: 'c1', name: 'CRY — Child Rights', description: 'Ensuring rights and improving lives of underprivileged children across India.', is_featured: true, total_raised: 125000, emoji: '👶' },
    { id: 'c2', name: 'Goonj', description: 'Addressing basic needs in disaster and development work across rural India.', is_featured: false, total_raised: 98000, emoji: '🤝' },
    { id: 'c3', name: 'Smile Foundation', description: 'Empowering underprivileged children, youth and women through education.', is_featured: true, total_raised: 210000, emoji: '😊' },
    { id: 'c4', name: 'HelpAge India', description: 'Working for the cause and care of disadvantaged elderly persons.', is_featured: false, total_raised: 87000, emoji: '👴' },
    { id: 'c5', name: 'Akshaya Patra', description: 'Mid-day meal programme serving millions of school children daily.', is_featured: true, total_raised: 340000, emoji: '🍱' },
    { id: 'c6', name: 'WWF India', description: 'Conservation of nature and reduction of the most pressing threats to diversity.', is_featured: false, total_raised: 76000, emoji: '🌿' },
  ]

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
          { label: 'My Scores', href: '/dashboard/scores', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { label: 'Draw History', href: '/dashboard/draws', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'My Charity', href: '/dashboard/charity', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', active: true },
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
          <h1 className="text-xl font-bold tracking-tight">My Charity</h1>
          <p className="text-xs text-white/25 mt-1">Choose who benefits from your subscription</p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Charity grid */}
          <div className="col-span-2">
            <div className="text-xs text-white/25 uppercase tracking-wider mb-4">
              Select a charity
            </div>
            <div className="grid grid-cols-2 gap-3">
              {displayCharities.map((c) => (
                <div key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`relative bg-[#0d1a10] border rounded-2xl p-5 cursor-pointer transition
                    ${selected === c.id
                      ? 'border-green-400/40 bg-green-400/5'
                      : 'border-white/5 hover:border-white/15'}`}>

                  {c.is_featured && (
                    <div className="absolute top-3 right-3 text-xs bg-green-400/10 border border-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  )}

                  {selected === c.id && (
                    <div className="absolute top-3 left-3 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="text-3xl mb-3">{c.emoji || '🌱'}</div>
                  <div className="text-sm font-semibold mb-1 pr-12">{c.name}</div>
                  <div className="text-xs text-white/30 leading-relaxed mb-3">{c.description}</div>
                  <div className="text-xs text-green-400/60">
                    ₹{Number(c.total_raised).toLocaleString('en-IN')} raised total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Contribution settings */}
            <div className="bg-[#0d1a10] border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-4">Contribution</h3>

              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Donation percentage
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-green-400">{percentage}%</span>
                <span className="text-sm text-white/30">
                  ₹{monthlyAmount()}/mo
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full accent-green-400 mb-3"
              />

              <div className="flex justify-between text-xs text-white/20">
                <span>Min 10%</span>
                <span>Max 50%</span>
              </div>

              <div className="mt-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 space-y-2">
                {[10, 20, 30, 50].map((p) => (
                  <div key={p}
                    onClick={() => setPercentage(p)}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition text-xs
                      ${percentage === p ? 'bg-green-400/10 text-green-400' : 'text-white/30 hover:bg-white/[0.04]'}`}>
                    <span>{p}% donation</span>
                    <span className="font-semibold">
                      ₹{Math.round(((profile?.subscription_plan === 'yearly' ? 4800 : 599) * p) / 100)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected summary */}
            {selected && (
              <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
                <div className="text-xs text-green-400/60 uppercase tracking-wider mb-2">Selected</div>
                <div className="text-sm font-semibold mb-1">
                  {displayCharities.find(c => c.id === selected)?.name}
                </div>
                <div className="text-xs text-white/30 mb-3">
                  {percentage}% of your subscription
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ₹{monthlyAmount()}
                  <span className="text-sm font-normal text-white/30">/month</span>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-500/8 border border-green-500/15 text-green-400 text-xs px-4 py-3 rounded-xl">
                ✓ {success}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!selected || saving}
              className="w-full bg-green-400 hover:bg-green-300 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition">
              {saving ? 'Saving...' : 'Save preference →'}
            </button>

            <p className="text-xs text-white/15 text-center leading-relaxed">
              You can change your charity at any time. Contributions are calculated monthly.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}