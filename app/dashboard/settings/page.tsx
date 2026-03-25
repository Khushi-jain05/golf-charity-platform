'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export default function Settings() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [drawResults, setDrawResults] = useState(true)
  const [scoreReminders, setScoreReminders] = useState(true)
  const [charityUpdates, setCharityUpdates] = useState(false)
  const [promoEmails, setPromoEmails] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [currency, setCurrency] = useState('INR')
  const [language, setLanguage] = useState('English')
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
      if (p?.settings) {
        const s = p.settings
        setDrawResults(s.drawResults ?? true); setScoreReminders(s.scoreReminders ?? true)
        setCharityUpdates(s.charityUpdates ?? false); setPromoEmails(s.promoEmails ?? false)
        setPushNotifs(s.pushNotifs ?? true); setCurrency(s.currency ?? 'INR'); setLanguage(s.language ?? 'English')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveSettings = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ settings: { drawResults, scoreReminders, charityUpdates, promoEmails, pushNotifs, currency, language } }).eq('id', profile.id)
  }

  const handleToggle = (setter: (v: boolean) => void) => (val: boolean) => { setter(val); setTimeout(saveSettings, 100) }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError(''); setPwSuccess('')
    if (!newPassword || !confirmPassword) { setPwError('Please fill in all fields'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message) }
    else { setPwSuccess('Password updated!'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setPwSuccess(''), 3000) }
    setPwLoading(false)
  }

  const handleExportData = async () => {
    if (!profile) return
    const { data: scores } = await supabase.from('scores').select('*').eq('user_id', profile.id)
    const rows = [['Date', 'Score'], ...(scores || []).map(s => [s.played_at, s.score])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-golfgives-data.csv'; a.click()
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    await supabase.from('profiles').delete().eq('id', profile.id)
    await supabase.auth.signOut(); router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Settings</h1>
       
      </header>
      <div className="p-8 space-y-5">

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div><div className="text-base font-bold text-gray-900">Notifications</div><div className="text-sm text-gray-400">Manage how you receive updates</div></div>
          </div>
          {[
            { label: 'Draw Results', desc: 'Get notified when draw results are announced', val: drawResults, set: setDrawResults },
            { label: 'Score Reminders', desc: 'Weekly reminders to submit your scores', val: scoreReminders, set: setScoreReminders },
            { label: 'Charity Updates', desc: 'News from your supported charities', val: charityUpdates, set: setCharityUpdates },
            { label: 'Promotional Emails', desc: 'Special offers and new features', val: promoEmails, set: setPromoEmails },
            { label: 'Push Notifications', desc: 'Browser push notifications for important updates', val: pushNotifs, set: setPushNotifs },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div><div className="text-sm font-medium text-gray-900">{item.label}</div><div className="text-xs text-gray-400 mt-0.5">{item.desc}</div></div>
              <Toggle enabled={item.val} onChange={handleToggle(item.set)} />
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            </div>
            <div><div className="text-base font-bold text-gray-900">Preferences</div><div className="text-sm text-gray-400">Customize your experience</div></div>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div><div className="text-sm font-medium text-gray-900">Dark Mode</div><div className="text-xs text-gray-400 mt-0.5">Switch to dark theme</div></div>
            <Toggle enabled={darkMode} onChange={handleToggle(setDarkMode)} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <div className="relative">
                <select value={currency} onChange={e => { setCurrency(e.target.value); setTimeout(saveSettings, 100) }} className="w-full appearance-none border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 pr-9">
                  <option value="INR">₹ INR</option><option value="GBP">£ GBP</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="AUD">A$ AUD</option>
                </select>
                <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
              <div className="relative">
                <select value={language} onChange={e => { setLanguage(e.target.value); setTimeout(saveSettings, 100) }} className="w-full appearance-none border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 pr-9">
                  <option>English</option><option>Hindi</option><option>Punjabi</option><option>Tamil</option><option>Telugu</option>
                </select>
                <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div><div className="text-base font-bold text-gray-900">Security</div><div className="text-sm text-gray-400">Keep your account safe</div></div>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {pwError && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">{pwError}</div>}
            {pwSuccess && <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-3 rounded-xl">{pwSuccess}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition bg-gray-50 focus:bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm outline-none transition bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div><div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div><div className="text-xs text-gray-400 mt-0.5">Add extra security to your account</div></div>
              <Toggle enabled={twoFA} onChange={setTwoFA} />
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={pwLoading} className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">{pwLoading ? 'Updating...' : 'Update Password'}</button>
            </div>
          </form>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div><div className="text-base font-bold text-gray-900">Data & Privacy</div><div className="text-sm text-gray-400">Manage your data and account</div></div>
          </div>
          <div className="flex items-center gap-4 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <div className="flex-1"><div className="text-sm font-medium text-gray-900">Export Your Data</div><div className="text-xs text-gray-400 mt-0.5">Download all your scores and activity</div></div>
            <button onClick={handleExportData} className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">Export</button>
          </div>
          <div className="flex items-center gap-4 py-4 mt-1 bg-red-50 rounded-xl px-4 border border-red-100">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <div className="flex-1"><div className="text-sm font-semibold text-red-600">Delete Account</div><div className="text-xs text-red-400 mt-0.5">Permanently remove your account and data</div></div>
            <button onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition">Delete</button>
          </div>
        </div>
      </div>
    </main>
  )
}