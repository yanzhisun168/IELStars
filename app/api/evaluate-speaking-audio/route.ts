import { NextResponse } from 'next/server'

import { buildAudioEvaluationPrompt } from '@/lib/audioEvaluationPrompt'
import type { AudioCriterionScores, AudioEvaluationRequestMeta, AudioSpeakingEvaluationResult } from '@/lib/audioEvaluationTypes'

const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const disclaimer = '该分数为 AI 预估结果，不是官方 IELTS 成绩，也不代表真实考试结果。'

function failed(error: string, qualityFlags: string[] = []): AudioSpeakingEvaluationResult {
  return { status: 'failed', disclaimer, evaluationMode: 'audio_first', error, qualityFlags }
}

function isPart(value: string): value is AudioEvaluationRequestMeta['part'] {
  return value === 'part1' || value === 'part2' || value === 'part3'
}

function stripFences(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
}

function isScores(value: unknown): value is AudioCriterionScores {
  if (!value || typeof value !== 'object') return false
  const scores = value as Record<string, unknown>
  return ['fluencyAndCoherence', 'lexicalResource', 'grammaticalRangeAndAccuracy', 'pronunciation'].every((key) => typeof scores[key] === 'number')
}

function parseResult(text: string): AudioSpeakingEvaluationResult {
  try {
    const parsed = JSON.parse(stripFences(text)) as Record<string, unknown>
    if (parsed.status === 'failed') return failed(typeof parsed.error === 'string' ? parsed.error : '录音无法可靠评估。', Array.isArray(parsed.qualityFlags) ? parsed.qualityFlags.filter((item): item is string => typeof item === 'string') : [])
    if (parsed.status !== 'completed' || !isScores(parsed.criteria) || typeof parsed.estimatedBand !== 'number' || !parsed.audioEvidence || !parsed.criteriaFeedback || !Array.isArray(parsed.strengths) || !Array.isArray(parsed.priorityImprovements) || !Array.isArray(parsed.corrections) || !parsed.betterAnswer || !parsed.nextPracticeTask) {
      return failed('Gemini 返回的录音反馈不完整，请重试。')
    }

    return {
      ...(parsed as unknown as Extract<AudioSpeakingEvaluationResult, { status: 'completed' }>),
      disclaimer,
      evaluationMode: 'audio_first',
      qualityFlags: Array.isArray(parsed.qualityFlags) ? parsed.qualityFlags.filter((item): item is string => typeof item === 'string') : [],
    }
  } catch {
    return failed('Gemini 返回了无效的反馈数据，请重试。')
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json(failed('Gemini 尚未配置。请在 .env.local 中添加 GEMINI_API_KEY 后重启开发服务器。'), { status: 500 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(failed('录音反馈请求格式无效。'), { status: 400 })
  }

  const audio = formData.get('audio')
  const part = formData.get('part')
  const question = formData.get('question')
  if (!(audio instanceof File) || !audio.size) return NextResponse.json(failed('未收到有效录音，请重新录制后再试。', ['audio_missing']), { status: 400 })
  if (audio.size > MAX_AUDIO_BYTES) return NextResponse.json(failed('录音文件超过 20MB，请缩短录音后重试。', ['audio_too_large']), { status: 400 })
  if (typeof part !== 'string' || !isPart(part) || typeof question !== 'string' || !question.trim()) return NextResponse.json(failed('题型和题目不能为空。'), { status: 400 })

  const rawTargetBand = formData.get('targetBand')
  const targetBand = typeof rawTargetBand === 'string' && rawTargetBand.trim() ? Number(rawTargetBand) : undefined
  const meta: AudioEvaluationRequestMeta = {
    part,
    question: question.trim(),
    topic: typeof formData.get('topic') === 'string' ? String(formData.get('topic')).trim() : undefined,
    rawTranscript: typeof formData.get('rawTranscript') === 'string' ? String(formData.get('rawTranscript')).trim() : undefined,
    editedTranscript: typeof formData.get('editedTranscript') === 'string' ? String(formData.get('editedTranscript')).trim() : undefined,
    targetBand: Number.isFinite(targetBand) ? targetBand : undefined,
    mode: typeof formData.get('mode') === 'string' ? String(formData.get('mode')) : undefined,
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const audioMimeType = audio.type || 'audio/webm'

  try {
    const base64Audio = Buffer.from(await audio.arrayBuffer()).toString('base64')
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildAudioEvaluationPrompt(meta) }, { inline_data: { mime_type: audioMimeType, data: base64Audio } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    })

    if (!response.ok) return NextResponse.json(failed(`Gemini 录音反馈请求失败（${response.status}），请重试。`), { status: 502 })
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> }
    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (typeof content !== 'string') return NextResponse.json(failed('Gemini 未返回录音反馈内容，请重试。'), { status: 502 })

    const result = parseResult(content)
    return NextResponse.json(result, { status: result.status === 'completed' ? 200 : 502 })
  } catch {
    return NextResponse.json(failed('无法连接 Gemini，请检查网络和配置后重试。'), { status: 502 })
  }
}
