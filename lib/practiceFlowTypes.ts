import type { CriterionName, SpeakingEvaluationResult, SpeakingPart } from '@/lib/evaluationTypes'

export type PracticeStepStatus = 'question' | 'recording' | 'transcript' | 'feedback' | 'completed'

export type PracticeAttempt = {
  id: string
  part: SpeakingPart
  topic: string
  question: string
  transcript: string
  estimatedBand?: number
  completedAt?: string
  hasFeedback: boolean
  criteria?: Record<CriterionName, number>
}

export type PracticeFlowState = {
  currentStep: PracticeStepStatus
  attempts: PracticeAttempt[]
}

export type MockStepState = {
  stepIndex: number
  status: PracticeStepStatus
  transcript: string
  feedback?: Extract<SpeakingEvaluationResult, { status: 'completed' }>
}
