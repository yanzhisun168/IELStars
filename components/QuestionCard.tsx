import { copy } from '@/lib/i18n'
import type { Part1Question, Part2CueCard, Part3Question } from '@/lib/types'

type QuestionCardProps = {
  question: Part1Question | Part2CueCard | Part3Question
}

const partLabels = {
  part1: 'IELTS Speaking Part 1',
  part2: 'IELTS Speaking Part 2',
  part3: 'IELTS Speaking Part 3',
}

export function QuestionCard({ question }: QuestionCardProps) {
  const isCueCard = question.part === 'part2'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{partLabels[question.part]}</span>
        <span className="text-sm font-medium text-slate-500">{question.topic}</span>
      </div>
      {isCueCard ? (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold leading-8 text-ink">{question.title}</h2>
          <p className="mt-6 text-sm font-semibold text-slate-700">{copy.practice.youShouldSay}</p>
          <ul className="mt-3 space-y-3 text-slate-600">{question.bulletPoints.map((point) => <li key={point} className="flex gap-3"><span className="font-semibold text-brand-600">•</span>{point}</li>)}</ul>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">{copy.practice.preparation(question.preparationTimeSeconds)}</span>
            <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">{copy.practice.speaking(question.speakingTimeSeconds / 60)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-500">{copy.practice.question}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-8 text-ink">{question.question}</h2>
          <span className="mt-7 inline-flex rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{copy.practice.recommendedResponse(question.recommendedResponseTimeSeconds)}</span>
        </div>
      )}
    </article>
  )
}
