export type SpeakingPart = 'part1' | 'part2' | 'part3'

export type EvaluationRequest = {
  part: SpeakingPart
  question: string
  topic: string
  transcript: string
  targetBand?: number
  mode?: 'single_question' | 'full_mock'
}

export type CriterionName = 'fluencyAndCoherence' | 'lexicalResource' | 'grammaticalRangeAndAccuracy' | 'pronunciation'

export type CriterionFeedback = {
  strength: string
  improvement: string
  evidence: string[]
  assessmentConfidence?: 'low' | 'medium' | 'high'
}

export type CorrectionItem = {
  original: string
  suggested: string
  type: string
  explanation: string
}

export type SpeakingEvaluationResult =
  | {
      status: 'completed'
      disclaimer: string
      estimatedBand: number
      confidence: 'low' | 'medium' | 'high'
      criteria: Record<CriterionName, number>
      summary: string
      strengths: string[]
      priorityImprovements: string[]
      criteriaFeedback: Record<CriterionName, CriterionFeedback>
      corrections: CorrectionItem[]
      betterAnswer: {
        text: string
        level: string
        notes: string[]
      }
      nextPracticeTask: {
        type: string
        instruction: string
        focusCriterion: CriterionName
      }
      qualityFlags: string[]
    }
  | {
      status: 'failed'
      error: string
      qualityFlags: string[]
    }
