import 'server-only'

import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient<any>> | null = null

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase 服务端尚未配置。请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。')
  }

  if (!adminClient) adminClient = createClient<any>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  return adminClient
}
