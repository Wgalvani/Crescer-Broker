-- Policies de RLS, privilegios de coluna e barreira anti-escalacao.
--
-- Convencoes:
--   - Toda policy leva `to authenticated`. Policy sem `to` roda tambem para
--     `anon` e polui o plano de consulta.
--   - Policies por comando (select/insert/update/delete), nunca `for all`
--     quando a regra de leitura difere da de escrita.
--   - `anon` nao recebe policy nenhuma: RLS ligado sem policy = deny-all.

-- ===========================================================================
-- profiles
-- ===========================================================================

-- Regra propria, sem subquery em profiles: nao ha risco de recursao.
create policy "profiles_select_self"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- Colegas da mesma organizacao. private.current_org_id() e SECURITY DEFINER,
-- por isso o select interno nao reaplica esta policy.
create policy "profiles_select_same_org"
  on public.profiles for select to authenticated
  using (organization_id = private.current_org_id());

create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using (private.is_admin() or private.has_permission('users.read'));

create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using (private.is_admin() or private.has_permission('users.manage'))
  with check (private.is_admin() or private.has_permission('users.manage'));

create policy "profiles_delete_admin"
  on public.profiles for delete to authenticated
  using (private.is_admin());

-- Sem policy de INSERT: o profile nasce exclusivamente pelo trigger
-- handle_new_user, a partir de auth.users.

-- RLS NAO FAZ ESCOPO POR COLUNA.
-- "profiles_update_self" acima autoriza a LINHA inteira, entao sem o recorte
-- abaixo o usuario editaria o proprio organization_id e sairia do tenant, ou
-- mudaria o proprio status/department. Policy nao resolve isso -- privilegio
-- de coluna resolve.
--
-- O admin nao passa por aqui: ele opera via service_role (Edge Function) ou
-- com um papel de banco distinto, nao pelo grant de `authenticated`.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- ===========================================================================
-- organizations / sales_organizations
-- ===========================================================================

create policy "organizations_select"
  on public.organizations for select to authenticated
  using (id = private.current_org_id() or private.is_admin());

create policy "organizations_manage"
  on public.organizations for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Catalogo global da Nestle: leitura livre para quem esta autenticado.
create policy "sales_organizations_select"
  on public.sales_organizations for select to authenticated
  using (true);

create policy "sales_organizations_manage"
  on public.sales_organizations for all to authenticated
  using (private.has_permission('program.manage'))
  with check (private.has_permission('program.manage'));

-- ===========================================================================
-- roles / permissions / role_permissions
-- ===========================================================================
-- Catalogo de RBAC: leitura livre porque a UI precisa dele para montar telas
-- de gestao e resolver rotulos. Nao ha dado sensivel aqui -- so nomes de papel
-- e de permissao.

create policy "roles_select"
  on public.roles for select to authenticated using (true);

create policy "roles_manage"
  on public.roles for all to authenticated
  using (private.has_permission('rbac.manage'))
  with check (private.has_permission('rbac.manage'));

create policy "permissions_select"
  on public.permissions for select to authenticated using (true);

create policy "permissions_manage"
  on public.permissions for all to authenticated
  using (private.has_permission('rbac.manage'))
  with check (private.has_permission('rbac.manage'));

create policy "role_permissions_select"
  on public.role_permissions for select to authenticated using (true);

create policy "role_permissions_manage"
  on public.role_permissions for all to authenticated
  using (private.has_permission('rbac.manage'))
  with check (private.has_permission('rbac.manage'));

-- ===========================================================================
-- user_roles -- superficie de escalacao de privilegio
-- ===========================================================================

create policy "user_roles_select_self"
  on public.user_roles for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "user_roles_select_admin"
  on public.user_roles for select to authenticated
  using (private.is_admin() or private.has_permission('users.read'));

create policy "user_roles_manage"
  on public.user_roles for all to authenticated
  using (private.has_permission('users.manage'))
  with check (private.has_permission('users.manage'));

-- Quem tem 'users.manage' pode conceder papeis -- inclusive, sem esta barreira,
-- o papel 'admin' a si mesmo. So um admin cria outro admin.
create or replace function public.prevent_admin_self_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role_key text;
begin
  select r.key into v_role_key
  from public.roles r
  where r.id = new.role_id;

  if v_role_key = 'admin' and not private.is_admin() then
    raise exception 'Somente um administrador pode conceder o papel "admin".'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger user_roles_prevent_admin_escalation
  before insert or update on public.user_roles
  for each row execute function public.prevent_admin_self_grant();

-- ===========================================================================
-- program_versions / criteria
-- ===========================================================================
-- Leitura livre por decisao de produto: o PRD 8.4 exige que "ninguem precise
-- abrir o PDF do livro" para saber o que fazer. O recorte por departamento
-- incide sobre os LANCAMENTOS (scoring_entries, fase seguinte), nao sobre o
-- catalogo de regras.

create policy "program_versions_select"
  on public.program_versions for select to authenticated using (true);

create policy "program_versions_manage"
  on public.program_versions for all to authenticated
  using (private.has_permission('program.manage'))
  with check (private.has_permission('program.manage'));

create policy "criteria_select"
  on public.criteria for select to authenticated using (true);

create policy "criteria_manage"
  on public.criteria for all to authenticated
  using (private.has_permission('program.manage'))
  with check (private.has_permission('program.manage'));
