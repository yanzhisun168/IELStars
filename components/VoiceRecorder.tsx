'use client'

import { useEffect, useRef } from 'react'

import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { copy } from '@/lib/i18n'
import { formatTime } from '@/lib/formatTime'

type VoiceRecorderProps = {
  maxDurationSeconds?: number
  minDurationSeconds?: number
  onRecordingComplete?: (audioBlob: Blob) => void
  onRecordingStateChange?: (isRecording: boolean) => void
  resetKey?: string | number
}

export function VoiceRecorder({ maxDurationSeconds = 60, minDurationSeconds = 8, onRecordingComplete, onRecordingStateChange, resetKey }: VoiceRecorderProps) {
  const previousResetKey = useRef(resetKey)
  const { audioBlob, audioMimeType, audioUrl, durationSeconds, error, isReadyToPlay, isRecording, resetRecording, startRecording, stopRecording } = useVoiceRecorder({ onRecordingComplete })

  useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey
      resetRecording()
    }
  }, [resetKey, resetRecording])

  useEffect(() => {
    if (!isRecording) return
    const stopTimer = window.setTimeout(stopRecording, maxDurationSeconds * 1000)
    return () => window.clearTimeout(stopTimer)
  }, [isRecording, maxDurationSeconds, stopRecording])

  useEffect(() => {
    onRecordingStateChange?.(isRecording)
  }, [isRecording, onRecordingStateChange])

  const status = isRecording ? copy.recorder.recording : isReadyToPlay ? copy.recorder.readyToPlay : copy.recorder.ready
  const isTooShort = isReadyToPlay && durationSeconds < minDurationSeconds
  const isEmptyBlob = audioBlob?.size === 0

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="录音器">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-ink">{status}</p><p className="mt-1 text-sm text-slate-500">{copy.recorder.elapsed}：<span className="font-semibold tabular-nums text-slate-700">{formatTime(durationSeconds)}</span> / {formatTime(maxDurationSeconds)}</p></div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${isRecording ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{isRecording ? `● ${copy.recorder.live}` : copy.recorder.microphone}</span>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={startRecording} disabled={isRecording} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{copy.recorder.start}</button>
        <button type="button" onClick={stopRecording} disabled={!isRecording} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{copy.recorder.stop}</button>
        {isReadyToPlay ? <button type="button" onClick={resetRecording} className="rounded-lg border border-brand-200 bg-brand-50 px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-100">{copy.recorder.retry}</button> : null}
      </div>
      {error ? <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}
      {audioUrl ? <audio className="mt-5 w-full" controls muted={false} preload="metadata" src={audioUrl}>你的浏览器不支持音频播放。</audio> : null}
      {audioBlob ? <p className="mt-3 text-sm text-slate-500">{copy.recorder.audioData}：<span className="font-medium text-slate-700">{(audioBlob.size / 1024).toFixed(1)} KB</span> · {copy.recorder.mimeType}：<span className="font-medium text-slate-700">{audioMimeType || audioBlob.type || copy.common.unknown}</span></p> : null}
      {isEmptyBlob ? <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">{copy.recorder.noAudio}</p> : null}
      {isTooShort ? <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">{copy.recorder.tooShort(formatTime(minDurationSeconds))}</p> : null}
      <p className="mt-5 text-sm leading-6 text-slate-500">{copy.recorder.futureNote}</p>
    </section>
  )
}
