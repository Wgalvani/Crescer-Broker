-- Catalogo do programa: versoes do livro e criterios (PRD secoes 5 e 6.12).
--
-- Governanca (PRD secao 3): a plataforma NAO altera regras de pontuacao do
-- programa -- so as digitaliza. Como a propria Nestle "reserva-se o direito de
-- fazer ajustes durante o ano", regra e peso sao DADO parametrizavel, nunca
-- codigo. Nenhum deploy deve ser necessario quando o livro mudar.

-- ---------------------------------------------------------------------------
-- program_versions: "Livro 2026 v3", "v4"...
-- ---------------------------------------------------------------------------
create table public.program_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  year int not null,
  source_document text,
  effective_from date not null,
  effective_to date,
  status public.program_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_versions_period check (
    effective_to is null or effective_to >= effective_from
  )
);

comment on table public.program_versions is
  'Versionamento das regras do livro oficial. Preserva o historico vigente em '
  'cada periodo, exigencia de auditoria retroativa (PRD 6.12).';

-- No maximo um livro vigente por ano: dois ativos ao mesmo tempo tornariam a
-- pontuacao ambigua.
create unique index program_versions_one_active_per_year
  on public.program_versions (year)
  where status = 'active';

create trigger program_versions_set_updated_at
  before update on public.program_versions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- criteria: os ~30 criterios do livro
-- ---------------------------------------------------------------------------
create table public.criteria (
  id uuid primary key default gen_random_uuid(),
  program_version_id uuid not null
    references public.program_versions (id) on delete cascade,

  code text not null,                       -- '1.4.1', '2.8.2'
  chapter public.chapter not null,
  module text not null,                     -- 'Vendedor / Promotor'
  title text not null,
  description text,

  -- Texto literal do livro. E o que a tela mostra ao usuario para que
  -- "ninguem precise abrir o PDF" (PRD 8.4), e a prova de fidelidade a fonte
  -- oficial numa auditoria.
  official_rule_text text,
  source_page int,

  evaluator public.evaluator not null,
  data_source text,                         -- 'PRESER', 'BEES', 'In loco'...
  periodicity public.periodicity not null,
  responsible_department public.department,

  -- NULLABLE de proposito. O PRD nao traz pontuacao para 1.1.1, 1.1.2 e 1.2.1,
  -- e as somas nao fecham (Cap. I = 44 de 1.600; Cap. II = 232 de 400; a
  -- secao 2.10 esta ausente). Inventar numero aqui violaria o PRD secao 3
  -- ("nao alterar regras") e a secao 10 trata manipulacao de dado como a
  -- penalidade maxima do programa. A lacuna fica explicita ate que o livro
  -- oficial em PDF seja conferido.
  max_points numeric(7, 2),
  points_pending_review boolean not null default false,

  is_compliance boolean not null default false,
  compliance_min_pct numeric(5, 2),         -- 80 ou 95 (PRD 5.3)

  -- Falso para o booster de OG, que e modificador do total do capitulo e nao
  -- item somavel. Tambem permite decidir depois se os 62 pts de compliance
  -- entram nos 400 do Cap. II, sem migration.
  counts_toward_chapter boolean not null default true,

  zeroes_on_failure boolean not null default false,
  per_sales_org boolean not null default false,

  scoring_rule jsonb not null,

  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint criteria_code_uk unique (program_version_id, code),

  -- CHECK apenas no discriminante. A validacao profunda do JSON vive no zod
  -- (app/src/lib/scoring/schema.ts), fonte unica compartilhada pelo CRUD de
  -- Configuracao do Programa e pelo motor de calculo. Um validador plpgsql
  -- completo divergiria do zod na primeira mudanca.
  constraint criteria_rule_typed check (
    scoring_rule ->> 'type' in (
      'target_bands',      -- faixas Meta/Ideal cumulativas (1.4.1)
      'tiers',             -- degraus exclusivos por percentual (2.4.1)
      'count_tiers',       -- degraus por numero de itens atingidos (2.8.1)
      'threshold',         -- passa/nao passa num limite (2.8.2)
      'boolean_gate',      -- tudo ou nada (2.16.1)
      'growth_booster',    -- modificador do total do capitulo (booster OG)
      'penalty_per_item',  -- desconto por item ausente (Kit Basico)
      'metric_definition'  -- define metrica, nao pontua (1.2.1)
    )
  ),

  constraint criteria_compliance_pct check (
    (is_compliance and compliance_min_pct is not null)
    or (not is_compliance and compliance_min_pct is null)
  )
);

comment on column public.criteria.scoring_rule is
  'Uniao discriminada por "type", schema crescer.scoring.v1. Ver '
  'app/src/lib/scoring/schema.ts para o contrato completo.';

create index criteria_version_chapter_idx
  on public.criteria (program_version_id, chapter);
create index criteria_department_idx
  on public.criteria (responsible_department);
create index criteria_rule_gin
  on public.criteria using gin (scoring_rule jsonb_path_ops);

create trigger criteria_set_updated_at
  before update on public.criteria
  for each row execute function public.set_updated_at();

alter table public.program_versions enable row level security;
alter table public.criteria enable row level security;
