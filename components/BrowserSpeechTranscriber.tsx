'use client'

import { useEffect, useRef } from 'react'

import { useBrowserSpeechRecognition } from '@/hooks/useBrowserSpeechRecognition'
import { copy } from '@/lib/i18n'

type BrowserSpeechTranscriberProps = { onTranscriptUpdate: (value: string) => void; resetKey?: string | number }

export function BrowserSpeechTranscriber({ onTranscriptUpdate, resetKey }: BrowserSpeechTranscriberProps) {
  const previousResetKey = useRef(resetKey)
  const skipNextTranscriptUpdateRef = useRef(false)
  const { error, finalTranscript, interimTranscript, isListening, isSupported, language, resetTranscript, setLanguage, startListening, stopListening } = useBrowserSpeechRecognition()

  useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey
      skipNextTranscriptUpdateRef.current = true
      resetTranscript()
    }
  }, [resetKey, resetTranscript])

  useEffect(() => {
    if (skipNextTranscriptUpdateRef.current) {
      skipNextTranscriptUpdateRef.current = false
      return
    }
    onTranscriptUpdate(finalTranscript)
  }, [finalTranscript, onTranscriptUpdate])

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="实时语音转写">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-base font-semibold text-ink">{copy.transcription.title}</h2><p className="mt-1 text-sm text-slate-500">{isSupported ? copy.transcription.supported : copy.transcription.checking}</p></div>
        <select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={isListening} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60" aria-label={copy.transcription.languageLabel}><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option></select>
      </div>
      {!isSupported ? <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">{copy.transcription.unsupported}</p> : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={startListening} disabled={!isSupported || isListening} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{copy.transcription.start}</button><button type="button" onClick={stopListening} disabled={!isListening} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{copy.transcription.stop}</button><button type="button" onClick={resetTranscript} className="rounded-lg border border-brand-200 bg-brand-50 px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-100">{copy.transcription.reset}</button></div>
      {interimTranscript ? <div className="mt-5 rounded-xl border border-dashed border-brand-200 bg-brand-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{copy.transcription.listening}</p><p className="mt-2 text-sm leading-6 text-slate-700">{interimTranscript}</p></div> : null}
      {finalTranscript ? <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.transcription.recognised}</p><p className="mt-2 text-sm leading-6 text-slate-700">{finalTranscript}</p></div> : null}
      {error ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}
      <p className="mt-5 text-sm leading-6 text-slate-500">{copy.transcription.note}</p>
    </section>
  )
}
