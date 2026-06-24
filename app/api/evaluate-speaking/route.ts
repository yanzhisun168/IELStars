import { NextResponse } from 'next/server'

import { buildSpeakingEvaluationPrompt } from '@/lib/evaluationPrompt'
import type { CriterionFeedback, CriterionName, EvaluationRequest, SpeakingEvaluationResult, SpeakingPart } from '@/lib/evaluationTypes'
import { copy } from '@/lib/i18n'

const disclaimer = copy.feedback.disclaimer
const criterionNames: CriterionName[] = ['fluencyAndCoherence', 'lexicalResource', 'grammaticalRangeAndAccuracy', 'pronunciation']

type CompletedEvaluation = Extract<SpeakingEvaluationResult, { status: 'completed' }>

function failedResult(error: string, qualityFlags: string[] = []): SpeakingEvaluationResult {
  return { status: 'failed', error, qualityFlags }
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function isSpeakingPart(value: unknown): value is SpeakingPart {
  return value === 'part1' || value === 'part2' || value === 'part3'
}

function isEvaluationRequest(value: unknown): value is EvaluationRequest {
  if (!value || typeof value !== 'object') return false
  const input = value as Record<string, unknown>

  return isSpeakingPart(input.part)
    && typeof input.question === 'string'
    && typeof input.topic === 'string'
    && typeof input.transcript === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isCriterionFeedback(value: unknown): value is CriterionFeedback {
  if (!isRecord(value) || typeof value.strength !== 'string' || typeof value.improvement !== 'string' || !isStringArray(value.evidence)) return false
  return value.assessmentConfidence === undefined || value.assessmentConfidence === 'low' || value.assessmentConfidence === 'medium' || value.assessmentConfidence === 'high'
}

function isCompletedEvaluation(value: unknown): value is CompletedEvaluation {
  if (!isRecord(value) || value.status !== 'completed' || typeof value.estimatedBand !== 'number') return false
  if (value.confidence !== 'low' && value.confidence !== 'medium' && value.confidence !== 'high') return false
  if (typeof value.summary !== 'string' || !isStringArray(value.strengths) || !isStringArray(value.priorityImprovements) || !isStringArray(value.qualityFlags)) return false
  if (!isRecord(value.criteria) || !isRecord(value.criteriaFeedback) || !isRecord(value.betterAnswer) || !isRecord(value.nextPracticeTask) || !Array.isArray(value.corrections)) return false

  const criteria = value.criteria as Record<string, unknown>
  const criteriaFeedback = value.criteriaFeedback as Record<string, unknown>
  const betterAnswer = value.betterAnswer as Record<string, unknown>
  const nextPracticeTask = value.nextPracticeTask as Record<string, unknown>
  const corrections = value.corrections as unknown[]
  const hasValidCriteria = criterionNames.every((name) => typeof criteria[name] === 'number' && isCriterionFeedback(criteriaFeedback[name]))
  const hasValidCorrections = corrections.every((correction) => isRecord(correction)
    && typeof correction.original === 'string'
    && typeof correction.suggested === 'string'
    && typeof correction.type === 'string'
    && typeof correction.explanation === 'string')
  const hasValidBetterAnswer = typeof betterAnswer.text === 'string'
    && typeof betterAnswer.level === 'string'
    && isStringArray(betterAnswer.notes)
  const hasValidNextTask = typeof nextPracticeTask.type === 'string'
    && typeof nextPracticeTask.instruction === 'string'
    && criterionNames.includes(nextPracticeTask.focusCriterion as CriterionName)

  return hasValidCriteria && hasValidCorrections && hasValidBetterAnswer && hasValidNextTask
}

function parseEvaluation(content: string): SpeakingEvaluationResult {
  const json = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed: unknown = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return failedResult(copy.errors.invalidEvaluation)

    const result = parsed as Record<string, unknown>
    if (result.status === 'failed') {
      return failedResult(typeof result.error === 'string' ? result.error : copy.errors.cannotEvaluate, isStringArray(result.qualityFlags) ? result.qualityFlags : [])
    }

    if (!isCompletedEvaluation(result)) {
      return failedResult(copy.errors.incompleteEvaluation)
    }

    return {
      ...result,
      disclaimer,
      qualityFlags: result.qualityFlags,
    }
  } catch {
    return failedResult(copy.errors.invalidJson)
  }
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(failedResult(copy.errors.invalidRequest), { status: 400 })
  }

  if (!isEvaluationRequest(body)) {
    return NextResponse.json(failedResult(copy.errors.missingEvaluationFields), { status: 400 })
  }

  const input: EvaluationRequest = {
    ...body,
    question: body.question.trim(),
    topic: body.topic.trim(),
    transcript: body.transcript.trim(),
  }

  if (!input.question || !input.topic || !input.transcript) {
    return NextResponse.json(failedResult(copy.errors.missingEvaluationFields), { status: 400 })
  }

  if (countWords(input.transcript) < 8) {
    return NextResponse.json(failedResult(copy.errors.answerTooShort, ['answer_too_short']), { status: 400 })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json(failedResult(copy.errors.deepseekConfig), { status: 500 })
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildSpeakingEvaluationPrompt(input) }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      return NextResponse.json(failedResult(`${copy.errors.deepseekFailed}（${response.status}）`), { status: 502 })
    }

    const payload: unknown = await response.json()
    const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      return NextResponse.json(failedResult(copy.errors.deepseekNoContent), { status: 502 })
    }

    const result = parseEvaluation(content)
    return NextResponse.json(result, { status: result.status === 'completed' ? 200 : 502 })
  } catch {
    return NextResponse.json(failedResult(copy.errors.deepseekNetwork), { status: 502 })
  }
}
