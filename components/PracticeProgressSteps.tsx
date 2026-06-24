import { copy } from '@/lib/i18n'
import type { PracticeStepStatus } from '@/lib/practiceFlowTypes'

type PracticeProgressStepsProps = { currentStep: PracticeStepStatus }

const steps: Array<{ key: Exclude<PracticeStepStatus, 'completed'>; label: string }> = [
  { key: 'question', label: copy.practice.question },
  { key: 'recording', label: '录音' },
  { key: 'transcript', label: '转写' },
  { key: 'feedback', label: '反馈' },
]

export function PracticeProgressSteps({ currentStep }: PracticeProgressStepsProps) {
  const currentIndex = currentStep === 'completed' ? steps.length - 1 : steps.findIndex((step) => step.key === currentStep)
  return <ol className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:gap-3" aria-label="练习进度">{steps.map((step, index) => { const isCurrent = index === currentIndex; const isComplete = index < currentIndex; return <li key={step.key} className="flex min-w-24 flex-1 items-center gap-2 sm:min-w-0"><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${isCurrent ? 'bg-brand-600 text-white' : isComplete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{isComplete ? '✓' : index + 1}</div><span className={`text-xs font-semibold sm:text-sm ${isCurrent ? 'text-brand-700' : isComplete ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</span>{index < steps.length - 1 ? <span className={`hidden h-px flex-1 sm:block ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`} /> : null}</li> })}</ol>
}
