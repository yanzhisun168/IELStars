import type { EvaluationRequest, SpeakingEvaluationResult } from '@/lib/evaluationTypes'

function failedResult(error: string, qualityFlags: string[] = []): SpeakingEvaluationResult {
  return { status: 'failed', error, qualityFlags }
}

export async function evaluateSpeakingAnswer(input: EvaluationRequest): Promise<SpeakingEvaluationResult> {
  try {
    const response = await fetch('/api/evaluate-speaking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const result = await response.json() as SpeakingEvaluationResult
    if (!response.ok && result.status !== 'failed') {
      return failedResult('反馈服务暂时无法处理本次回答，请重试。')
    }

    return result
  } catch {
    return failedResult('无法连接反馈服务，请检查网络后重试。')
  }
}
