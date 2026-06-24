export type AudioTranscriptionResult =
  | {
      status: 'completed'
      transcript: string
      rawTranscript?: string
      language?: string
      confidence?: 'low' | 'medium' | 'high'
      warning?: string
      qualityFlags?: string[]
    }
  | {
      status: 'failed'
      transcript: ''
      error: string
      qualityFlags?: string[]
    }
