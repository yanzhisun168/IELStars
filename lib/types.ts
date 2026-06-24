export type SpeakingPart = 'part1' | 'part2' | 'part3'

export type QuestionTopic =
  | 'Study'
  | 'Work'
  | 'Hometown'
  | 'Food'
  | 'Hobbies'
  | 'Technology'
  | 'Travel'
  | 'Daily Routine'

export type Part1Question = {
  id: string
  part: 'part1'
  topic: QuestionTopic
  question: string
  recommendedResponseTimeSeconds: number
}

export type Part2CueCard = {
  id: string
  part: 'part2'
  topic: QuestionTopic
  title: string
  prompt: string
  bulletPoints: string[]
  preparationTimeSeconds: 60
  speakingTimeSeconds: 120
}

export type Part3Question = {
  id: string
  part: 'part3'
  topic: QuestionTopic
  question: string
  recommendedResponseTimeSeconds: number
}

export type FullMockTest = {
  id: string
  part1Questions: Part1Question[]
  part2CueCard: Part2CueCard
  part3Questions: Part3Question[]
}
