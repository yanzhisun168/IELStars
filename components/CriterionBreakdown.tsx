import { criterionLabels, type CriterionAverages } from '@/lib/dashboardStats'
import type { CriterionName } from '@/lib/evaluationTypes'

type CriterionBreakdownProps = { averages: CriterionAverages; strongest: CriterionName | null; weakest: CriterionName | null }

export function CriterionBreakdown({ averages, strongest, weakest }: CriterionBreakdownProps) {
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><p className="text-sm font-semibold text-brand-700">四项评分表现</p><h2 className="mt-1 text-xl font-semibold text-ink">平均 IELTS Speaking 维度分</h2></div><div className="mt-6 space-y-5">{(Object.keys(criterionLabels) as CriterionName[]).map((key) => { const score = averages[key]; const isStrongest = key === strongest; const isWeakest = key === weakest; return <div key={key}><div className="flex items-center justify-between gap-4"><p className="font-medium text-slate-700">{criterionLabels[key]} {isStrongest ? <span className="ml-2 text-xs text-emerald-700">当前强项</span> : null}{isWeakest ? <span className="ml-2 text-xs text-amber-700">优先提升</span> : null}</p><p className="font-semibold text-ink">{score?.toFixed(1) ?? '—'}</p></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${isWeakest ? 'bg-amber-500' : isStrongest ? 'bg-emerald-500' : 'bg-brand-600'}`} style={{ width: `${Math.min(100, ((score ?? 0) / 9) * 100)}%` }} /></div></div> })}</div></section>
}
