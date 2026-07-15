import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SessionContext } from '@/features/auth/SessionProvider'
import type { CurrentUser, Profile, Role } from '@/features/auth/types'

export function useSession() {
  return useContext(SessionContext)
}

/*
 * Perfil + papeis + permissoes do usuario logado, num unico round-trip.
 *
 * O select aninhado percorre profiles -> user_roles -> roles ->
 * role_permissions -> permissions. Cada join e coberto por indice e recortado
 * pelas policies de RLS ("user_roles_select_self", "roles_select"), entao o
 * usuario so enxerga os proprios papeis.
 */
const PROFILE_SELECT = `
  id,
  organization_id,
  full_name,
  email,
  department,
  status,
  avatar_url,
  organization:organizations ( id, code, name ),
  user_roles (
    role:roles (
      key,
      name,
      role_permissions (
        permission:permissions ( key )
      )
    )
  )
` as const

type RawUserRole = {
  role: {
    key: string
    name: string
    role_permissions: { permission: { key: string } | null }[] | null
  } | null
}

export function useCurrentUser() {
  const { session } = useSession()
  const userId = session?.user.id

  return useQuery<CurrentUser | null>({
    queryKey: ['current-user', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', userId!)
        .single()

      if (error) throw error
      if (!data) return null

      const { user_roles, ...profileFields } = data as unknown as Profile & {
        user_roles: RawUserRole[] | null
      }

      const roles: Role[] = []
      const permissions = new Set<string>()

      for (const entry of user_roles ?? []) {
        if (!entry.role) continue
        roles.push({ key: entry.role.key, name: entry.role.name })
        for (const rp of entry.role.role_permissions ?? []) {
          if (rp.permission) permissions.add(rp.permission.key)
        }
      }

      return { profile: profileFields as Profile, roles, permissions }
    },
  })
}

/** Atalho de leitura para guards e menus. */
export function usePermissions(): Set<string> {
  const { data } = useCurrentUser()
  return data?.permissions ?? new Set<string>()
}
