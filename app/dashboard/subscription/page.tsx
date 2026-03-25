'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  { id: 'starter', name: 'Starter', desc: 'Get started with basic features', price: null, priceLabel: 'Free', features: ['Submit up to 2 scores/month', 'Enter monthly draws', 'Support 1 charity', 'Basic stats'], popular: false, buttonLabel: 'Switch to Starter' },
  { id: 'pro', name: 'Pro', desc: 'Unlock all features and maximize impact', price: 499, priceLabel: '₹499', features: ['Unlimited score submissions', 'Enter all draws (weekly & monthly)', 'Support up to 5 charities', 'Advanced score analytics', 'Priority draw entries', 'Exclusive Pro-only prizes'], popular: true, buttonLabel: 'Current Plan' },
  { id: 'champion', name: 'Champion', desc: 'For the dedicated golfer and philanthropist', price: 999, priceLabel: '₹999', features: ['Everything in Pro', 'Double draw entries', 'Unlimited charity support', 'Personal impact dashboard', 'VIP event invitations', 'Dedicated support'], popular: false, buttonLabel: 'Switch to Champion' },
]

export default function Subscription() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p); setLoading(false)
    }
    load()
  }, [])

  const currentPlan = profile?.subscription_plan || 'starter'
  const handleCancel = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: 'starter',
        subscription_status: 'inactive'
      })
      .eq('id', user.id)
  
    if (!error) {
      setProfile((p: any) => ({
        ...p,
        subscription_plan: 'starter',
        subscription_status: 'inactive'
      }))
    } else {
      console.error(error)
    }
  }

  const handleSwitch = async (planId: string) => {
    if (planId === currentPlan) return
  
    setSwitching(planId)
  
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        subscription_status: 'active'
      })
      .eq('id', user.id)
  
    if (!error) {
      setProfile((p: any) => ({
        ...p,
        subscription_plan: planId,
        subscription_status: 'active'
      }))
    } else {
      console.error(error)
    }
  
    setSwitching(null)
  }
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-600 text-sm animate-pulse">Loading...</div></div>

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Subscription</h1>
       
      </header>
      <div className="p-8 space-y-7">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 capitalize">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan</span>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm text-gray-400">Next billing: April 18, 2026 · ₹499</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button  onClick={handleCancel}  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2 rounded-xl transition">Cancel Plan</button>
            <button onClick={() => handleSwitch('pro')} className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition flex items-center gap-2">
              Upgrade
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan
              return (
                <div key={plan.id} className={`relative bg-white rounded-2xl border shadow-sm flex flex-col ${plan.popular ? 'border-green-500 shadow-green-100' : 'border-gray-100'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div className="text-xl font-bold text-gray-900 mb-1">{plan.name}</div>
                    <div className="text-sm text-gray-400 mb-4 leading-relaxed">{plan.desc}</div>
                    <div className="mb-5">
                      {plan.price === null
                        ? <span className="text-4xl font-bold text-gray-900">Free</span>
                        : <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-gray-900">{plan.priceLabel}</span><span className="text-sm text-gray-400">/month</span></div>}
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm text-gray-600 leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-6 pb-6">
                    {isCurrent
                      ? <div className="w-full text-center text-sm text-gray-400 py-3 border border-gray-100 rounded-xl bg-gray-50">Current Plan</div>
                      : <button onClick={() => handleSwitch(plan.id)} disabled={switching === plan.id} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition">{switching === plan.id ? 'Switching...' : plan.buttonLabel}</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Frequently asked questions</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
              { q: 'What happens to my scores if I downgrade?', a: 'Your existing scores and draw history are always kept. Only future submissions are limited by your plan.' },
              { q: 'Is there a free trial?', a: 'The Starter plan is permanently free. Pro and Champion plans have a 7-day money-back guarantee.' },
              { q: 'How are prizes paid out?', a: 'Winnings are transferred to your registered bank account within 3–5 business days of the draw.' },
            ].map((item) => (
              <div key={item.q}>
                <div className="text-sm font-semibold text-gray-800 mb-1">{item.q}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}