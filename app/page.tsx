import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f0f7f4] text-gray-900">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">GolfGives</span>
          <span className="text-gray-400 text-xs tracking-widest uppercase">Play · Win · Give</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
            Log In
          </Link>
          <Link href="/auth/signup" className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <div className="inline-flex items-center gap-2 border border-green-200 bg-white text-green-700 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Now open for Indian golfers
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6 max-w-3xl">
          Play Golf.{' '}
          <span className="text-green-600">Win Prizes.</span>{' '}
          <span className="text-red-500">Give Back.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Submit your Stableford scores, enter monthly prize draws, and support charities — all through one simple subscription.
        </p>

        <div className="flex gap-3">
          <Link href="/auth/signup"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition">
            Start Playing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="#how-it-works"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-xl text-sm transition">
            Learn More
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-t border-b border-gray-100 py-10 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 text-center">
          {[
            {
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              value: '2,400+', label: 'Active Members'
            },
            {
              icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
              value: '₹6,200', label: 'Prize Pool This Month'
            },
            {
              icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
              value: '₹48,000+', label: 'Donated to Charity'
            },
            {
              icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
              value: '3.2', label: 'Average Score Increase'
            },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                </svg>
              </div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-400 text-sm">Four simple steps to start winning and giving</p>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {[
              {
                step: 'STEP 1',
                title: 'Submit Scores',
                desc: 'Enter your Stableford scores after each round. Your rolling best 5 are tracked automatically.',
                icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              },
              {
                step: 'STEP 2',
                title: 'Enter Draws',
                desc: 'Your subscription enters you into monthly prize draws with tiered jackpots based on score matching.',
                icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
              },
              {
                step: 'STEP 3',
                title: 'Give Back',
                desc: 'A portion of every subscription goes directly to golf and community charities you care about.',
                icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              },
              {
                step: 'STEP 4',
                title: 'Win Prizes',
                desc: 'Match scores to win from the prize pool. The more you play, the more chances to win.',
                icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              },
            ].map((item) => (
              <div key={item.step} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div className="text-xs font-bold text-gray-400 tracking-widest mb-2">{item.step}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-20">
        <div className="max-w-3xl mx-auto border-2 border-green-200 bg-white rounded-3xl p-14 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Ready to make every round count?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Join thousands of golfers who play, win, and give back every month.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition">
            Join GolfGives →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-8 py-6 flex justify-between items-center">
        <div className="text-xs text-gray-400">© 2026 GolfGives. All rights reserved.</div>
        <div className="flex gap-6 text-xs text-gray-400">
          <Link href="#" className="hover:text-gray-600">Privacy</Link>
          <Link href="#" className="hover:text-gray-600">Terms</Link>
          <Link href="#" className="hover:text-gray-600">Contact</Link>
        </div>
      </footer>

    </main>
  )
}