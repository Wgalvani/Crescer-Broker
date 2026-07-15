/*
 * Leitura das variaveis de ambiente com falha explicita.
 *
 * Tudo que comeca com VITE_ vai para o bundle publico. Por isso aqui so pode
 * existir a publishable key (anon). A service_role bypassa TODA a RLS -- ela
 * nunca entra no frontend, em nenhuma hipotese.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variavel de ambiente ${name} ausente. Copie app/.env.example para ` +
        `app/.env.local e preencha com os dados do projeto Supabase.`
    )
  }
  return value
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
} as const
