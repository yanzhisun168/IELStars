import type { AudioEvaluationRequestMeta, AudioSpeakingEvaluationResult } from '@/lib/audioEvaluationTypes'

type AudioEvaluationInput = AudioEvaluationRequestMeta & { audioBlob: Blob }

function failed(error: string, qualityFlags: string[] = []): AudioSpeakingEvaluationResult {
  return { status: 'failed', disclaimer: '该分数为 AI 预估结果，不是官方 IELTS 成绩，也不代表真实考试结果。', evaluationMode: 'audio_first', error, qualityFlags }
}

export async function evaluateSpeakingAudio(input: AudioEvaluationInput): Promise<AudioSpeakingEvaluationResult> {
  try {
    const formData = new FormData()
    formData.append('audio', input.audioBlob, `answer.${input.audioBlob.type.includes('webm') ? 'webm' : 'audio'}`)
    formData.append('part', input.part)
    formData.append('question', input.question)
    if (input.topic) formData.append('topic', input.topic)
    if (input.rawTranscript) formData.append('rawTranscript', input.rawTranscript)
    if (input.editedTranscript) formData.append('editedTranscript', input.editedTranscript)
    if (input.targetBand) formData.append('targetBand', String(input.targetBand))
    if (input.mode) formData.append('mode', input.mode)

    const response = await fetch('/api/evaluate-speaking-audio', { method: 'POST', body: formData })
    const result = await response.json() as AudioSpeakingEvaluationResult
    return result.status === 'completed' || result.status === 'failed' ? result : failed('录音反馈服务返回了无效结果。')
  } catch {
    return failed('无法连接录音反馈服务，请检查网络后重试。')
  }
}
