import type { Metadata } from 'next'

import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'BandMate AI | IELTS Speaking Practice',
  description: '面向中国雅思考生的 AI 雅思口语练习助手。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
