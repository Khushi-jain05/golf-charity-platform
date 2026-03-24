'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'subscriber',
        subscription_status: 'inactive'
      })
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-[#050a06] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* Glow (same as login) */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-green-400/10 blur-[120px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-semibold text-green-400 tracking-tight">
            GolfGives
          </Link>

          <h1 className="text-3xl font-bold mt-6 mb-2 tracking-tight">
            Create your account
          </h1>

          <p className="text-sm text-white/40">
            Start playing, giving, and winning
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSignUp}
          className="bg-[#0d1a10]/90 backdrop-blur-md border border-green-400/10 rounded-3xl p-8 space-y-5 shadow-[0_0_40px_rgba(74,222,128,0.05)]"
        >

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
              Full name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#050a06] border border-white/10 hover:border-white/20 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#050a06] border border-white/10 hover:border-white/20 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#050a06] border border-white/10 hover:border-white/20 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              placeholder="Min 6 characters"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-300 active:scale-[0.98] disabled:opacity-40 text-[#050a06] font-semibold py-3 rounded-full text-sm transition-all duration-200"
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-green-400 hover:text-green-300 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}