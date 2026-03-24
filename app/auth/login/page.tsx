'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      console.log("LOGIN SUCCESS")
    
      setLoading(false)
    
      router.replace('/dashboard') // ✅ instant redirect
    }
  }

  // ✅ Google Auth (now functional)
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
   // ONLY styling improved — logic untouched

<main className="min-h-screen bg-[#050a06] text-white flex items-center justify-center px-6 relative overflow-hidden">

{/* Background glow (stronger + smoother) */}
<div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-green-400/10 blur-[120px] opacity-40 pointer-events-none" />

<div className="w-full max-w-md relative z-10">

  {/* Logo */}
  <div className="text-center mb-10">
    <Link href="/" className="text-2xl font-semibold text-green-400 tracking-tight">
      GolfGives
    </Link>

    <h1 className="text-3xl font-bold mt-6 mb-2 tracking-tight">
      Welcome back
    </h1>

    <p className="text-sm text-white/40">
      Sign in to your account
    </p>
  </div>

  {/* Card */}
  <div className="bg-[#0d1a10]/90 backdrop-blur-md border border-green-400/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(74,222,128,0.05)]">

    {error && (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
        {error}
      </div>
    )}

    <form onSubmit={handleLogin} className="space-y-5">

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
          disabled={loading}
          className="w-full bg-[#050a06] border border-white/10 hover:border-white/20 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[11px] text-white/40 font-medium uppercase tracking-wider">
            Password
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-xs text-green-400/70 hover:text-green-400 transition"
          >
            Forgot password?
          </Link>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full bg-[#050a06] border border-white/10 hover:border-white/20 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
          placeholder="••••••••"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-400 hover:bg-green-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[#050a06] font-semibold py-3 rounded-full text-sm transition-all duration-200 mt-2 shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in →'
        )}
      </button>
    </form>

    {/* Divider */}
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>

    {/* Google Login */}
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium py-3 rounded-full text-sm transition flex items-center justify-center gap-3 disabled:opacity-40"
    >
      Continue with Google
    </button>
  </div>

  {/* Footer */}
  <p className="text-center text-white/30 text-xs mt-6">
    Don't have an account?{' '}
    <Link
      href="/auth/signup"
      className="text-green-400 hover:text-green-300 transition"
    >
      Sign up free
    </Link>
  </p>
</div>
</main>
  )
}