'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function login() { setError(null); if (!email.trim() || !password) { setError('请输入邮箱和密码。'); return }; setIsLoading(true); try { const { error: loginError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password }); if (loginError) { setError(loginError.message); return }; router.push('/practice'); router.refresh() } catch (caught) { setError(caught instanceof Error ? caught.message : '登录服务暂时不可用。') } finally { setIsLoading(false) } }
  return <section className="mx-auto max-w-md px-4 py-14 sm:px-6"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold text-brand-600">BandMate AI</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">登录</h1><p className="mt-3 text-sm leading-6 text-slate-600">登录后可保存练习记录并查看学习进度。</p><label className="mt-7 block text-sm font-semibold text-slate-700">邮箱<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><label className="mt-5 block text-sm font-semibold text-slate-700">密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><button type="button" onClick={login} disabled={isLoading} className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">{isLoading ? '正在登录…' : '登录'}</button>{error ? <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}<p className="mt-6 text-sm text-slate-600">还没有账号？<Link href="/auth/register" className="font-semibold text-brand-700 hover:text-brand-800">去注册</Link></p></div></section>
}
