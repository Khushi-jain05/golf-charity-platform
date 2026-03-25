'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [handicap, setHandicap] = useState('')
  const [homeClub, setHomeClub] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      const { data: p, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle()

if (error) {
  console.error('LOAD ERROR:', error)
}
      setProfile(p)
      if (p) {
        const parts = (p.full_name || '').split(' ')
        setFirstName(parts[0] || ''); setLastName(parts.slice(1).join(' ') || '')
        setPhone(p.phone || ''); setLocation(p.location || ''); setBio(p.bio || '')
        setHandicap(p.handicap?.toString() || ''); setHomeClub(p.home_club || '')
      }
      const { data: s } = await supabase.from('scores').select('*').eq('user_id', user.id)
      setScores(s || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
  
    const full_name = `${firstName} ${lastName}`.trim()
  
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        location,
        bio,
        handicap: handicap ? parseFloat(handicap) : null,
        home_club: homeClub,
      })
      .eq('id', profile.id)
  
   
    if (error) {
      console.error('SAVE ERROR:', error)
      setSaving(false)
      return
    }
  
   
    setProfile((p: any) => ({
      ...p,
      full_name,
      phone,
      location,
      bio,
      handicap: handicap ? parseFloat(handicap) : null,
      home_club: homeClub,
    }))
  
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length * 10) / 10 : 0
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'January 2025'

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Profile</h1>
       
      </header>
      <div className="p-8 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700 flex-shrink-0">{initials}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Pro Member</span>
              </div>
              {location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {location}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Member since {memberSince}
              </div>
            </div>
            <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">Edit Photo</button>
          </div>
          <div className="grid grid-cols-4 pt-5">
            {[
              { value: scores.length, label: 'Rounds Played' },
              { value: avgScore || '—', label: 'Avg Score' },
              { value: 3, label: 'Draws Won' },
              { value: profile?.charity_count || 4, label: 'Charities Supported' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-0.5">Personal Information</h3>
          <p className="text-sm text-gray-400 mb-6">Update your personal details</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input value={email} disabled className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-400 outline-none bg-gray-50 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us a bit about yourself..." className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Handicap Index</label>
                <input value={handicap} onChange={e => setHandicap(e.target.value)} type="number" step="0.1" min="0" max="54" placeholder="e.g. 12.4" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Home Club</label>
                <input value={homeClub} onChange={e => setHomeClub(e.target.value)} placeholder="e.g. Royal Calcutta Golf Club" className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>{saved && <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Profile saved!</div>}</div>
              <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-0.5">Danger Zone</h3>
          <p className="text-xs text-gray-400 mb-4">Irreversible actions for your account</p>
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-800">Delete Account</div>
              <div className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</div>
            </div>
            <button className="border border-red-200 hover:bg-red-50 text-red-500 text-sm font-semibold px-4 py-2 rounded-xl transition">Delete Account</button>
          </div>
        </div>
      </div>
    </main>
  )
}