'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Charity() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [charities, setCharities] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      // Parse selected charity ids — stored as array or single id
      if (p?.charity_ids && Array.isArray(p.charity_ids)) {
        setSelectedIds(p.charity_ids)
      } else if (p?.charity_id) {
        setSelectedIds([p.charity_id])
      }

      // Try fetching charities table
      const { data: c } = await supabase.from('charities').select('*')
      setCharities(c || [])

      setLoading(false)
    }
    load()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleAdd = async (charityId: string, charityName: string) => {
    if (selectedIds.includes(charityId)) {
      // Remove
      const updated = selectedIds.filter(id => id !== charityId)
      setSaving(charityId)
      const { error } = await supabase
        .from('profiles')
        .update({
          charity_id: updated[0] || null,
          charity_ids: updated,
          charity_name: charityName,
        })
        .eq('id', userId)
      if (error) { console.error('Remove charity error:', error); showToast('Error removing charity') }
      else { setSelectedIds(updated); showToast(`Removed ${charityName}`) }
      setSaving(null)
    } else {
      // Add
      const updated = [...selectedIds, charityId]
      setSaving(charityId)
      const { error } = await supabase
        .from('profiles')
        .update({
          charity_id: charityId,          // primary charity (most recent)
          charity_ids: updated,            // all selected
          charity_name: charityName,
          charity_percentage: 10,
        })
        .eq('id', userId)
      if (error) { console.error('Save charity error:', error); showToast('Error saving — check Supabase RLS') }
      else { setSelectedIds(updated); showToast(`Added ${charityName}`) }
      setSaving(null)
    }
  }

  const mockAvailable = [
    { id: 'c1', name: 'CRY — Child Rights', description: 'Ensuring rights and improving lives of underprivileged children across India.', total_raised: 98000 },
    { id: 'c2', name: 'Smile Foundation', description: 'Empowering underprivileged children, youth and women through education.', total_raised: 87000 },
    { id: 'c3', name: 'Akshaya Patra', description: 'Mid-day meal programme serving millions of school children daily.', total_raised: 112000 },
    { id: 'c4', name: 'Goonj', description: 'Addressing basic needs in disaster and development work across rural India.', total_raised: 76000 },
    { id: 'c5', name: 'HelpAge India', description: 'Working for the cause and care of disadvantaged elderly persons.', total_raised: 65000 },
    { id: 'c6', name: 'WWF India', description: 'Conservation of nature and reduction of the most pressing threats to diversity.', total_raised: 54000 },
  ]

  const displayCharities = charities.length > 0 ? charities : mockAvailable
  const myCharities = displayCharities.filter(c => selectedIds.includes(c.id))
  const availableCharities = displayCharities.filter(c => !selectedIds.includes(c.id))

  const subscriptionBase = 599
  const totalDonated = myCharities.length * subscriptionBase * 0.10 * 6  // rough estimate
  const thisMonthTotal = myCharities.length * subscriptionBase * 0.10

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-600 text-sm animate-pulse font-medium">Loading...</div>
    </div>
  )

  return (
    <main className="min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg transition-all">
          {toast}
        </div>
      )}

      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Charities</h1>
       
      </header>

      <div className="p-8 space-y-6">

        {/* Total Donated Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Donated</div>
                <div className="text-3xl font-bold text-gray-900">₹{Math.round(totalDonated).toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400 mt-0.5">Across {myCharities.length} charities since joining</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">This Month</div>
              <div className="text-2xl font-bold text-green-600">₹{Math.round(thisMonthTotal).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Your Charities */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Your Charities {myCharities.length > 0 && <span className="text-sm font-normal text-gray-400">({myCharities.length} selected)</span>}
          </h2>
          {myCharities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-3xl mb-3">🌱</div>
              <div className="text-sm font-medium text-gray-500">No charities selected yet</div>
              <div className="text-xs text-gray-400 mt-1">Add charities from the list below</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {myCharities.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-green-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{c.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Allocation</span>
                      <span className="font-semibold text-gray-700">10%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <div className="text-xs text-gray-400">This month</div>
                        <div className="text-sm font-bold text-gray-900">₹{Math.round(subscriptionBase * 0.10).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(c.id, c.name)}
                    disabled={saving === c.id}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600 text-xs font-semibold py-2.5 rounded-xl transition">
                    {saving === c.id ? 'Removing...' : '✕ Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Charities */}
        {availableCharities.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Available Charities</h2>
            <div className="grid grid-cols-3 gap-4">
              {availableCharities.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{c.description}</p>
                  <button
                    onClick={() => handleAdd(c.id, c.name)}
                    disabled={saving === c.id}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-700 text-xs font-semibold py-2.5 rounded-xl transition">
                    {saving === c.id ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Charity
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}