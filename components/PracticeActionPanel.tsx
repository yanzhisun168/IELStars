import Link from 'next/link'

import { copy } from '@/lib/i18n'

type PracticeActionPanelProps = { onRetry: () => void; onNextQuestion: () => void; backHref: string; nextTaskLabel?: string; onStartNextTask?: () => void }

export function PracticeActionPanel({ onRetry, onNextQuestion, backHref, nextTaskLabel, onStartNextTask }: PracticeActionPanelProps) {
  return <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:p-6"><h2 className="text-lg font-semibold text-ink">{copy.actions.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy.actions.description}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><button type="button" onClick={onRetry} className="rounded-lg border border-brand-200 bg-white px-4 py-3 font-semibold text-brand-700 transition hover:bg-brand-50">{copy.actions.retry}</button><button type="button" onClick={onNextQuestion} className="rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700">{copy.actions.next}</button><Link href={backHref} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50">{copy.common.backToPracticeHub}</Link></div>{nextTaskLabel && onStartNextTask ? <button type="button" onClick={onStartNextTask} className="mt-3 text-sm font-semibold text-brand-700 hover:text-brand-800">{nextTaskLabel} →</button> : null}</section>
}
