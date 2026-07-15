import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/*
 * Cliente unico do Supabase.
 *
 * O generic <Database> entra assim que o projeto remoto existir e os tipos
 * forem gerados:  npm run db:types  ->  src/types/database.types.ts
 * Ate la o cliente e destipado; as consultas da feature de auth carregam seus
 * proprios tipos.
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
