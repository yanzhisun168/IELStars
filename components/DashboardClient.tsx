'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { CriterionBreakdown } from '@/components/CriterionBreakdown'
import { DashboardStatsCards } from '@/components/DashboardStatsCards'
import { NextRecommendationCard } from '@/components/NextRecommendationCard'
import { PartPracticeBreakdown } from '@/components/PartPracticeBreakdown'
import { RecentScoreTrend } from '@/components/RecentScoreTrend'
import { calculateAverageBand, calculateCriterionAverages, calculateHighestBand, calculateLatestBand, findStrongestCriterion, findWeakestCriterion } from '@/lib/dashboardStats'
import type { PracticeHistoryItem } from '@/lib/historyTypes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type DbAttempt = {
  id: string; user_id: string; part: PracticeHistoryItem['part']; mode: string | null; topic: string | null; question: string
  raw_transcript: string | null; edited_transcript: string | null; text_feedback: PracticeHistoryItem['textFeedback'] | null; audio_feedback: PracticeHistoryItem['audioFeedback'] | null
  primary_estimated_band: number | string | null; fluency_and_coherence: number | string | null; lexical_resource: number | string | null; grammatical_range_and_accuracy: number | string | null; pronunciation: number | string | null
  evaluation_source: PracticeHistoryItem['evaluationSource']; created_at: string
}

const asNumber = (value: number | string | null) => value === null ? undefined : Number(value)
function toHistoryItem(row: DbAttempt): PracticeHistoryItem {
  return { id: row.id, userId: row.user_id, part: row.part, mode: row.mode ?? undefined, topic: row.topic ?? undefined, question: row.question, rawTranscript: row.raw_transcript ?? undefined, editedTranscript: row.edited_transcript ?? undefined, textFeedback: row.text_feedback ?? undefined, audioFeedback: row.audio_feedback ?? undefined, primaryEstimatedBand: asNumber(row.primary_estimated_band), fluencyAndCoherence: asNumber(row.fluency_and_coherence), lexicalResource: asNumber(row.lexical_resource), grammaticalRangeAndAccuracy: asNumber(row.grammatical_range_and_accuracy), pronunciation: asNumber(row.pronunciation), evaluationSource: row.evaluation_source, createdAt: row.created_at }
}

export function DashboardClient() {
  const [attempts, setAttempts] = useState<PracticeHistoryItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    async function loadDashboard() {
      try {
        const client = getSupabaseBrowserClient()
        const { data: authData, error: authError } = await client.auth.getUser()
        if (!isActive) return
        if (authError || !authData.user) { setIsLoggedIn(false); return }
        setIsLoggedIn(true)
        const { data, error: queryError } = await client.from('practice_attempts').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(200)
        if (queryError) throw new Error(queryError.message)
        if (isActive) setAttempts((data as DbAttempt[]).map(toHistoryItem))
      } catch (caught) {
        if (isActive) setError(caught instanceof Error ? caught.message : '进度数据读取失败，请稍后重试。')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    void loadDashboard()
    return () => { isActive = false }
  }, [])

  const stats = useMemo(() => {
    const criterionAverages = calculateCriterionAverages(attempts)
    return { averageBand: calculateAverageBand(attempts), latestBand: calculateLatestBand(attempts), highestBand: calculateHighestBand(attempts), criterionAverages, strongest: findStrongestCriterion(criterionAverages), weakest: findWeakestCriterion(criterionAverages) }
  }, [attempts])

  if (isLoading) return <div className="mt-10 h-44 animate-pulse rounded-2xl bg-slate-200" />
  if (isLoggedIn === false) return <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50 p-7 text-slate-700">登录后查看你的练习进度。<Link href="/auth/login" className="ml-2 font-semibold text-brand-700 underline">登录</Link></div>
  if (error) return <p role="alert" className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</p>
  if (!attempts.length) return <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 leading-7 text-slate-600">你还没有保存练习记录。完成一次练习并点击保存后，这里会显示你的进度分析。<Link href="/practice" className="ml-2 font-semibold text-brand-700 underline">去练习</Link></div>

  return <><DashboardStatsCards attempts={attempts} averageBand={stats.averageBand} latestBand={stats.latestBand} highestBand={stats.highestBand} /><CriterionBreakdown averages={stats.criterionAverages} strongest={stats.strongest} weakest={stats.weakest} /><RecentScoreTrend attempts={attempts} /><PartPracticeBreakdown attempts={attempts} /><NextRecommendationCard weakestCriterion={stats.weakest} /></>
}
