import type { CriterionName } from '@/lib/evaluationTypes'
import type { PracticeHistoryItem } from '@/lib/historyTypes'

export type CriterionAverages = Record<CriterionName, number | null>

export const criterionLabels: Record<CriterionName, string> = {
  fluencyAndCoherence: '流利度与连贯性',
  lexicalResource: '词汇资源',
  grammaticalRangeAndAccuracy: '语法多样性与准确性',
  pronunciation: '发音',
}

const criterionKeys = Object.keys(criterionLabels) as CriterionName[]
const scoredAttempts = (attempts: PracticeHistoryItem[]) => attempts.filter((attempt) => typeof attempt.primaryEstimatedBand === 'number')
const numberAverage = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : null

export function calculateAverageBand(attempts: PracticeHistoryItem[]) { return numberAverage(scoredAttempts(attempts).map((attempt) => attempt.primaryEstimatedBand as number)) }

export function calculateLatestBand(attempts: PracticeHistoryItem[]) {
  return [...scoredAttempts(attempts)].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]?.primaryEstimatedBand ?? null
}

export function calculateHighestBand(attempts: PracticeHistoryItem[]) {
  const values = scoredAttempts(attempts).map((attempt) => attempt.primaryEstimatedBand as number)
  return values.length ? Math.max(...values) : null
}

export function calculateCriterionAverages(attempts: PracticeHistoryItem[]): CriterionAverages {
  return Object.fromEntries(criterionKeys.map((key) => [key, numberAverage(attempts.flatMap((attempt) => typeof attempt[key] === 'number' ? [attempt[key] as number] : []))])) as CriterionAverages
}

export function findStrongestCriterion(averages: CriterionAverages): CriterionName | null {
  const values = criterionKeys.flatMap((key) => averages[key] === null ? [] : [{ key, value: averages[key] as number }])
  return values.length ? values.reduce((best, item) => item.value > best.value ? item : best).key : null
}

export function findWeakestCriterion(averages: CriterionAverages): CriterionName | null {
  const values = criterionKeys.flatMap((key) => averages[key] === null ? [] : [{ key, value: averages[key] as number }])
  return values.length ? values.reduce((lowest, item) => item.value < lowest.value ? item : lowest).key : null
}

export function countAttemptsByPart(attempts: PracticeHistoryItem[]) {
  return {
    part1: attempts.filter((attempt) => attempt.part === 'part1').length,
    part2: attempts.filter((attempt) => attempt.part === 'part2').length,
    part3: attempts.filter((attempt) => attempt.part === 'part3').length,
    fullMock: attempts.filter((attempt) => attempt.mode === 'full_mock').length,
  }
}

export function getRecentAttempts(attempts: PracticeHistoryItem[], limit = 7) {
  return [...attempts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit)
}

export function generateNextRecommendation(weakestCriterion: CriterionName | null) {
  if (weakestCriterion === 'fluencyAndCoherence') return '建议下一轮重点练习 Part 2。回答时使用 beginning-middle-end 结构，并控制停顿。'
  if (weakestCriterion === 'lexicalResource') return '建议下一轮重点练习 Part 3。每个回答至少使用 2 个更精准的话题词。'
  if (weakestCriterion === 'grammaticalRangeAndAccuracy') return '建议下一轮重点练习语法稳定性。先保证时态和主谓一致，再尝试复杂句。'
  if (weakestCriterion === 'pronunciation') return '建议下一轮使用录音客观反馈。重点检查语速、重音和可懂度。'
  return '完成更多带反馈的练习后，系统会给出更有针对性的下一步建议。'
}
