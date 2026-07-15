/*
 * Tipos da feature de auth.
 *
 * Provisorios: quando o projeto Supabase existir, `npm run db:types` gera
 * src/types/database.types.ts e estes tipos passam a derivar de la
 * (Tables<'profiles'> etc.) em vez de serem escritos a mao.
 */

export type Department =
  | 'comercial'
  | 'merchandising'
  | 'logistica'
  | 'supply_chain'
  | 'ti'
  | 'rh'
  | 'financeiro'
  | 'diretoria'
  | 'compliance'

export type ProfileStatus = 'ativo' | 'inativo'

export type Organization = {
  id: string
  code: string
  name: string
}

export type Profile = {
  id: string
  organization_id: string
  full_name: string
  email: string
  department: Department | null
  status: ProfileStatus
  avatar_url: string | null
  organization: Organization | null
}

export type Role = {
  key: string
  name: string
}

export type CurrentUser = {
  profile: Profile
  roles: Role[]
  /** Uniao das permissoes de todos os papeis do usuario. */
  permissions: Set<string>
}
