import { createClient } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createClient<any>> | null = null

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase 尚未配置。请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。')
  }

  if (!browserClient) browserClient = createClient<any>(url, anonKey)
  return browserClient
}
