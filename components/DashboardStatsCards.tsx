import type { PracticeHistoryItem } from '@/lib/historyTypes'

type DashboardStatsCardsProps = { attempts: PracticeHistoryItem[]; averageBand: number | null; latestBand: number | null; highestBand: number | null }

export function DashboardStatsCards({ attempts, averageBand, latestBand, highestBand }: DashboardStatsCardsProps) {
  const audioCount = attempts.filter((attempt) => attempt.evaluationSource === 'audio_first' || attempt.evaluationSource === 'both').length
  const textCount = attempts.filter((attempt) => attempt.evaluationSource === 'text_only' || attempt.evaluationSource === 'both').length
  const cards = [
    ['总练习次数', String(attempts.length)], ['平均预估分', averageBand?.toFixed(1) ?? '—'], ['最近一次分数', latestBand?.toFixed(1) ?? '—'], ['最高分', highestBand?.toFixed(1) ?? '—'], ['录音客观反馈次数', String(audioCount)], ['文本反馈次数', String(textCount)],
  ]
  return <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p></div>)}</section>
}
