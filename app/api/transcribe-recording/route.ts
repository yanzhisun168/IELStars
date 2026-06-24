import { NextResponse } from 'next/server'

import { buildAudioTranscriptionPrompt } from '@/lib/audioTranscriptionPrompt'
import type { AudioTranscriptionResult } from '@/lib/audioTranscriptionTypes'

const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const transientStatuses = new Set([429, 500, 502, 503, 504])
const failed = (error: string, qualityFlags: string[] = []): AudioTranscriptionResult => ({ status: 'failed', transcript: '', error, qualityFlags })
const stripFences = (text: string) => text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

function parseResult(text: string): AudioTranscriptionResult {
  try {
    const parsed = JSON.parse(stripFences(text)) as Record<string, unknown>
    if (parsed.status === 'failed') return failed(typeof parsed.error === 'string' ? parsed.error : '录音无法可靠转写。', Array.isArray(parsed.qualityFlags) ? parsed.qualityFlags.filter((item): item is string => typeof item === 'string') : [])
    if (parsed.status !== 'completed' || typeof parsed.transcript !== 'string' || !parsed.transcript.trim()) return failed('Gemini 返回的转写内容无效，请重试。')
    return { status: 'completed', transcript: parsed.transcript.trim(), rawTranscript: typeof parsed.rawTranscript === 'string' ? parsed.rawTranscript.trim() : parsed.transcript.trim(), language: typeof parsed.language === 'string' ? parsed.language : undefined, confidence: parsed.confidence === 'low' || parsed.confidence === 'medium' || parsed.confidence === 'high' ? parsed.confidence : undefined, warning: typeof parsed.warning === 'string' ? parsed.warning : undefined, qualityFlags: Array.isArray(parsed.qualityFlags) ? parsed.qualityFlags.filter((item): item is string => typeof item === 'string') : [] }
  } catch { return failed('Gemini 返回的转写格式无效，请重试。') }
}

type GeminiCall = { response: Response; model: string }

async function requestGeminiTranscription(input: { apiKey: string; model: string; prompt: string; audioMimeType: string; base64Audio: string }): Promise<GeminiCall> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: input.prompt }, { inline_data: { mime_type: input.audioMimeType, data: input.base64Audio } }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }) })
  return { response, model: input.model }
}

function errorMessageForStatus(status: number) {
  if (status === 401 || status === 403) return 'Gemini API 配置或访问权限无效，请检查 API key。'
  if (status === 429) return 'Gemini 请求过于频繁或当前配额不足，请稍后重试。'
  if (status >= 500) return 'Gemini 音频转写服务暂时不可用，已尝试备用模型，请稍后重试。'
  return `Gemini 录音转写请求失败（${status}），请重试。`
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json(failed('Gemini 尚未配置。请在 .env.local 中添加 GEMINI_API_KEY 后重启开发服务器。'), { status: 500 })
  let formData: FormData
  try { formData = await request.formData() } catch { return NextResponse.json(failed('录音转写请求格式无效。'), { status: 400 }) }
  const audio = formData.get('audio')
  if (!(audio instanceof File) || !audio.size) return NextResponse.json(failed('未收到有效录音，请重新录制后再试。', ['audio_missing']), { status: 400 })
  if (audio.size > MAX_AUDIO_BYTES) return NextResponse.json(failed('录音文件超过 20MB，请缩短录音后重试。', ['audio_too_large']), { status: 400 })

  const primaryModel = process.env.GEMINI_MODEL_PRIMARY || process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const fallbackModel = process.env.GEMINI_MODEL_FALLBACK || 'gemini-2.5-flash'
  const models = [...new Set([primaryModel, fallbackModel])]
  const prompt = buildAudioTranscriptionPrompt({ part: typeof formData.get('part') === 'string' ? String(formData.get('part')) : undefined, question: typeof formData.get('question') === 'string' ? String(formData.get('question')) : undefined, topic: typeof formData.get('topic') === 'string' ? String(formData.get('topic')) : undefined })

  try {
    const base64Audio = Buffer.from(await audio.arrayBuffer()).toString('base64')
    let lastStatus = 502
    for (const model of models) {
      for (let retry = 0; retry < 2; retry += 1) {
        const { response } = await requestGeminiTranscription({ apiKey, model, prompt, audioMimeType: audio.type || 'audio/webm', base64Audio })
        lastStatus = response.status
        if (response.ok) {
          const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> }
          const content = payload.candidates?.[0]?.content?.parts?.[0]?.text
          if (typeof content !== 'string') return NextResponse.json(failed('Gemini 未返回录音转写内容，请重试。'), { status: 502 })
          const result = parseResult(content)
          return NextResponse.json(result, { status: result.status === 'completed' ? 200 : 422 })
        }
        console.warn('[transcribe-recording] Gemini request failed', { model, status: response.status, retry })
        if (!transientStatuses.has(response.status)) return NextResponse.json(failed(errorMessageForStatus(response.status)), { status: response.status })
        if (retry === 0) await delay(350)
      }
    }
    return NextResponse.json(failed(errorMessageForStatus(lastStatus)), { status: lastStatus === 429 ? 429 : 502 })
  } catch (error) {
    console.error('[transcribe-recording] Gemini network failure', { message: error instanceof Error ? error.message : 'unknown' })
    return NextResponse.json(failed('无法连接 Gemini，请检查网络和配置后重试。'), { status: 502 })
  }
}
