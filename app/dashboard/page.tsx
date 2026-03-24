'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/auth/login')
        return
      }

      setUser(data.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      setProfile(profileData)
    }

    getUserData()
  }, [])

  return (
    <main className="min-h-screen bg-[#050a06] text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      {profile ? (
        <div className="bg-[#0d1a10] p-6 rounded-xl border border-green-400/10">
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Status:</strong> {profile.subscription_status}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

    </main>
  )
}