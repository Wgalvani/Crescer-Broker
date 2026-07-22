-- Pre-avaliacao (autoavaliacao): rodadas e lancamentos de conformidade.
--
-- POR QUE ISTO EXISTE
-- O Broker e avaliado pela Nestle 2x/ano, sem aviso. Esta e a "fase seguinte"
-- que o comentario da RLS do catalogo ja anunciava (os LANCAMENTOS, com recorte
-- por departamento) -- so que como AUTOAVALIACAO interna, nao como pontuacao
-- oficial. O objetivo e Gestao a Vista: saber, antes do auditor chegar, o que
-- de cada capitulo esta Conforme, Parcial, Nao conforme ou Pendente.
--
-- NAO E PONTUACAO OFICIAL. A prontidao e por CONTAGEM de criterios, nao por
-- pontos -- os pontos do livro estao incompletos (max_points nulo, somas nao
-- fecham; ver a Skill do livro). O calculo de prontidao vive na app, nao aqui.
--
-- Reusa as permissoes ja semeadas (scoring.read_own / read_all / write) e os
-- helpers private.* de 20260715090400. Nenhuma permissao nova.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Rodada aberta e editavel; fechada e um snapshot congelado para comparar
-- evolucao entre visitas. A escrita em entries e barrada quando a rodada fecha.
create type public.assessment_status as enum ('aberta', 'fechada');

-- Estado de cada criterio na autoavaliacao. 'nao_avaliado' e o default (pendente
-- -- conta como nao-pronto); 'nao_aplicavel' fica FORA do denominador da
-- prontidao (ex.: 2.4.2 quando o Broker nao tem vendedor especializado).
create type public.conformity_status as enum (
  'nao_avaliado',
  'conforme',
  'parcial',
  'nao_conforme',
  'nao_aplicavel'
);

-- ---------------------------------------------------------------------------
-- pre_assessments: rodadas de pre-avaliacao
-- ---------------------------------------------------------------------------
create table public.pre_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations (id) on delete restrict,
  program_version_id uuid not null
    references public.program_versions (id) on delete restrict,

  label text not null,                       -- '1o semestre 2026'
  status public.assessment_status not null default 'aberta',

  opened_on date not null default current_date,
  target_audit_on date,                      -- quando se espera a visita da Nestle

  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Um rotulo por tenant: evita duas rodadas "1o semestre 2026" na mesma filial.
  constraint pre_assessments_label_uk unique (organization_id, label)
);

comment on table public.pre_assessments is
  'Rodadas de autoavaliacao (Gestao a Vista). Uma rodada aberta por vez, na '
  'pratica; fechar congela para comparar com a proxima.';

create index pre_assessments_org_status_idx
  on public.pre_assessments (organization_id, status);

create trigger pre_assessments_set_updated_at
  before update on public.pre_assessments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- pre_assessment_entries: um lancamento por criterio dentro da rodada
-- ---------------------------------------------------------------------------
create table public.pre_assessment_entries (
  id uuid primary key default gen_random_uuid(),
  pre_assessment_id uuid not null
    references public.pre_assessments (id) on delete cascade,
  criterion_id uuid not null
    references public.criteria (id) on delete restrict,

  status public.conformity_status not null default 'nao_avaliado',
  notes text,                                -- o que esta feito / o que falta

  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),

  -- Um lancamento por criterio por rodada: a edicao e um upsert nesta chave.
  constraint pre_assessment_entries_uk unique (pre_assessment_id, criterion_id)
);

comment on table public.pre_assessment_entries is
  'Estado de conformidade de cada criterio numa rodada. Prontidao calculada na '
  'app por contagem (conforme=1, parcial=0,5), nao por pontos.';

create index pre_assessment_entries_assessment_idx
  on public.pre_assessment_entries (pre_assessment_id);
create index pre_assessment_entries_criterion_idx
  on public.pre_assessment_entries (criterion_id);

create trigger pre_assessment_entries_set_updated_at
  before update on public.pre_assessment_entries
  for each row execute function public.set_updated_at();

alter table public.pre_assessments enable row level security;
alter table public.pre_assessment_entries enable row level security;

