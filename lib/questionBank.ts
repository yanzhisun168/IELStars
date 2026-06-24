import { part1Questions, part2CueCards, part3Questions } from '@/data/questions'
import type { FullMockTest, Part1Question, Part2CueCard, Part3Question, QuestionTopic } from '@/lib/types'

function getRandomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function pickRandomItems<T>(items: readonly T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

export function getPart1Questions(): Part1Question[] {
  return part1Questions
}

export function getPart2CueCards(): Part2CueCard[] {
  return part2CueCards
}

export function getPart3Questions(): Part3Question[] {
  return part3Questions
}

export function getRandomPart1Question(): Part1Question {
  return getRandomItem(part1Questions)
}

export function getRandomPart2CueCard(): Part2CueCard {
  return getRandomItem(part2CueCards)
}

export function getRandomPart3Question(): Part3Question {
  return getRandomItem(part3Questions)
}

export function getPart1QuestionsByTopic(topic: QuestionTopic): Part1Question[] {
  return part1Questions.filter((question) => question.topic === topic)
}

export function getPart3QuestionsByTopic(topic: QuestionTopic): Part3Question[] {
  return part3Questions.filter((question) => question.topic === topic)
}

export function createFullMockTest(): FullMockTest {
  const part2CueCard = getRandomPart2CueCard()
  const relatedPart3Questions = getPart3QuestionsByTopic(part2CueCard.topic)
  const mockPart3Questions = relatedPart3Questions.length >= 3
    ? pickRandomItems(relatedPart3Questions, 3)
    : pickRandomItems(part3Questions, 3)

  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    part1Questions: pickRandomItems(part1Questions, 3),
    part2CueCard,
    part3Questions: mockPart3Questions,
  }
}
