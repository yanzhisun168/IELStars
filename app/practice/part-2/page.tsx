import { PageHeader } from '@/components/PageHeader'
import { PracticeQuestionClient } from '@/components/PracticeQuestionClient'
import { copy } from '@/lib/i18n'

export default function Part2Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <PageHeader {...copy.partPages.part2} />
      <PracticeQuestionClient mode="part2" />
    </section>
  )
}
