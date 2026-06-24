'use client'

import { copy } from '@/lib/i18n'
import { countCharacters, countWords } from '@/lib/textStats'

type TranscriptEditorProps = { transcript: string; rawTranscript?: string; onTranscriptChange: (value: string) => void; placeholder?: string; minWords?: number; error?: string | null; helperText?: string }

export function TranscriptEditor({ transcript, rawTranscript, onTranscriptChange, placeholder = copy.transcriptEditor.placeholder, minWords = 10, error, helperText = copy.transcriptEditor.helper }: TranscriptEditorProps) {
  const wordCount = countWords(transcript)
  const characterCount = countCharacters(transcript)
  const qualityHint = wordCount === 0 ? copy.transcriptEditor.empty : wordCount < minWords ? copy.transcriptEditor.tooShort : copy.transcriptEditor.ready

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-base font-semibold text-ink">{copy.transcriptEditor.title}</h2><p className="text-sm text-slate-500">{copy.transcriptEditor.wordCount}：{wordCount} · {copy.transcriptEditor.characterCount}：{characterCount}</p></div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helperText}</p>
      <p className="mt-2 text-sm leading-6 text-brand-700">{copy.transcriptEditor.audioFirstNote}</p>
      {rawTranscript ? <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">原始转写：来自录音，不建议手动美化</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{rawTranscript}</p></div> : null}
      <p className="mt-4 text-sm font-semibold text-slate-700">修改后文本：可用于辅助理解，不会提高录音客观评分</p>
      <textarea value={transcript} onChange={(event) => onTranscriptChange(event.target.value)} placeholder={placeholder} className="mt-3 min-h-40 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      {error ? <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p> : null}
      <p className={`mt-3 text-sm font-medium ${wordCount >= minWords ? 'text-emerald-700' : 'text-amber-700'}`}>{qualityHint}</p>
    </section>
  )
}
