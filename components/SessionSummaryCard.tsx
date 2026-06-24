import type { CriterionName } from '@/lib/evaluationTypes'
import { copy } from '@/lib/i18n'
import type { PracticeAttempt } from '@/lib/practiceFlowTypes'

type SessionSummaryCardProps = { attempts: PracticeAttempt[] }

const labels: Record<CriterionName, string> = { fluencyAndCoherence: copy.feedback.fluencyAndCoherence, lexicalResource: copy.feedback.lexicalResource, grammaticalRangeAndAccuracy: copy.feedback.grammaticalRangeAndAccuracy, pronunciation: copy.feedback.pronunciation }
const keys = Object.keys(labels) as CriterionName[]

export function SessionSummaryCard({ attempts }: SessionSummaryCardProps) {
  const feedbackAttempts = attempts.filter((attempt) => attempt.hasFeedback && typeof attempt.estimatedBand === 'number')
  const averageBand = feedbackAttempts.length ? feedbackAttempts.reduce((total, attempt) => total + (attempt.estimatedBand ?? 0), 0) / feedbackAttempts.length : null
  const averages = keys.map((key) => { const values = feedbackAttempts.flatMap((attempt) => typeof attempt.criteria?.[key] === 'number' ? [attempt.criteria[key]] : []); return { key, average: values.length ? values.reduce((total, value) => total + value, 0) / values.length : null } }).filter((item): item is { key: CriterionName; average: number } => item.average !== null)
  const strongest = averages.length ? averages.reduce((best, item) => item.average > best.average ? item : best) : null
  const weakest = averages.length ? averages.reduce((lowest, item) => item.average < lowest.average ? item : lowest) : null

  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">{copy.sessionSummary.title}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{copy.sessionSummary.attempted}</p><p className="mt-2 text-2xl font-bold text-ink">{attempts.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{copy.sessionSummary.withFeedback}</p><p className="mt-2 text-2xl font-bold text-ink">{feedbackAttempts.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{copy.sessionSummary.averageBand}</p><p className="mt-2 text-2xl font-bold text-ink">{averageBand === null ? '—' : averageBand.toFixed(1)}</p></div></div><div className="mt-5 grid gap-4 text-sm leading-6 text-slate-600 sm:grid-cols-2"><p><span className="font-semibold text-slate-800">{copy.sessionSummary.strongest}：</span>{strongest ? labels[strongest.key] : copy.sessionSummary.notEnough}</p><p><span className="font-semibold text-slate-800">{copy.sessionSummary.focusArea}：</span>{weakest ? labels[weakest.key] : copy.sessionSummary.notEnough}</p></div><p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-800">{weakest ? copy.sessionSummary.recommendation(labels[weakest.key]) : copy.sessionSummary.noRecommendation}</p></section>
}
