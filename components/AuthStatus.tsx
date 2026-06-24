'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let unsubscribe: () => void = () => undefined
    void Promise.resolve().then(() => {
      try {
        const client = getSupabaseBrowserClient()
        void client.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? null); setIsReady(true) })
        const { data: listener } = client.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null))
        unsubscribe = () => { listener.subscription.unsubscribe() }
      } catch { setIsReady(true) }
    })
    return () => unsubscribe()
  }, [])

  async function signOut() { try { await getSupabaseBrowserClient().auth.signOut() } finally { setEmail(null) } }

  if (!isReady) return <span className="text-sm text-slate-400">…</span>
  if (!email) return <Link href="/auth/login" className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">登录</Link>
  return <div className="flex items-center gap-2"><span className="hidden max-w-36 truncate text-sm text-slate-600 lg:block" title={email}>{email}</span><button type="button" onClick={signOut} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">退出登录</button></div>
}
