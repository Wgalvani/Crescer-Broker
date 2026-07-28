/*
 * Tipos da gestao de usuarios (controle de acesso).
 *
 * Setor = enum `department` do banco; Perfil = `roles` semeadas (cada papel ja
 * vem com suas permissoes via role_permissions). Ambos derivam dos tipos
 * gerados em database.types.ts -- nao reescrever a mao.
 */
import type { Tables, Enums } from '@/types/database.types'

export type Department = Enums<'department'>
export type ProfileStatus = Enums<'profile_status'>

/** Papel (perfil) do catalogo de RBAC, para os seletores. */
export type RoleRow = Pick<Tables<'roles'>, 'id' | 'key' | 'name' | 'description'>

/** Uma linha da lista de usuarios: perfil + filial + papeis concedidos. */
export type UsuarioRow = {
  id: string
  full_name: string
  email: string
  department: Department | null
  status: ProfileStatus
  phone: string | null
  organization_id: string
  organization: { id: string; code: string; name: string } | null
  roles: { key: string; name: string }[]
}

/** Rotulos pt-BR dos setores (o enum guarda o valor tecnico). */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  comercial: 'Comercial / Vendas',
  merchandising: 'Merchandising',
  logistica: 'Logística',
  supply_chain: 'Supply Chain',
  ti: 'TI',
  rh: 'RH / Pessoas',
  financeiro: 'Financeiro',
  diretoria: 'Diretoria',
  compliance: 'Compliance',
}

/** Ordem de exibicao dos setores no seletor. */
export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = (
  Object.keys(DEPARTMENT_LABELS) as Department[]
).map((value) => ({ value, label: DEPARTMENT_LABELS[value] }))

export function departmentLabel(dep: Department | null): string {
  return dep ? DEPARTMENT_LABELS[dep] : '—'
}
