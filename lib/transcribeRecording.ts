import type { AudioTranscriptionResult } from '@/lib/audioTranscriptionTypes'

function failed(error: string): AudioTranscriptionResult { return { status: 'failed', transcript: '', error } }

export async function transcribeRecordingAudio(input: { audioBlob: Blob; part?: string; question?: string; topic?: string }): Promise<AudioTranscriptionResult> {
  try {
    const formData = new FormData()
    formData.append('audio', input.audioBlob, `answer.${input.audioBlob.type.includes('webm') ? 'webm' : 'audio'}`)
    if (input.part) formData.append('part', input.part)
    if (input.question) formData.append('question', input.question)
    if (input.topic) formData.append('topic', input.topic)
    const response = await fetch('/api/transcribe-recording', { method: 'POST', body: formData })
    const result = await response.json() as AudioTranscriptionResult
    if (result.status === 'completed' || result.status === 'failed') return result
    return failed('录音转写服务返回了无效结果，请重试。')
  } catch {
    return failed('无法连接录音转写服务，请检查网络后重试。')
  }
}
