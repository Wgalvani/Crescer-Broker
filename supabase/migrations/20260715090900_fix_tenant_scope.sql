-- Correcao de furo de isolamento entre filiais, encontrado pelo teste de RLS
-- ponta a ponta (dois usuarios, duas organizacoes).
--
-- O DEFEITO
-- As policies de ...090500 concediam leitura/escrita a quem tem `users.read`
-- ou `users.manage` SEM checar a organizacao:
--
--   using (private.is_admin() or private.has_permission('users.read'))
--
-- Como o papel `monitor` recebe `users.read` no seed, um Monitor da matriz
-- enxergava os profiles de TODAS as filiais. O teste flagrou exatamente isso:
-- o usuario da matriz listou o profile de um usuario da Filial 2.
--
-- A permissao responde "o QUE voce pode fazer"; ela nunca deveria responder
-- "sobre QUAIS linhas". O escopo e sempre a organizacao -- exceto para o
-- admin, que por definicao do PRD 6.11 tem acesso irrestrito.
--
-- DE QUEBRA: `profiles_select_same_org` dava a QUALQUER autenticado a lista de
-- todos os colegas da filial (nome, e-mail, departamento). Nenhuma tela da
-- Fundacao precisa disso -- o AppLayout le apenas o proprio profile -- e o PRD
-- secao 7 trata dado de colaborador sob LGPD. Trocado por: proprio profile
-- sempre; lista da filial so para quem tem users.read.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_same_org" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- Lista da propria filial, apenas para quem gere usuarios.
create policy "profiles_select_org_with_perm"
  on public.profiles for select to authenticated
  using (
    organization_id = private.current_org_id()
    and private.has_permission('users.read')
  );

-- Admin (TI): irrestrito, todas as filiais (PRD 6.11).
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using (private.is_admin());

create policy "profiles_update_manager"
  on public.profiles for update to authenticated
  using (
    organization_id = private.current_org_id()
    and private.has_permission('users.manage')
  )
  with check (
    organization_id = private.current_org_id()
    and private.has_permission('users.manage')
  );

create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
-- Mesmo defeito: quem tem users.manage poderia conceder papeis em qualquer
-- filial. Hoje so o admin tem essa permissao, entao nao havia exploracao
-- pratica -- mas a policy e que precisa segurar, nao a lista de papeis do
-- seed, que muda pela UI de RBAC sem passar por migration.
drop policy if exists "user_roles_select_admin" on public.user_roles;
drop policy if exists "user_roles_manage" on public.user_roles;

create policy "user_roles_select_org_with_perm"
  on public.user_roles for select to authenticated
  using (
    organization_id = private.current_org_id()
    and private.has_permission('users.read')
  );

create policy "user_roles_select_admin"
  on public.user_roles for select to authenticated
  using (private.is_admin());

create policy "user_roles_manage_org"
  on public.user_roles for all to authenticated
  using (
    organization_id = private.current_org_id()
    and private.has_permission('users.manage')
  )
  with check (
    organization_id = private.current_org_id()
    and private.has_permission('users.manage')
  );

create policy "user_roles_manage_admin"
  on public.user_roles for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());
