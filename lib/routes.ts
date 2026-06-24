export const routes = {
  home: '/',
  practice: '/practice',
  part1: '/practice/part-1',
  part2: '/practice/part-2',
  part3: '/practice/part-3',
  fullMock: '/practice/full-mock',
  history: '/history',
  dashboard: '/dashboard',
  pricing: '/pricing',
  settings: '/settings',
  auth: '/auth/login',
} as const

export const practiceModes = [
  {
    title: 'Part 1',
    description: 'Short familiar questions',
    detail: 'Build confidence with everyday topics such as work, studies, and hobbies.',
    href: routes.part1,
    label: 'Warm up',
  },
  {
    title: 'Part 2',
    description: 'Cue card long turn',
    detail: 'Practise developing a clear, well-structured answer over one to two minutes.',
    href: routes.part2,
    label: 'Tell a story',
  },
  {
    title: 'Part 3',
    description: 'Abstract discussion',
    detail: 'Explore opinions, comparisons, and ideas with more depth.',
    href: routes.part3,
    label: 'Think deeper',
  },
  {
    title: 'Full Mock Test',
    description: 'Parts 1–3 sequence',
    detail: 'Experience a complete Speaking practice flow from warm-up to discussion.',
    href: routes.fullMock,
    label: 'Exam-style',
  },
] as const
