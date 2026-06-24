import { getRecentAttempts } from '@/lib/dashboardStats'
import type { PracticeHistoryItem } from '@/lib/historyTypes'

type RecentScoreTrendProps = { attempts: PracticeHistoryItem[] }
const sourceLabels = { text_only: '文本反馈', audio_first: '录音客观反馈', both: '录音 + 文本反馈' } as const

export function RecentScoreTrend({ attempts }: RecentScoreTrendProps) {
  const recent = getRecentAttempts(attempts)
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-sm font-semibold text-brand-700">最近分数变化</p><h2 className="mt-1 text-xl font-semibold text-ink">最近 7 次已保存练习</h2>{recent.length < 2 ? <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-800">保存更多练习记录后，这里会显示更可靠的趋势变化。</p> : <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="pb-3 pr-4 font-semibold">日期</th><th className="pb-3 pr-4 font-semibold">题型</th><th className="pb-3 pr-4 font-semibold">反馈来源</th><th className="pb-3 text-right font-semibold">预估分</th></tr></thead><tbody>{recent.map((attempt) => <tr key={attempt.id} className="border-b border-slate-100 last:border-0"><td className="py-3 pr-4 text-slate-600">{new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(attempt.createdAt))}</td><td className="py-3 pr-4 font-medium text-slate-700">{attempt.part.toUpperCase()}</td><td className="py-3 pr-4 text-slate-600">{sourceLabels[attempt.evaluationSource]}</td><td className="py-3 text-right font-semibold text-ink">{attempt.primaryEstimatedBand?.toFixed(1) ?? '—'}</td></tr>)}</tbody></table></div>}</section>
}