-- ===========================================================================
-- RLS -- pre_assessments (isolamento por tenant)
-- ===========================================================================
-- Rodada e cabecalho, sem dado de departamento: todo mundo da organizacao a ve;
-- o recorte por area incide nos entries.

create policy "pre_assessments_select"
  on public.pre_assessments for select to authenticated
  using (organization_id = private.current_org_id() or private.is_admin());

create policy "pre_assessments_insert"
  on public.pre_assessments for insert to authenticated
  with check (
    private.has_permission('scoring.write')
    and organization_id = private.current_org_id()
    and created_by = (select auth.uid())
  );

create policy "pre_assessments_update"
  on public.pre_assessments for update to authenticated
  using (
    private.has_permission('scoring.write')
    and organization_id = private.current_org_id()
  )
  with check (
    private.has_permission('scoring.write')
    and organization_id = private.current_org_id()
  );

-- Sem delete: rodada e trilha historica. Arquivar = fechar, nao apagar.

-- A LINHA inteira fica autorizada pela policy de update acima; sem o recorte de
-- coluna o usuario moveria a rodada para outro tenant (organization_id) ou
-- trocaria o program_version_id. So label/status/target_audit_on sao editaveis.
revoke update on public.pre_assessments from authenticated;
grant update (label, status, target_audit_on) on public.pre_assessments to authenticated;

-- ===========================================================================
-- RLS -- pre_assessment_entries (recorte por departamento)
-- ===========================================================================
-- Realiza "cada departamento ve/edita os seus". A base do recorte e
-- criteria.responsible_department vs. private.current_department(). Monitor e
-- gerente (scoring.read_all) veem tudo; admin passa sempre.

create policy "pre_assessment_entries_select"
  on public.pre_assessment_entries for select to authenticated
  using (
    exists (
      select 1 from public.pre_assessments pa
      where pa.id = pre_assessment_id
        and pa.organization_id = private.current_org_id()
    )
    and (
      private.is_admin()
      or private.has_permission('scoring.read_all')
      or exists (
        select 1 from public.criteria c
        where c.id = criterion_id
          and c.responsible_department = private.current_department()
      )
    )
  );

-- Escrita exige scoring.write, o mesmo recorte de departamento, e -- o ponto
-- chave -- que a rodada-pai esteja ABERTA. Fechou, ninguem mais mexe.
create policy "pre_assessment_entries_insert"
  on public.pre_assessment_entries for insert to authenticated
  with check (
    private.has_permission('scoring.write')
    and updated_by = (select auth.uid())
    and exists (
      select 1 from public.pre_assessments pa
      where pa.id = pre_assessment_id
        and pa.organization_id = private.current_org_id()
        and pa.status = 'aberta'
    )
    and (
      private.is_admin()
      or private.has_permission('scoring.read_all')
      or exists (
        select 1 from public.criteria c
        where c.id = criterion_id
          and c.responsible_department = private.current_department()
      )
    )
  );

create policy "pre_assessment_entries_update"
  on public.pre_assessment_entries for update to authenticated
  using (
    private.has_permission('scoring.write')
    and exists (
      select 1 from public.pre_assessments pa
      where pa.id = pre_assessment_id
        and pa.organization_id = private.current_org_id()
        and pa.status = 'aberta'
    )
    and (
      private.is_admin()
      or private.has_permission('scoring.read_all')
      or exists (
        select 1 from public.criteria c
        where c.id = criterion_id
          and c.responsible_department = private.current_department()
      )
    )
  )
  with check (
    private.has_permission('scoring.write')
    and updated_by = (select auth.uid())
    and exists (
      select 1 from public.pre_assessments pa
      where pa.id = pre_assessment_id
        and pa.organization_id = private.current_org_id()
        and pa.status = 'aberta'
    )
  );

-- Recorte de coluna: a linha inteira esta autorizada, mas mover um lancamento
-- para outra rodada (pre_assessment_id) ou apontar outro criterio (criterion_id)
-- burlaria o recorte por departamento. So status/notes/updated_by sao editaveis.
revoke update on public.pre_assessment_entries from authenticated;
grant update (status, notes, updated_by) on public.pre_assessment_entries to authenticated;
