import { HistoryClient } from '@/components/HistoryClient'
import { PageHeader } from '@/components/PageHeader'

export default function HistoryPage() {
  return <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><PageHeader eyebrow="练习历史" title="回顾已保存的口语反馈" description="这里会保存题目、转写、评分与建议；录音文件不会被保存。" /><HistoryClient /></section>
}
