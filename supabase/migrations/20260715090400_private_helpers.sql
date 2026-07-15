-- Funcoes auxiliares de RLS.
--
-- O PROBLEMA QUE ISTO RESOLVE
-- Uma policy em `profiles` que consulte `profiles`:
--
--   using (organization_id in (select organization_id from profiles where id = auth.uid()))
--
-- faz o Postgres reaplicar a mesma policy ao planejar o SELECT interno:
--   ERROR 42P17: infinite recursion detected in policy for relation "profiles"
--
-- POR QUE A SAIDA FUNCIONA
-- SECURITY DEFINER roda com os privilegios do dono da funcao (postgres, dono
-- das tabelas), e RLS nao se aplica ao dono da tabela por padrao. O SELECT
-- interno nao reaplica a policy, e o ciclo se rompe.
--
-- REGRAS QUE NAO PODEM SER QUEBRADAS AQUI (cada uma e um bug real):
--
--   1. Nunca `alter table ... force row level security`. FORCE aplica RLS ao
--      proprio dono, estas funcoes voltam a passar pelas policies e a recursao
--      retorna. Se um dia FORCE for necessario, estas funcoes precisarao de um
--      dono distinto e nao-dono das tabelas.
--   2. `set search_path = ''` sempre. Sem isso um usuario planta objetos num
--      schema que venha antes no path e escala privilegio via funcao definer.
--      Consequencia: tudo schema-qualificado (public.profiles, auth.uid()).
--   3. `stable`, nunca `volatile` -- volatile faz a funcao rodar uma vez por
--      linha em vez de uma vez por statement.
--   4. `(select auth.uid())` e nao `auth.uid()`: o wrap em subquery vira
--      initPlan, avaliado 1x por query em vez de 1x por linha.
--
-- O schema `private` nao esta na lista de schemas expostos pelo PostgREST, ou
-- seja, nada aqui e chamavel por HTTP. O revoke ao final e defesa em
-- profundidade.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

-- Organizacao (tenant) do usuario corrente.
create or replace function private.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.organization_id
  from public.profiles p
  where p.id = (select auth.uid());
$$;

-- Departamento do usuario corrente. Base do recorte por area nos lancamentos.
create or replace function private.current_department()
returns public.department
language sql
stable
security definer
set search_path = ''
as $$
  select p.department
  from public.profiles p
  where p.id = (select auth.uid());
$$;

-- O usuario corrente tem a permissao informada, por qualquer papel seu?
create or replace function private.has_permission(perm text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions pm on pm.id = rp.permission_id
    where ur.profile_id = (select auth.uid())
      and pm.key = perm
  );
$$;

-- Administrador (PRD 6.11): acesso irrestrito a todos os modulos e dados.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.profile_id = (select auth.uid())
      and r.key = 'admin'
  );
$$;

-- O usuario corrente esta ativo? Um profile inativado deve perder acesso ja na
-- proxima query, sem depender do refresh do token.
create or replace function private.is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'ativo'
  );
$$;

revoke execute on all functions in schema private from public;
revoke execute on all functions in schema private from anon;

grant execute on function
  private.current_org_id(),
  private.current_department(),
  private.has_permission(text),
  private.is_admin(),
  private.is_active()
  to authenticated;
