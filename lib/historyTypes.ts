import type { AudioSpeakingEvaluationResult } from '@/lib/audioEvaluationTypes'
import type { SpeakingEvaluationResult, SpeakingPart } from '@/lib/evaluationTypes'

export type EvaluationSource = 'text_only' | 'audio_first' | 'both'

export type SavePracticeAttemptInput = {
  part: SpeakingPart
  mode?: string
  topic?: string
  question: string
  rawTranscript?: string
  editedTranscript?: string
  textFeedback?: Extract<SpeakingEvaluationResult, { status: 'completed' }> | null
  audioFeedback?: Extract<AudioSpeakingEvaluationResult, { status: 'completed' }> | null
}

export type SavedPracticeAttempt = SavePracticeAttemptInput & {
  id: string
  userId: string
  primaryEstimatedBand?: number
  fluencyAndCoherence?: number
  lexicalResource?: number
  grammaticalRangeAndAccuracy?: number
  pronunciation?: number
  evaluationSource: EvaluationSource
  createdAt: string
}

export type PracticeHistoryItem = SavedPracticeAttempt
