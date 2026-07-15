-- RBAC granular (PRD secoes 4 e 6.11).
--
-- Modelo: profile -> user_roles -> roles -> role_permissions -> permissions.
-- A permissao e sempre derivada do papel; nunca concedida direto ao usuario.
-- Isso mantem o principio de menor privilegio auditavel: para saber o que
-- alguem pode fazer, basta olhar os papeis dele.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  -- Papeis de sistema (admin) nao podem ser apagados: sem admin ninguem
  -- readquire acesso a gestao de usuarios.
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text,
  created_at timestamptz not null default now(),
  -- Formato modulo.acao -- o codigo depende disso para agrupar por modulo.
  constraint permissions_key_format check (key ~ '^[a-z_]+\.[a-z_]+$')
);

create index permissions_key_idx on public.permissions (key);
create index permissions_module_idx on public.permissions (module);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create index role_permissions_permission_idx on public.role_permissions (permission_id);

-- user_roles nao estava na lista do PROMPT-CLAUDE-CODE.md, mas sem ela `roles`
-- nao se liga a `profiles` e o RBAC nao existe.
--
-- organization_id no escopo permite "Gerente de Vendas na filial X" -- o mesmo
-- usuario pode ter papeis distintos em filiais distintas.
create table public.user_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  granted_by uuid references public.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (profile_id, role_id, organization_id)
);

create index user_roles_profile_idx on public.user_roles (profile_id);
create index user_roles_role_idx on public.user_roles (role_id);
create index user_roles_organization_idx on public.user_roles (organization_id);

-- Papel de sistema e indelevel.
create or replace function public.prevent_system_role_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_system then
    raise exception 'O papel de sistema "%" nao pode ser removido.', old.key;
  end if;
  return old;
end;
$$;

create trigger roles_prevent_system_delete
  before delete on public.roles
  for each row execute function public.prevent_system_role_delete();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
