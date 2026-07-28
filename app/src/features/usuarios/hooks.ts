/*
 * Dados da gestao de usuarios.
 *
 * LEITURA vai direto pela RLS (profiles/user_roles/roles): quem tem users.read
 * ve a propria filial; admin ve tudo. ESCRITA nao pode ser client-side -- criar
 * login mexe em auth.users (service_role) -- entao as mutations chamam a Edge
 * Function `admin-users`, que valida o chamador e aplica as regras de escopo.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import type { Department, RoleRow, UsuarioRow } from '@/features/usuarios/types'

/*
 * Os !nome_da_fkey sao obrigatorios: ha dois caminhos de profiles ate user_roles
 * (profile_id e granted_by) e o PostgREST recusa o embed ambiguo (PGRST201),
 * exatamente como em useCurrentUser.
 */
const USUARIOS_SELECT = `
  id,
  full_name,
  email,
  department,
  status,
  phone,
  organization_id,
  organization:organizations!profiles_organization_id_fkey ( id, code, name ),
  user_roles!user_roles_profile_id_fkey (
    role:roles ( key, name )
  )
` as const

type RawUsuario = {
  id: string
  full_name: string
  email: string
  department: Department | null
  status: UsuarioRow['status']
  phone: string | null
  organization_id: string
  organization: { id: string; code: string; name: string } | null
  user_roles: { role: { key: string; name: string } | null }[] | null
}

/** Lista de usuarios visiveis ao solicitante (RLS recorta por filial/admin). */
export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UsuarioRow[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(USUARIOS_SELECT)
        .order('full_name', { ascending: true })
      if (error) throw error

      return ((data as unknown as RawUsuario[]) ?? []).map((row) => {
        const { user_roles, ...rest } = row
        const roles = (user_roles ?? [])
          .map((ur) => ur.role)
          .filter((r): r is { key: string; name: string } => Boolean(r))
        return { ...rest, roles }
      })
    },
  })
}

/** Catalogo de papeis (perfis) para os seletores. */
export function useRolesCatalog() {
  return useQuery({
    queryKey: ['roles-catalog'],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<RoleRow[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('id, key, name, description')
        .order('name', { ascending: true })
      if (error) throw error
      return (data as RoleRow[]) ?? []
    },
  })
}

/**
 * Chama a Edge Function e normaliza a mensagem de erro. Em falha (HTTP != 2xx)
 * o supabase-js entrega um FunctionsHttpError com a Response em `context`; a
 * mensagem util ({ error }) esta no corpo, entao a extraimos para a UI.
 */
async function invokeAdminUsers(body: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) {
    let message = error.message
    // deno-lint-ignore no-explicit-any
    const ctx = (error as any).context
    if (ctx && typeof ctx.json === 'function') {
      try {
        const parsed = await ctx.json()
        if (parsed?.error) message = parsed.error
      } catch {
        /* corpo nao-JSON: mantem a mensagem padrao */
      }
    }
    throw new Error(message)
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String((data as { error: unknown }).error))
  }
}

function invalidateUsuarios() {
  queryClient.invalidateQueries({ queryKey: ['usuarios'] })
}

export type CreateUsuarioInput = {
  full_name: string
  email: string
  password: string
  department: Department | null
  role_keys: string[]
}

export function useCreateUsuario() {
  return useMutation({
    mutationFn: (input: CreateUsuarioInput) =>
      invokeAdminUsers({ action: 'create', ...input }),
    onSuccess: invalidateUsuarios,
  })
}

export type UpdateUsuarioInput = {
  id: string
  full_name?: string
  department?: Department | null
  phone?: string | null
  status?: UsuarioRow['status']
  password?: string
  role_keys?: string[]
}

export function useUpdateUsuario() {
  return useMutation({
    mutationFn: (input: UpdateUsuarioInput) =>
      invokeAdminUsers({ action: 'update', ...input }),
    onSuccess: invalidateUsuarios,
  })
}

export function useInactivateUsuario() {
  return useMutation({
    mutationFn: (id: string) => invokeAdminUsers({ action: 'inactivate', id }),
    onSuccess: invalidateUsuarios,
  })
}
