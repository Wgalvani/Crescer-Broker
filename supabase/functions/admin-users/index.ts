// Edge Function: admin-users
//
// POR QUE ISTO EXISTE
// Criar um login mexe em auth.users, que so o service_role acessa -- e essa
// chave NUNCA pode ir para o frontend (todo VITE_* vai no bundle publico). Entao
// a criacao/edicao/inativacao de usuarios passa por aqui, onde o service_role
// roda no servidor. A funcao ignora toda a RLS por definicao, por isso ela mesma
// VALIDA O CHAMADOR antes de qualquer escrita: sem essa guarda, viraria um
// bypass total do controle de acesso.
//
// Espelha as regras que ja existem no banco:
//   - so quem tem users.manage (ou papel admin) escreve;
//   - escopo por organizacao (nao-admin so mexe na propria filial);
//   - so um admin concede o papel 'admin' (igual ao trigger
//     prevent_admin_self_grant, que isenta o backend justamente para esta funcao
//     poder aplicar a regra em codigo).
//
// Acoes (POST { action, ... }): create | update | inactivate.

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DEPARTMENTS = [
  'comercial',
  'merchandising',
  'logistica',
  'supply_chain',
  'ti',
  'rh',
  'financeiro',
  'diretoria',
  'compliance',
] as const
type Department = (typeof DEPARTMENTS)[number]

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

/** Erro com codigo HTTP proprio, para o catch central traduzir em resposta. */
class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Caller = {
  id: string
  organizationId: string
  isAdmin: boolean
  canManage: boolean
}

/** Valida o JWT do chamador e resolve papeis/permissoes com o client admin. */
async function resolveCaller(admin: SupabaseClient, req: Request): Promise<Caller> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Sessão ausente.')

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user) throw new HttpError(401, 'Sessão inválida.')
  const uid = userData.user.id

  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .select('id, organization_id, status')
    .eq('id', uid)
    .single()
  if (profErr || !profile) throw new HttpError(403, 'Perfil do solicitante não encontrado.')
  if (profile.status !== 'ativo') throw new HttpError(403, 'Solicitante inativo.')

  const { data: rolesRows, error: rolesErr } = await admin
    .from('user_roles')
    .select('role:roles(key, role_permissions(permission:permissions(key)))')
    .eq('profile_id', uid)
  if (rolesErr) throw new HttpError(500, 'Falha ao ler papéis do solicitante.')

  let isAdmin = false
  const perms = new Set<string>()
  for (const row of rolesRows ?? []) {
    // deno-lint-ignore no-explicit-any
    const role = (row as any).role
    if (!role) continue
    if (role.key === 'admin') isAdmin = true
    for (const rp of role.role_permissions ?? []) {
      if (rp.permission?.key) perms.add(rp.permission.key)
    }
  }

  const canManage = isAdmin || perms.has('users.manage')
  if (!canManage) throw new HttpError(403, 'Sem permissão para gerir usuários (users.manage).')

  return { id: uid, organizationId: profile.organization_id, isAdmin, canManage }
}

/** Converte a lista de chaves de papel em ids, barrando 'admin' de não-admin. */
async function resolveRoleIds(
  admin: SupabaseClient,
  roleKeys: string[],
  caller: Caller
): Promise<string[]> {
  const keys = [...new Set(roleKeys)].filter(Boolean)
  if (keys.length === 0) return []
  if (keys.includes('admin') && !caller.isAdmin) {
    throw new HttpError(403, 'Somente um administrador pode conceder o papel "admin".')
  }
  const { data, error } = await admin.from('roles').select('id, key').in('key', keys)
  if (error) throw new HttpError(500, 'Falha ao resolver papéis.')
  const found = data ?? []
  if (found.length !== keys.length) {
    throw new HttpError(400, 'Um ou mais papéis informados não existem.')
  }
  return found.map((r) => r.id)
}

function normDepartment(value: unknown): Department | null {
  if (value == null || value === '') return null
  if (DEPARTMENTS.includes(value as Department)) return value as Department
  throw new HttpError(400, `Setor inválido: ${String(value)}`)
}

/** Filial-alvo da operação: admin pode agir em outra filial; os demais, só na sua. */
function targetOrg(caller: Caller, requested: unknown): string {
  if (caller.isAdmin && typeof requested === 'string' && requested) return requested
  return caller.organizationId
}

/** Garante que o alvo pertence à filial que o chamador pode gerir. */
async function assertSameScope(
  admin: SupabaseClient,
  caller: Caller,
  targetId: string
): Promise<{ organization_id: string }> {
  const { data, error } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', targetId)
    .single()
  if (error || !data) throw new HttpError(404, 'Usuário não encontrado.')
  if (!caller.isAdmin && data.organization_id !== caller.organizationId) {
    throw new HttpError(403, 'Usuário pertence a outra filial.')
  }
  return data
}

