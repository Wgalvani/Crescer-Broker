import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import type { Database } from '@/types/database.types'

/*
 * Cliente unico do Supabase.
 *
 * Database e GERADO -- nao editar a mao. Depois de qualquer migration:
 *   npm run db:types
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
