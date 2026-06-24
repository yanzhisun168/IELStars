import Link from 'next/link'

import { AuthStatus } from '@/components/AuthStatus'
import { copy } from '@/lib/i18n'
import { routes } from '@/lib/routes'

const navigation = [
  { label: copy.nav.practice, href: routes.practice },
  { label: copy.nav.history, href: routes.history },
  { label: copy.nav.dashboard, href: routes.dashboard },
  { label: copy.nav.pricing, href: routes.pricing },
]

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="主导航">
        <Link href={routes.home} className="flex items-center gap-2 font-semibold tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">B</span>
          BandMate AI
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-brand-600">{item.label}</Link>)}
        </div>
        <div className="flex shrink-0 items-center gap-2"><Link href={routes.practice} className="hidden rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 sm:block">{copy.nav.startPractice}</Link><AuthStatus /></div>
      </nav>
    </header>
  )
}
