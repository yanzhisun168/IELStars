import { PageHeader } from '@/components/PageHeader'
import { copy } from '@/lib/i18n'

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <PageHeader eyebrow={copy.settings.eyebrow} title={copy.settings.title} description={copy.settings.description} />
      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">{copy.settings.empty}</div>
    </section>
  )
}
