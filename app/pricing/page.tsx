import Link from 'next/link'

import { PageHeader } from '@/components/PageHeader'
import { copy } from '@/lib/i18n'
import { routes } from '@/lib/routes'

const plans = [
  { name: copy.pricing.free, description: '适合开始建立雅思口语练习习惯。', price: '¥0', items: ['每日有限练习次数', '基础练习模式', '核心练习流程'], action: copy.pricing.start, href: routes.practice, featured: false },
  { name: copy.pricing.pro, description: '适合需要更深入、更稳定练习循环的考生。', price: copy.common.comingSoon, items: ['详细 AI 反馈', '更长的练习历史', '更多练习与完整模拟'], action: copy.pricing.waitlist, href: routes.practice, featured: true },
]

export default function PricingPage() {
  return <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><div className="text-center"><PageHeader eyebrow={copy.pricing.eyebrow} title={copy.pricing.title} description={copy.pricing.description} /></div><div className="mt-10 grid gap-6 md:grid-cols-2">{plans.map((plan) => <article key={plan.name} className={`rounded-2xl border p-7 sm:p-8 ${plan.featured ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-slate-200 bg-white'}`}>{plan.featured ? <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">{copy.pricing.plannedPro}</span> : null}<h2 className="mt-4 text-2xl font-bold text-ink">{plan.name}</h2><p className="mt-2 leading-7 text-slate-600">{plan.description}</p><p className="mt-6 text-3xl font-bold text-ink">{plan.price}</p><ul className="mt-7 space-y-3 text-sm text-slate-700">{plan.items.map((item) => <li key={item} className="flex gap-3"><span className="font-bold text-brand-600">✓</span>{item}</li>)}</ul><Link href={plan.href} className={`mt-8 inline-flex w-full justify-center rounded-lg px-4 py-3 font-semibold transition ${plan.featured ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{plan.action}</Link></article>)}</div></section>
}
