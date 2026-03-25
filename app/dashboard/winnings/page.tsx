'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Winnings() {
  const router = useRouter()
  const [winnings, setWinnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: w } = await supabase.from('winnings').select('*').eq('user_id', user.id).order('won_at', { ascending: false })
      setWinnings(w || [])
      setLoading(false)
    }
    load()
  }, [])

  const mock = [
    { id: 'm1', won_at: '2026-02-01', draw_name: 'February Draw', tier: '4-Match', amount: 18000, status: 'claimed' },
    { id: 'm2', won_at: '2025-12-01', draw_name: 'December Draw', tier: '3-Match', amount: 4500, status: 'claimed' },
    { id: 'm3', won_at: '2025-10-01', draw_name: 'October Draw', tier: '3-Match', amount: 5200, status: 'claimed' },
    { id: 'm4', won_at: '2025-08-01', draw_name: 'August Draw', tier: '3-Match', amount: 4300, status: 'claimed' },
  ]
  const display = winnings.length > 0 ? winnings : mock
  const total = display.reduce((a, w) => a + w.amount, 0)
  const best = display.length ? Math.max(...display.map(w => w.amount)) : 0
  const unclaimed = display.filter(w => w.status === 'unclaimed')

  const handleExport = () => {
    const rows = [['Date', 'Draw', 'Tier', 'Amount', 'Status'], ...display.map(w => [new Date(w.won_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), w.draw_name, w.tier, `₹${(w.amount / 100).toFixed(2)}`, w.status])]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'winnings.csv'; a.click()
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Winnings</h1>
       
      </header>
      <div className="p-8 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Winnings', value: `₹${(total / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, iconBg: 'bg-blue-50', icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
            { label: 'Draws Won', value: display.length, iconBg: 'bg-yellow-50', icon: <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
            { label: 'Best Prize', value: `₹${(best / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, iconBg: 'bg-green-50', icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>{c.icon}</div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-0.5">{c.label}</div>
                <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Winnings History</h3>
              <p className="text-xs text-gray-400 mt-0.5">All your prize draw winnings</p>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export
            </button>
          </div>
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
              {display.map((w) => (
                <tr key={w.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(w.won_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{w.draw_name}</td>
                  <td className="px-6 py-4"><span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{w.tier}</span></td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{(w.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    {w.status === 'claimed'
                      ? <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">Claimed</span>
                      : <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">Unclaimed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${unclaimed.length > 0 ? 'border-yellow-200' : 'border-gray-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${unclaimed.length > 0 ? 'bg-yellow-50' : 'bg-yellow-50'}`}>
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{unclaimed.length > 0 ? `You have ${unclaimed.length} unclaimed prize${unclaimed.length > 1 ? 's' : ''}` : 'No unclaimed prizes'}</div>
            <div className="text-xs text-gray-400 mt-0.5">{unclaimed.length > 0 ? 'Contact support to claim your winnings.' : 'All your winnings have been claimed. Keep playing to win more!'}</div>
          </div>
        </div>
      </div>
    </main>
  )
}