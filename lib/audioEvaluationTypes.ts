export type AudioEvaluationRequestMeta = {
  part: 'part1' | 'part2' | 'part3'
  question: string
  topic?: string
  rawTranscript?: string
  editedTranscript?: string
  targetBand?: number
  mode?: string
}

export type AudioCriterionScores = {
  fluencyAndCoherence: number
  lexicalResource: number
  grammaticalRangeAndAccuracy: number
  pronunciation: number
}

export type AudioCriterionFeedback = {
  strength: string
  improvement: string
  evidence: string[]
  assessmentConfidence?: 'low' | 'medium' | 'high'
}

export type AudioCorrectionItem = {
  original: string
  suggested: string
  type: 'grammar' | 'vocabulary' | 'collocation' | 'coherence' | 'pronunciation' | 'fluency'
  explanation: string
}

export type AudioEvidence = {
  rawTranscript: string
  detectedPauses: string[]
  hesitationAndRepetitionComment: string
  speechRateComment: string
  pronunciationComment: string
  fluencyComment: string
  audioQualityComment: string
}

export type AudioSpeakingEvaluationResult =
  | {
      status: 'completed'
      disclaimer: string
      evaluationMode: 'audio_first'
      estimatedBand: number
      confidence: 'low' | 'medium' | 'high'
      criteria: AudioCriterionScores
      audioEvidence: AudioEvidence
      summary: string
      strengths: string[]
      priorityImprovements: string[]
      criteriaFeedback: Record<keyof AudioCriterionScores, AudioCriterionFeedback>
      corrections: AudioCorrectionItem[]
      betterAnswer: { text: string; level: string; notes: string[] }
      nextPracticeTask: { type: string; instruction: string; focusCriterion: string }
      qualityFlags: string[]
    }
  | {
      status: 'failed'
      disclaimer: string
      evaluationMode: 'audio_first'
      error: string
      qualityFlags: string[]
    }
