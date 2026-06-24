import { FullMockClient } from '@/components/FullMockClient'
import { PageHeader } from '@/components/PageHeader'
import { copy } from '@/lib/i18n'

export default function FullMockPage() {
  return <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><PageHeader {...copy.partPages.fullMock} /><FullMockClient /></section>
}
