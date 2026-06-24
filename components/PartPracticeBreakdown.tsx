import { countAttemptsByPart } from '@/lib/dashboardStats'
import type { PracticeHistoryItem } from '@/lib/historyTypes'

type PartPracticeBreakdownProps = { attempts: PracticeHistoryItem[] }

export function PartPracticeBreakdown({ attempts }: PartPracticeBreakdownProps) {
  const counts = countAttemptsByPart(attempts)
  const items: Array<{ label: string; count: number }> = [{ label: 'Part 1', count: counts.part1 }, { label: 'Part 2', count: counts.part2 }, { label: 'Part 3', count: counts.part3 }, { label: '完整模拟相关', count: counts.fullMock }]
  const maximum = Math.max(1, ...items.map((item) => item.count))
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-sm font-semibold text-brand-700">题型覆盖</p><h2 className="mt-1 text-xl font-semibold text-ink">各部分练习次数</h2><div className="mt-6 space-y-4">{items.map(({ label, count }) => <div key={label}><div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-semibold text-ink">{count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(count / maximum) * 100}%` }} /></div></div>)}</div></section>
}
