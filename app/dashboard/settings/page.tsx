'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
        ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
        ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export default function Settings() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Notifications
  const [drawResults, setDrawResults] = useState(true)
  const [scoreReminders, setScoreReminders] = useState(true)
  const [charityUpdates, setCharityUpdates] = useState(false)
  const [promoEmails, setPromoEmails] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)

  // Preferences
  const [darkMode, setDarkMode] = useState(false)
  const [currency, setCurrency] = useState('INR')
  const [language, setLanguage] = useState('English')

  // Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      // Load saved settings if stored in profile
      if (p?.settings) {
        const s = p.settings
        setDrawResults(s.drawResults ?? true)
        setScoreReminders(s.scoreReminders ?? true)
        setCharityUpdates(s.charityUpdates ?? false)
        setPromoEmails(s.promoEmails ?? false)
        setPushNotifs(s.pushNotifs ?? true)
        setCurrency(s.currency ?? 'INR')
        setLanguage(s.language ?? 'English')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveSettings = async () => {
    if (!profile) return
    await supabase.from('profiles').update({
      settings: { drawResults, scoreReminders, charityUpdates, promoEmails, pushNotifs, currency, language }
    }).eq('id', profile.id)
  }

  const handleToggle = (setter: (v: boolean) => void) => (val: boolean) => {
    setter(val)
    setTimeout(saveSettings, 100)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    if (!newPassword || !confirmPassword) { setPwError('Please fill in all fields'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message) }
    else {
      setPwSuccess('Password updated successfully!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwSuccess(''), 3000)
    }
    setPwLoading(false)
  }

  const handleExportData = async () => {
    if (!profile) return
    const { data: scores } = await supabase.from('scores').select('*').eq('user_id', profile.id)
    const rows = [
      ['Date', 'Score'],
      ...(scores || []).map(s => [s.played_at, s.score])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'my-golfgives-data.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    await supabase.from('profiles').delete().eq('id', profile.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

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
            { label: 'Winnings',  href: '/dashboard/winnings', active: false, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
            { label: 'Subscription', href: '/dashboard/subscription', active: false, d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { label: 'Profile',      href: '/dashboard/profile',      active: false, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Settings',     href: '/dashboard/settings',     active: true,  d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
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
            <h1 className="text-base font-semibold text-gray-900">Settings</h1>
          </div>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <div className="p-8 space-y-5">

          {/* ── Notifications ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Notifications</div>
                <div className="text-sm text-gray-400">Manage how you receive updates</div>
              </div>
            </div>

            <div className="space-y-0">
              {[
                { label: 'Draw Results',       desc: 'Get notified when draw results are announced',  val: drawResults,    set: setDrawResults },
                { label: 'Score Reminders',    desc: 'Weekly reminders to submit your scores',        val: scoreReminders, set: setScoreReminders },
                { label: 'Charity Updates',    desc: 'News from your supported charities',            val: charityUpdates, set: setCharityUpdates },
                { label: 'Promotional Emails', desc: 'Special offers and new features',               val: promoEmails,    set: setPromoEmails },
                { label: 'Push Notifications', desc: 'Browser push notifications for important updates', val: pushNotifs, set: setPushNotifs },
              ].map((item, i, arr) => (
                <div key={item.label}
                  className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle enabled={item.val} onChange={handleToggle(item.set)} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Preferences ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Preferences</div>
                <div className="text-sm text-gray-400">Customize your experience</div>
              </div>
            </div>

            {/* Dark mode */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">Dark Mode</div>
                <div className="text-xs text-gray-400 mt-0.5">Switch to dark theme</div>
              </div>
              <Toggle enabled={darkMode} onChange={handleToggle(setDarkMode)} />
            </div>

            {/* Currency + Language */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                <div className="relative">
                  <select value={currency} onChange={e => { setCurrency(e.target.value); setTimeout(saveSettings, 100) }}
                    className="w-full appearance-none border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white pr-9">
                    <option value="INR">₹ INR</option>
                    <option value="GBP">£ GBP</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="AUD">A$ AUD</option>
                  </select>
                  <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <div className="relative">
                  <select value={language} onChange={e => { setLanguage(e.target.value); setTimeout(saveSettings, 100) }}
                    className="w-full appearance-none border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white pr-9">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Punjabi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                  </select>
                  <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── Security ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Security</div>
                <div className="text-sm text-gray-400">Keep your account safe</div>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">{pwError}</div>
              )}
              {pwSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-3 rounded-xl">{pwSuccess}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-xs text-gray-400 mt-0.5">Add extra security to your account</div>
                </div>
                <Toggle enabled={twoFA} onChange={setTwoFA} />
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={pwLoading}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Data & Privacy ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">Data & Privacy</div>
                <div className="text-sm text-gray-400">Manage your data and account</div>
              </div>
            </div>

            {/* Export */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Export Your Data</div>
                <div className="text-xs text-gray-400 mt-0.5">Download all your scores and activity</div>
              </div>
              <button onClick={handleExportData}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">
                Export
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center gap-4 py-4 mt-1 bg-red-50 rounded-xl px-4 border border-red-100">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-red-600">Delete Account</div>
                <div className="text-xs text-red-400 mt-0.5">Permanently remove your account and data</div>
              </div>
              <button onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
                Delete
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}