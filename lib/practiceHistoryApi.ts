import type { PracticeHistoryItem, SavePracticeAttemptInput, SavedPracticeAttempt } from '@/lib/historyTypes'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const { data, error } = await getSupabaseBrowserClient().auth.getSession()
  if (error || !data.session?.access_token) throw new Error('请先登录后再继续。')
  return { Authorization: `Bearer ${data.session.access_token}` }
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: unknown }
    return typeof body.error === 'string' ? body.error : '请求未能完成，请稍后重试。'
  } catch { return '请求未能完成，请稍后重试。' }
}

export async function savePracticeAttempt(input: SavePracticeAttemptInput): Promise<SavedPracticeAttempt> {
  const response = await fetch('/api/practice-attempts', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await getAuthorizationHeader()) }, body: JSON.stringify(input) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<SavedPracticeAttempt>
}

export async function fetchPracticeHistory(limit = 20): Promise<PracticeHistoryItem[]> {
  const response = await fetch(`/api/practice-attempts?limit=${encodeURIComponent(String(limit))}`, { headers: await getAuthorizationHeader(), cache: 'no-store' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<PracticeHistoryItem[]>
}
