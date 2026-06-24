import { DashboardClient } from '@/components/DashboardClient'
import { PageHeader } from '@/components/PageHeader'

export default function DashboardPage() {
  return <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><PageHeader eyebrow="进度面板" title="了解你的口语练习进展" description="基于已保存的练习记录，查看分数、四项能力表现和下一步练习建议。" /><DashboardClient /></section>
}
