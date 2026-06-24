'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { PracticeHistoryItem } from '@/lib/historyTypes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type DbAttempt = {
  id: string; user_id: string; part: PracticeHistoryItem['part']; mode: string | null; topic: string | null; question: string
  raw_transcript: string | null; edited_transcript: string | null; text_feedback: PracticeHistoryItem['textFeedback'] | null; audio_feedback: PracticeHistoryItem['audioFeedback'] | null
  primary_estimated_band: number | string | null; fluency_and_coherence: number | string | null; lexical_resource: number | string | null; grammatical_range_and_accuracy: number | string | null; pronunciation: number | string | null
  evaluation_source: PracticeHistoryItem['evaluationSource']; created_at: string
}

const sourceLabels = { text_only: '文本反馈', audio_first: '录音客观反馈', both: '录音 + 文本反馈' } as const
const asNumber = (value: number | string | null) => value === null ? undefined : Number(value)
const primaryFeedback = (item: PracticeHistoryItem) => item.audioFeedback ?? item.textFeedback

function toHistoryItem(row: DbAttempt): PracticeHistoryItem {
  return { id: row.id, userId: row.user_id, part: row.part, mode: row.mode ?? undefined, topic: row.topic ?? undefined, question: row.question, rawTranscript: row.raw_transcript ?? undefined, editedTranscript: row.edited_transcript ?? undefined, textFeedback: row.text_feedback ?? undefined, audioFeedback: row.audio_feedback ?? undefined, primaryEstimatedBand: asNumber(row.primary_estimated_band), fluencyAndCoherence: asNumber(row.fluency_and_coherence), lexicalResource: asNumber(row.lexical_resource), grammaticalRangeAndAccuracy: asNumber(row.grammatical_range_and_accuracy), pronunciation: asNumber(row.pronunciation), evaluationSource: row.evaluation_source, createdAt: row.created_at }
}

export function HistoryClient() {
  const [items, setItems] = useState<PracticeHistoryItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    async function loadHistory() {
      try {
        const client = getSupabaseBrowserClient()
        const { data: authData, error: authError } = await client.auth.getUser()
        if (!isActive) return
        if (authError || !authData.user) { setIsLoggedIn(false); return }
        setIsLoggedIn(true)
        const { data, error: queryError } = await client.from('practice_attempts').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(50)
        if (queryError) throw new Error(queryError.message)
        if (isActive) setItems((data as DbAttempt[]).map(toHistoryItem))
      } catch (caught) {
        if (isActive) setError(caught instanceof Error ? caught.message : '历史记录读取失败，请稍后重试。')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    void loadHistory()
    return () => { isActive = false }
  }, [])

  if (isLoading) return <div className="mt-10 h-36 animate-pulse rounded-2xl bg-slate-200" />
  if (isLoggedIn === false) return <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50 p-7 text-slate-700">登录后查看历史记录。<Link href="/auth/login" className="ml-2 font-semibold text-brand-700 underline">登录</Link></div>
  if (error) return <p role="alert" className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</p>
  if (!items.length) return <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">还没有保存的练习。完成反馈后，点击“保存到历史记录”即可在这里回顾。</div>

  return <><div className="mt-10 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">想看总分、四项能力和练习建议？<Link href="/dashboard" className="ml-2 font-semibold underline underline-offset-2">查看进度面板</Link></div><div className="mt-5 space-y-5">{items.map((item) => {
    const feedback = primaryFeedback(item)
    return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-brand-700">{item.part.toUpperCase()} · {item.topic || '未分类话题'}</p><h2 className="mt-2 text-lg font-semibold leading-7 text-ink">{item.question}</h2><p className="mt-2 text-sm text-slate-500">{new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))} · {sourceLabels[item.evaluationSource]}</p></div><div className="rounded-xl bg-brand-50 px-4 py-3 text-center"><p className="text-xs font-semibold text-brand-700">AI 预估分</p><p className="mt-1 text-2xl font-bold text-ink">{item.primaryEstimatedBand?.toFixed(1) ?? '—'}</p></div></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{item.editedTranscript || item.rawTranscript || '未提供转写文本。'}</p>{feedback?.summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{feedback.summary}</p> : null}<details className="mt-5 rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-semibold text-brand-700">查看详情</summary><div className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><div><p className="font-semibold text-slate-900">原始转写</p><p className="mt-1 whitespace-pre-wrap">{item.rawTranscript || '未提供'}</p></div><div><p className="font-semibold text-slate-900">修改后文本</p><p className="mt-1 whitespace-pre-wrap">{item.editedTranscript || '未提供'}</p></div><div className="grid gap-2 sm:grid-cols-2"><p>流利度与连贯性：{item.fluencyAndCoherence?.toFixed(1) ?? '—'}</p><p>词汇资源：{item.lexicalResource?.toFixed(1) ?? '—'}</p><p>语法多样性与准确性：{item.grammaticalRangeAndAccuracy?.toFixed(1) ?? '—'}</p><p>发音：{item.pronunciation?.toFixed(1) ?? '—'}</p></div>{feedback?.priorityImprovements?.length ? <div><p className="font-semibold text-slate-900">优先改进点</p><ul className="mt-1 list-disc space-y-1 pl-5">{feedback.priorityImprovements.map((improvement) => <li key={improvement}>{improvement}</li>)}</ul></div> : null}{feedback?.betterAnswer?.text ? <div><p className="font-semibold text-slate-900">参考优化回答</p><p lang="en" className="mt-1 whitespace-pre-wrap">{feedback.betterAnswer.text}</p></div> : null}</div></details></article>
  })}</div></>
}
