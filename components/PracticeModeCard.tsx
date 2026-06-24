import Link from 'next/link'

import { copy } from '@/lib/i18n'
import { routes } from '@/lib/routes'

type PracticeModeCardProps = {
  title: string
  description: string
  detail: string
  href: string
  label: string
}

export function PracticeModeCard({ title, description, detail, href, label }: PracticeModeCardProps) {
  const mode = href === routes.part1
    ? copy.practice.modeCards.part1
    : href === routes.part2
      ? copy.practice.modeCards.part2
      : href === routes.part3
        ? copy.practice.modeCards.part3
        : href === routes.fullMock
          ? copy.practice.modeCards.fullMock
          : { title, description, detail, tag: label }

  return (
    <Link href={href} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <span className="mb-5 w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{mode.tag}</span>
      <h2 className="text-xl font-semibold text-ink">{mode.title}</h2>
      <p className="mt-2 font-medium text-slate-700">{mode.description}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{mode.detail}</p>
      <span className="mt-6 text-sm font-semibold text-brand-600 group-hover:text-brand-700">{copy.practice.openMode} →</span>
    </Link>
  )
}
