import { criterionLabels, generateNextRecommendation } from '@/lib/dashboardStats'
import type { CriterionName } from '@/lib/evaluationTypes'

type NextRecommendationCardProps = { weakestCriterion: CriterionName | null }

export function NextRecommendationCard({ weakestCriterion }: NextRecommendationCardProps) {
  return <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:p-6"><p className="text-sm font-semibold text-brand-700">下一步练习建议</p><h2 className="mt-1 text-xl font-semibold text-ink">{weakestCriterion ? `优先提升：${criterionLabels[weakestCriterion]}` : '建立更多有效练习数据'}</h2><p className="mt-4 leading-7 text-slate-700">{generateNextRecommendation(weakestCriterion)}</p></section>
}
