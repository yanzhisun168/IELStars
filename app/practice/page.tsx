import { PageHeader } from '@/components/PageHeader'
import { PracticeModeCard } from '@/components/PracticeModeCard'
import { copy } from '@/lib/i18n'
import { practiceModes } from '@/lib/routes'

export default function PracticePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={copy.practiceHub.eyebrow}
        title={copy.practiceHub.title}
        description={copy.practiceHub.description}
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {practiceModes.map((mode) => <PracticeModeCard key={mode.href} {...mode} />)}
      </div>
    </section>
  )
}
