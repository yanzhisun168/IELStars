import { NextResponse } from 'next/server'

import type { EvaluationSource, PracticeHistoryItem, SavePracticeAttemptInput } from '@/lib/historyTypes'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

type DbAttempt = {
  id: string; user_id: string; part: 'part1' | 'part2' | 'part3'; mode: string | null; topic: string | null; question: string
  raw_transcript: string | null; edited_transcript: string | null
  text_feedback: PracticeHistoryItem['textFeedback'] | null; audio_feedback: PracticeHistoryItem['audioFeedback'] | null
  primary_estimated_band: number | string | null; fluency_and_coherence: number | string | null; lexical_resource: number | string | null
  grammatical_range_and_accuracy: number | string | null; pronunciation: number | string | null; evaluation_source: EvaluationSource; created_at: string
}

function asNumber(value: number | string | null): number | undefined {
  if (value === null) return undefined
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toHistoryItem(row: DbAttempt): PracticeHistoryItem {
  return { id: row.id, userId: row.user_id, part: row.part, mode: row.mode ?? undefined, topic: row.topic ?? undefined, question: row.question, rawTranscript: row.raw_transcript ?? undefined, editedTranscript: row.edited_transcript ?? undefined, textFeedback: row.text_feedback ?? undefined, audioFeedback: row.audio_feedback ?? undefined, primaryEstimatedBand: asNumber(row.primary_estimated_band), fluencyAndCoherence: asNumber(row.fluency_and_coherence), lexicalResource: asNumber(row.lexical_resource), grammaticalRangeAndAccuracy: asNumber(row.grammatical_range_and_accuracy), pronunciation: asNumber(row.pronunciation), evaluationSource: row.evaluation_source, createdAt: row.created_at }
}

async function getAuthenticatedUser(request: Request) {
  const header = request.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return { error: '请先登录后再访问练习记录。', status: 401 } as const
  try {
    const { data, error } = await getSupabaseAdminClient().auth.getUser(token)
    if (error || !data.user) return { error: '登录状态已失效，请重新登录。', status: 401 } as const
    return { user: data.user } as const
  } catch (error) { return { error: error instanceof Error ? error.message : '认证服务暂时不可用。', status: 500 } as const }
}

function isPart(value: unknown): value is SavePracticeAttemptInput['part'] { return value === 'part1' || value === 'part2' || value === 'part3' }
function isCompletedFeedback(value: unknown): value is { estimatedBand: number; criteria: Record<string, number> } { return Boolean(value) && typeof value === 'object' && typeof (value as { estimatedBand?: unknown }).estimatedBand === 'number' && Boolean((value as { criteria?: unknown }).criteria) }

function buildInsert(input: SavePracticeAttemptInput, userId: string) {
  const textFeedback = input.textFeedback ?? null
  const audioFeedback = input.audioFeedback ?? null
  const primary = audioFeedback ?? textFeedback
  const source: EvaluationSource = audioFeedback && textFeedback ? 'both' : audioFeedback ? 'audio_first' : 'text_only'
  const criteria = isCompletedFeedback(primary) ? primary.criteria : undefined
  return { user_id: userId, part: input.part, mode: input.mode ?? null, topic: input.topic ?? null, question: input.question.trim(), raw_transcript: input.rawTranscript?.trim() || null, edited_transcript: input.editedTranscript?.trim() || null, text_feedback: textFeedback, audio_feedback: audioFeedback, primary_estimated_band: isCompletedFeedback(primary) ? primary.estimatedBand : null, fluency_and_coherence: criteria?.fluencyAndCoherence ?? null, lexical_resource: criteria?.lexicalResource ?? null, grammatical_range_and_accuracy: criteria?.grammaticalRangeAndAccuracy ?? null, pronunciation: criteria?.pronunciation ?? null, evaluation_source: source }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  let input: SavePracticeAttemptInput
  try { input = await request.json() as SavePracticeAttemptInput } catch { return NextResponse.json({ error: '请求内容必须是有效的 JSON。' }, { status: 400 }) }
  if (!isPart(input.part) || typeof input.question !== 'string' || !input.question.trim() || (!input.textFeedback && !input.audioFeedback)) return NextResponse.json({ error: '请提供题型、题目和至少一份已完成的反馈。' }, { status: 400 })
  try {
    const { data, error } = await getSupabaseAdminClient().from('practice_attempts').insert(buildInsert(input, auth.user.id)).select().single()
    if (error || !data) return NextResponse.json({ error: error?.message || '练习记录保存失败，请重试。' }, { status: 500 })
    return NextResponse.json(toHistoryItem(data as DbAttempt), { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '练习记录保存失败，请重试。' }, { status: 500 }) }
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const rawLimit = Number(new URL(request.url).searchParams.get('limit') ?? '20')
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.floor(rawLimit), 100)) : 20
  try {
    const { data, error } = await getSupabaseAdminClient().from('practice_attempts').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json((data as DbAttempt[]).map(toHistoryItem))
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '练习记录读取失败，请重试。' }, { status: 500 }) }
}
