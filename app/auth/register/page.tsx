'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  async function register() { setError(null); setMessage(null); if (!email.trim() || !password || !confirmPassword) { setError('请填写邮箱、密码和确认密码。'); return }; if (password.length < 6) { setError('密码至少需要 6 位。'); return }; if (password !== confirmPassword) { setError('两次输入的密码不一致。'); return }; setIsLoading(true); try { const client = getSupabaseBrowserClient(); const { error: signUpError } = await client.auth.signUp({ email: email.trim(), password }); if (signUpError) { setError(signUpError.message); return }; await client.auth.signOut(); setMessage('注册成功，请返回登录。'); window.setTimeout(() => router.push('/auth/login'), 1600) } catch (caught) { setError(caught instanceof Error ? caught.message : '注册服务暂时不可用。') } finally { setIsLoading(false) } }
  return <section className="mx-auto max-w-md px-4 py-14 sm:px-6"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold text-brand-600">BandMate AI</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">创建账号</h1><p className="mt-3 text-sm leading-6 text-slate-600">注册后请返回登录；如启用邮箱验证，请先完成邮箱验证。</p><label className="mt-7 block text-sm font-semibold text-slate-700">邮箱<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><label className="mt-5 block text-sm font-semibold text-slate-700">密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><label className="mt-5 block text-sm font-semibold text-slate-700">确认密码<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={6} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" /></label><button type="button" onClick={register} disabled={isLoading} className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">{isLoading ? '正在注册…' : '注册'}</button>{error ? <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}{message ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}<Link href="/auth/login" className="ml-2 font-semibold underline">返回登录</Link></div> : null}<p className="mt-6 text-sm text-slate-600">已有账号？<Link href="/auth/login" className="font-semibold text-brand-700 hover:text-brand-800">返回登录</Link></p></div></section>
}
