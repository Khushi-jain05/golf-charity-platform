'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Get started with basic features',
    price: null,
    priceLabel: 'Free',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    features: [
      'Submit up to 2 scores/month',
      'Enter monthly draws',
      'Support 1 charity',
      'Basic stats',
    ],
    popular: false,
    buttonLabel: 'Switch to Starter',
    buttonVariant: 'solid',
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'Unlock all features and maximize impact',
    price: 499,
    priceLabel: '₹499',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    features: [
      'Unlimited score submissions',
      'Enter all draws (weekly & monthly)',
      'Support up to 5 charities',
      'Advanced score analytics',
      'Priority draw entries',
      'Exclusive Pro-only prizes',
    ],
    popular: true,
    buttonLabel: 'Current Plan',
    buttonVariant: 'current',
  },
  {
    id: 'champion',
    name: 'Champion',
    desc: 'For the dedicated golfer and philanthropist',
    price: 999,
    priceLabel: '₹999',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    features: [
      'Everything in Pro',
      'Double draw entries',
      'Unlimited charity support',
      'Personal impact dashboard',
      'VIP event invitations',
      'Dedicated support',
    ],
    popular: false,
    buttonLabel: 'Switch to Champion',
    buttonVariant: 'solid',
  },
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
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [])

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
  const currentPlan = profile?.plan || 'pro'

  const handleSwitch = async (planId: string) => {
    if (planId === currentPlan) return
    setSwitching(planId)
    await new Promise(r => setTimeout(r, 800)) // replace with real Stripe logic
    await supabase.from('profiles').update({ plan: planId }).eq('id', profile.id)
    setProfile((p: any) => ({ ...p, plan: planId }))
    setSwitching(null)
  }

  const getButtonState = (plan: typeof plans[0]) => {
    if (plan.id === currentPlan) return 'current'
    return 'switch'
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
            { label: 'Subscription', href: '/dashboard/subscription', active: true,  d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { label: 'Profile',      href: '/dashboard/profile',      active: false, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Settings',     href: '/dashboard/settings',     active: false, d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
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
            <h1 className="text-base font-semibold text-gray-900">Subscription</h1>
          </div>
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <div className="p-8 space-y-7">

          {/* Current Plan Banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900 capitalize">
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                </span>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">Next billing: April 18, 2026 · ₹499</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2 rounded-xl transition">
                Cancel Plan
              </button>
              <button className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition flex items-center gap-2">
                Upgrade
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Available Plans */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Available Plans</h2>
            <div className="grid grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.id === currentPlan
                const isLoading = switching === plan.id

                return (
                  <div key={plan.id}
                    className={`relative bg-white rounded-2xl border shadow-sm flex flex-col
                      ${plan.popular
                        ? 'border-green-500 shadow-green-100'
                        : 'border-gray-100'}`}>

                    {/* Most Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex-1">
                      {/* Icon */}
                      <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                        {plan.icon}
                      </div>

                      {/* Name + desc */}
                      <div className="text-xl font-bold text-gray-900 mb-1">{plan.name}</div>
                      <div className="text-sm text-gray-400 mb-4 leading-relaxed">{plan.desc}</div>

                      {/* Price */}
                      <div className="mb-5">
                        {plan.price === null ? (
                          <span className="text-4xl font-bold text-gray-900">Free</span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">{plan.priceLabel}</span>
                            <span className="text-sm text-gray-400">/month</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600 leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <div className="px-6 pb-6">
                      {isCurrent ? (
                        <div className="w-full text-center text-sm text-gray-400 py-3 border border-gray-100 rounded-xl bg-gray-50">
                          Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSwitch(plan.id)}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition">
                          {isLoading ? 'Switching...' : plan.buttonLabel}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FAQ / Info strip */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Frequently asked questions</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
                { q: 'What happens to my scores if I downgrade?', a: 'Your existing scores and draw history are always kept. Only future submissions are limited by your plan.' },
                { q: 'Is there a free trial?', a: 'The Starter plan is permanently free. Pro and Champion plans have a 7-day money-back guarantee.' },
                { q: 'How are prizes paid out?', a: 'Winnings are transferred directly to your registered bank account within 3–5 business days of the draw.' },
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
    </div>
  )
}