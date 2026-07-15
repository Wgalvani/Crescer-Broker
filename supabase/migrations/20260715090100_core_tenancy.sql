-- Tenancy: organizacoes do Broker, organizacoes de venda da Nestle e perfis.
--
-- ATENCAO a uma ambiguidade do PRD que se resolve aqui, no dia 1: a palavra
-- "organizacao" aparece com dois sentidos incompativeis.
--
--   1. Filial/unidade do Grupo Arantes  -> tabela `organizations`.
--      E o eixo de multi-tenancy e de RLS (PRD secoes 6.1 e 7).
--   2. Organizacao de vendas da Nestle (BRL1, BRP2, BRN2, BRN8)
--                                       -> tabela `sales_organizations`.
--      E dimensao de apuracao ("7,0 pts Meta por organizacao", PRD 5.1),
--      global, igual para todos os Brokers, e NAO e um tenant.
--
-- Colapsar as duas numa tabela so destroi o eixo de RLS e sai caro desfazer.

-- ---------------------------------------------------------------------------
-- organizations: o tenant
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  kind public.org_kind not null default 'filial',
  parent_id uuid references public.organizations (id) on delete restrict,
  cnpj text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_parent_not_self check (parent_id is distinct from id)
);

comment on table public.organizations is
  'Filiais/unidades do Grupo Arantes. Eixo de multi-tenancy e de RLS.';

create index organizations_parent_idx on public.organizations (parent_id);

-- ---------------------------------------------------------------------------
-- sales_organizations: dimensao de apuracao da Nestle (nao e tenant)
-- ---------------------------------------------------------------------------
create table public.sales_organizations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  channel text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.sales_organizations is
  'Organizacoes de venda da Nestle (BRL1, BRP2, BRN2, BRN8). Catalogo global.';

-- ---------------------------------------------------------------------------
-- profiles: espelho de auth.users com dados de negocio
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  full_name text not null,
  email citext not null unique,
  department public.department,
  status public.profile_status not null default 'ativo',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de negocio do usuario. Criado exclusivamente pelo trigger '
  'handle_new_user a partir de auth.users -- nao ha policy de INSERT.';

-- Indices exigidos pelas policies de RLS: sem eles cada policy vira seq scan.
create index profiles_organization_idx on public.profiles (organization_id);
create index profiles_department_idx on public.profiles (department);
create index profiles_active_idx on public.profiles (id) where status = 'ativo';

-- ---------------------------------------------------------------------------
-- updated_at automatico
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Provisionamento do profile no signup
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER porque roda no contexto do Auth, sem sessao do usuario.
-- A organizacao vem de raw_user_meta_data.organization_id (definida no convite
-- feito pelo admin); sem ela o signup falha de proposito -- um usuario sem
-- tenant nao teria escopo de RLS e enxergaria um limbo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
begin
  v_org_id := nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid;

  if v_org_id is null then
    raise exception
      'organization_id ausente em raw_user_meta_data para o usuario %', new.id
      using hint = 'Crie o usuario pelo modulo de Gestao de Usuarios, que injeta a organizacao.';
  end if;

  insert into public.profiles (id, organization_id, full_name, email, department)
  values (
    new.id,
    v_org_id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email),
    new.email,
    nullif(new.raw_user_meta_data ->> 'department', '')::public.department
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS ligado junto com a criacao das tabelas.
-- ---------------------------------------------------------------------------
-- Sem policy, RLS ligado = deny-all. As policies chegam na migration ...090500.
-- Ligar aqui garante que nunca existe uma janela com a tabela exposta.
--
-- NAO usar FORCE ROW LEVEL SECURITY: FORCE aplica RLS tambem ao dono da
-- tabela, o que faz as funcoes SECURITY DEFINER de private.* voltarem a passar
-- pelas policies -- e a recursao infinita (42P17) retorna.
alter table public.organizations enable row level security;
alter table public.sales_organizations enable row level security;
alter table public.profiles enable row level security;
