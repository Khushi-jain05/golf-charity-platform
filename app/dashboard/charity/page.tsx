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

  const handleSave = async (charityId: string) => {
    setSaving(true)
    setSuccess('')
    setSelected(charityId)

    await supabase.from('profiles').update({
      charity_id: charityId,
      charity_percentage: percentage
    }).eq('id', userId)

    setSuccess('Charity preference saved!')
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const monthlyAmount = (pct: number) => {
    const base = profile?.subscription_plan === 'yearly' ? 4800 : 599
    return Math.round((base * pct) / 100)
  }

  const myCharities = [
    { id: 'my1', name: 'CRY — Child Rights', description: 'Ensuring rights and improving lives of underprivileged children across India.', allocation: 10, thisMonth: 599 * 0.10, allTime: 3594 },
    { id: 'my2', name: 'Smile Foundation', description: 'Empowering underprivileged children, youth and women through education.', allocation: 15, thisMonth: 599 * 0.15, allTime: 5391 },
    { id: 'my3', name: 'Akshaya Patra', description: 'Mid-day meal programme serving millions of school children daily.', allocation: 10, thisMonth: 599 * 0.10, allTime: 2994 },
  ]

  const availableCharities = charities.length > 0 ? charities : [
    { id: 'c1', name: 'Goonj', description: 'Addressing basic needs in disaster and development work across rural India.', total_raised: 98000 },
    { id: 'c2', name: 'HelpAge India', description: 'Working for the cause and care of disadvantaged elderly persons.', total_raised: 87000 },
    { id: 'c3', name: 'WWF India', description: 'Conservation of nature and reduction of the most pressing threats to diversity.', total_raised: 76000 },
    { id: 'c4', name: 'Pratham', description: 'Improving the quality of education for underprivileged children across India.', total_raised: 112000 },
    { id: 'c5', name: 'iCall', description: 'Providing accessible mental health services and psychosocial support.', total_raised: 45000 },
    { id: 'c6', name: 'GiveIndia', description: 'A platform connecting donors with credible nonprofits across India.', total_raised: 210000 },
  ]

  const totalDonated = myCharities.reduce((a, c) => a + c.allTime, 0)
  const thisMonthTotal = myCharities.reduce((a, c) => a + c.thisMonth, 0)

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Loading...</div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

      

      {/* Main */}
      <main className="min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-base font-semibold text-gray-900">Charity Preferences</h1>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <div className="p-8 space-y-6">

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              ✓ {success}
            </div>
          )}

          {/* Total Donated Banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Donated</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{totalDonated.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Across {myCharities.length} charities since joining
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">This Month</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{Math.round(thisMonthTotal).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Your Charities */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Your Charities</h2>
            <div className="grid grid-cols-3 gap-4">
              {myCharities.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{c.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Allocation</span>
                      <span className="font-semibold text-gray-700">{c.allocation}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${(c.allocation / 50) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <div className="text-xs text-gray-400">This month</div>
                        <div className="text-sm font-bold text-gray-900">
                          ₹{Math.round(c.thisMonth).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">All time</div>
                        <div className="text-sm font-bold text-gray-900">
                          ₹{c.allTime.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Charities */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Available Charities</h2>
            <div className="grid grid-cols-3 gap-4">
              {availableCharities.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{c.description}</p>
                  <button
                    onClick={() => handleSave(c.id)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-700 text-xs font-semibold py-2.5 rounded-xl transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {selected === c.id ? 'Selected ✓' : 'Add Charity'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}