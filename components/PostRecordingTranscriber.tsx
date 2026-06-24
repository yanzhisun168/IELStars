'use client'

import { useEffect, useRef, useState } from 'react'

import { transcribeRecordingAudio } from '@/lib/transcribeRecording'

type PostRecordingTranscriberProps = { audioBlob: Blob | null; part?: string; question?: string; topic?: string; onTranscriptGenerated: (transcript: string) => void; onRawTranscriptGenerated?: (rawTranscript: string) => void; resetKey?: string | number }

export function PostRecordingTranscriber({ audioBlob, part, question, topic, onTranscriptGenerated, onRawTranscriptGenerated, resetKey }: PostRecordingTranscriberProps) {
  const previousResetKey = useRef(resetKey)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (previousResetKey.current !== resetKey) { previousResetKey.current = resetKey; setIsTranscribing(false); setMessage(null); setError(null) }
  }, [resetKey])

  async function generateTranscript() {
    if (!audioBlob) return
    setIsTranscribing(true); setMessage(null); setError(null)
    const result = await transcribeRecordingAudio({ audioBlob, part, question, topic })
    setIsTranscribing(false)
    if (result.status === 'failed') { setError(result.error); return }
    onRawTranscriptGenerated?.(result.rawTranscript || result.transcript)
    onTranscriptGenerated(result.transcript)
    setMessage('转写完成，请检查并修改文本。')
  }

  return <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-semibold text-ink">从录音生成文本</h2><p className="mt-1 text-sm leading-6 text-slate-500">该转写基于你的原始录音生成，不会主动润色语法。</p></div><button type="button" onClick={generateTranscript} disabled={!audioBlob || isTranscribing} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{isTranscribing ? '正在从录音生成文本…' : '从录音生成文本'}</button></div>{!audioBlob ? <p className="mt-4 text-sm text-slate-500">录音结束后可以从录音生成文本。</p> : null}{message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}{error ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}</section>
}
