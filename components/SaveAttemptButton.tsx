'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { SavePracticeAttemptInput } from '@/lib/historyTypes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type SaveAttemptButtonProps = SavePracticeAttemptInput

export function SaveAttemptButton(props: SaveAttemptButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    let unsubscribe: () => void = () => undefined

    async function loadUser() {
      try {
        const client = getSupabaseBrowserClient()
        const { data, error: authError } = await client.auth.getUser()
        if (!isActive) return
        if (authError) setError('无法确认登录状态，请重新登录后再试。')
        setIsLoggedIn(Boolean(data.user))
        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
          if (isActive) setIsLoggedIn(Boolean(session?.user))
        })
        unsubscribe = () => { listener.subscription.unsubscribe() }
      } catch (caught) {
        if (!isActive) return
        setError(caught instanceof Error ? caught.message : '登录服务尚未配置。')
        setIsLoggedIn(false)
      }
    }

    void loadUser()
    return () => { isActive = false; unsubscribe() }
  }, [])

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    setMessage(null)

    try {
      const client = getSupabaseBrowserClient()
      const { data: userData, error: authError } = await client.auth.getUser()
      if (authError || !userData.user) throw new Error('请先登录后再保存练习记录。')

      const primaryFeedback = props.audioFeedback ?? props.textFeedback
      if (!primaryFeedback) throw new Error('请先生成 AI 反馈后再保存。')
      const source = props.audioFeedback && props.textFeedback ? 'both' : props.audioFeedback ? 'audio_first' : 'text_only'
      const criteria = primaryFeedback.criteria
      const { error: insertError } = await client.from('practice_attempts').insert({
        user_id: userData.user.id,
        part: props.part,
        mode: props.mode ?? null,
        topic: props.topic ?? null,
        question: props.question,
        raw_transcript: props.rawTranscript ?? null,
        edited_transcript: props.editedTranscript ?? null,
        text_feedback: props.textFeedback ?? null,
        audio_feedback: props.audioFeedback ?? null,
        primary_estimated_band: primaryFeedback.estimatedBand,
        fluency_and_coherence: criteria.fluencyAndCoherence,
        lexical_resource: criteria.lexicalResource,
        grammatical_range_and_accuracy: criteria.grammaticalRangeAndAccuracy,
        pronunciation: criteria.pronunciation,
        evaluation_source: source,
      })
      if (insertError) throw new Error(insertError.message)
      setMessage('已保存到历史记录。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '保存失败，请稍后重试。')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoggedIn === null) return <p className="mt-5 text-sm text-slate-500">正在检查登录状态…</p>
  if (!isLoggedIn) return <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-800">登录后保存本次练习记录。<Link href="/auth/login" className="ml-2 font-semibold underline underline-offset-2">登录</Link>{error ? <p className="mt-2 text-rose-700">{error}</p> : null}</div>

  return <div className="mt-5"><button type="button" onClick={handleSave} disabled={isSaving} className="rounded-lg border border-brand-200 bg-white px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? '正在保存…' : '保存到历史记录'}</button>{message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}{error ? <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}</div>
}