async function handleCreate(
  admin: SupabaseClient,
  caller: Caller,
  body: Record<string, unknown>
): Promise<Response> {
  const fullName = String(body.full_name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const department = normDepartment(body.department)
  const org = targetOrg(caller, body.organization_id)
  const roleKeys = Array.isArray(body.role_keys) ? (body.role_keys as string[]) : []

  if (!fullName) throw new HttpError(400, 'Informe o nome completo.')
  if (!email) throw new HttpError(400, 'Informe o e-mail.')
  if (password.length < 8) throw new HttpError(400, 'A senha deve ter ao menos 8 caracteres.')

  const roleIds = await resolveRoleIds(admin, roleKeys, caller)

  // createUser dispara o trigger handle_new_user, que cria o profile a partir
  // do user_metadata (organization_id obrigatorio, senao o trigger falha).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, organization_id: org, department },
  })
  if (createErr || !created?.user) {
    throw new HttpError(400, createErr?.message ?? 'Falha ao criar o usuário.')
  }
  const newId = created.user.id

  if (roleIds.length > 0) {
    const rows = roleIds.map((role_id) => ({
      profile_id: newId,
      role_id,
      organization_id: org,
      granted_by: caller.id,
    }))
    const { error: rolesErr } = await admin.from('user_roles').insert(rows)
    if (rolesErr) {
      // Desfaz o auth.users para nao deixar usuario sem papel e orfao no meio.
      await admin.auth.admin.deleteUser(newId)
      throw new HttpError(400, `Usuário criado, mas falhou ao conceder papéis: ${rolesErr.message}`)
    }
  }

  return json({ ok: true, id: newId })
}

async function handleUpdate(
  admin: SupabaseClient,
  caller: Caller,
  body: Record<string, unknown>
): Promise<Response> {
  const id = String(body.id ?? '')
  if (!id) throw new HttpError(400, 'Informe o id do usuário.')
  const scope = await assertSameScope(admin, caller, id)
  const org = scope.organization_id

  // Campos de profile (so os informados).
  const patch: Record<string, unknown> = {}
  if (typeof body.full_name === 'string' && body.full_name.trim()) {
    patch.full_name = body.full_name.trim()
  }
  if ('department' in body) patch.department = normDepartment(body.department)
  if (typeof body.phone === 'string') patch.phone = body.phone.trim() || null
  if (body.status === 'ativo' || body.status === 'inativo') patch.status = body.status

  if (Object.keys(patch).length > 0) {
    const { error } = await admin.from('profiles').update(patch).eq('id', id)
    if (error) throw new HttpError(400, `Falha ao atualizar o perfil: ${error.message}`)
  }

  // Senha (opcional).
  if (typeof body.password === 'string' && body.password) {
    if (body.password.length < 8) throw new HttpError(400, 'A senha deve ter ao menos 8 caracteres.')
    const { error } = await admin.auth.admin.updateUserById(id, { password: body.password })
    if (error) throw new HttpError(400, `Falha ao redefinir a senha: ${error.message}`)
  }

  // Papeis: substituicao completa dentro da filial (delete + insert).
  if (Array.isArray(body.role_keys)) {
    const roleIds = await resolveRoleIds(admin, body.role_keys as string[], caller)
    const del = await admin
      .from('user_roles')
      .delete()
      .eq('profile_id', id)
      .eq('organization_id', org)
    if (del.error) throw new HttpError(400, `Falha ao limpar papéis: ${del.error.message}`)
    if (roleIds.length > 0) {
      const rows = roleIds.map((role_id) => ({
        profile_id: id,
        role_id,
        organization_id: org,
        granted_by: caller.id,
      }))
      const ins = await admin.from('user_roles').insert(rows)
      if (ins.error) throw new HttpError(400, `Falha ao conceder papéis: ${ins.error.message}`)
    }
  }

  return json({ ok: true, id })
}

async function handleInactivate(
  admin: SupabaseClient,
  caller: Caller,
  body: Record<string, unknown>
): Promise<Response> {
  const id = String(body.id ?? '')
  if (!id) throw new HttpError(400, 'Informe o id do usuário.')
  if (id === caller.id) throw new HttpError(400, 'Você não pode inativar a si mesmo.')
  await assertSameScope(admin, caller, id)

  const { error } = await admin.from('profiles').update({ status: 'inativo' }).eq('id', id)
  if (error) throw new HttpError(400, `Falha ao inativar: ${error.message}`)
  return json({ ok: true, id })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Método não suportado.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Função sem SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.' }, 500)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const caller = await resolveCaller(admin, req)
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const action = String(body.action ?? '')

    switch (action) {
      case 'create':
        return await handleCreate(admin, caller, body)
      case 'update':
        return await handleUpdate(admin, caller, body)
      case 'inactivate':
        return await handleInactivate(admin, caller, body)
      default:
        return json({ error: `Ação desconhecida: ${action || '(vazia)'}` }, 400)
    }
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    const message = err instanceof Error ? err.message : 'Erro inesperado.'
    return json({ error: message }, 500)
  }
})
