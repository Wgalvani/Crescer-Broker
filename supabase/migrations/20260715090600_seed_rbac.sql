-- Seed do RBAC: papeis (PRD secao 4) e permissoes (PRD secao 6.11).
--
-- Fica em migration, e nao em supabase/seed.sql, de proposito: seed.sql so
-- roda em `supabase db reset` local e NUNCA chega ao remoto via `db push`.
-- Papel e permissao sao dado de referencia da aplicacao, nao fixture de teste.
--
-- Idempotente: reaplicar a migration atualiza rotulos sem duplicar linhas.

-- ---------------------------------------------------------------------------
-- Papeis (PRD secao 4)
-- ---------------------------------------------------------------------------
insert into public.roles (key, name, description, is_system) values
  ('admin', 'Administrador (TI)',
   'Acesso irrestrito: usuarios, permissoes, parametrizacao e todos os modulos.', true),
  ('diretoria', 'Diretoria / Sponsor',
   'Visao executiva consolidada com drill-down, sem edicao de dados.', false),
  ('monitor', 'Monitor CRESCER+BROKERS',
   'Dono do programa dentro do Broker. Consolida dados, prazos e evidencias.', false),
  ('gerente_vendas', 'Gerente de Vendas',
   'KPIs de Performance e conducao das reunioes (Matinal, RPS, Ciclo).', false),
  ('supervisor_vendas', 'Supervisor de Vendas',
   'Visitas de desenvolvimento de rota e atas de matinal da sua equipe.', false),
  ('coord_merchandising', 'Coordenador de Merchandising',
   'KPIs do promotor (8 passos), execucao em loja e ruptura.', false),
  ('rh', 'RH',
   'Turn-over, recrutamento e identidade visual/uniformes.', false),
  ('financeiro', 'Financeiro',
   'Verbas em aberto, certidoes negativas e inadimplencia.', false),
  ('logistica', 'Logistica',
   'Operacoes logisticas: indenizacao, destruicao, transpasse, escrituracao.', false),
  ('supply_chain', 'Supply Chain',
   'Checklists de Supply Chain (2.8.x) e autoavaliacao mensal.', false),
  ('ti', 'TI (interno)',
   'Equipamentos (2.7.1), Flexx GPS e ferramentas digitais.', false),
  ('vendedor', 'Vendedor',
   'App de campo: checklist dos passos de venda e evidencias. So os proprios indicadores.', false),
  ('promotor', 'Promotor',
   'App de campo: 8 passos do promotor e execucao em loja.', false),
  ('auditor', 'Auditor interno / Compliance',
   'Visao consolidada de compliance, prazos e trilha de evidencias.', false)
on conflict (key) do update
  set name = excluded.name,
      description = excluded.description,
      is_system = excluded.is_system;

-- ---------------------------------------------------------------------------
-- Permissoes, no formato modulo.acao
-- ---------------------------------------------------------------------------
insert into public.permissions (key, module, description) values
  ('users.read', 'usuarios', 'Visualizar usuarios e seus papeis'),
  ('users.manage', 'usuarios', 'Criar, editar e inativar usuarios; conceder papeis'),
  ('rbac.manage', 'usuarios', 'Gerir papeis e permissoes'),
  ('program.read', 'programa', 'Consultar o catalogo de criterios e versoes do livro'),
  ('program.manage', 'programa', 'Editar criterios, pesos, faixas e metas (PRD 6.12)'),
  ('scoring.read_own', 'pontuacao', 'Ver lancamentos do proprio departamento'),
  ('scoring.read_all', 'pontuacao', 'Ver lancamentos de todos os departamentos'),
  ('scoring.write', 'pontuacao', 'Lancar e editar efetivo vs. meta'),
  ('dashboard.read', 'dashboard', 'Acessar o dashboard executivo consolidado'),
  ('compliance.read', 'compliance', 'Ver o painel de itens de compliance'),
  ('compliance.manage', 'compliance', 'Gerir documentos, vencimentos e protocolos'),
  ('meetings.read', 'reunioes', 'Consultar reunioes e atas'),
  ('meetings.manage', 'reunioes', 'Registrar reunioes, presenca e atas'),
  ('field.submit', 'campo', 'Enviar checklists de campo (passos de venda/visita)'),
  ('field.review', 'campo', 'Revisar e consolidar checklists da equipe'),
  ('evidence.read', 'evidencias', 'Consultar a central de evidencias'),
  ('evidence.upload', 'evidencias', 'Anexar evidencias a criterios e periodos'),
  ('reports.export', 'relatorios', 'Exportar relatorios em PDF/Excel'),
  ('audit.read', 'auditoria', 'Consultar a trilha de auditoria')
on conflict (key) do update
  set module = excluded.module,
      description = excluded.description;

-- ---------------------------------------------------------------------------
-- Papel x permissao
-- ---------------------------------------------------------------------------

-- Admin: acesso irrestrito (PRD 6.11). Explicitamente TODAS as permissoes,
-- inclusive as que forem criadas por migrations futuras -- por isso o insert
-- e um cross join, e nao uma lista fixa que envelheceria em silencio.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'admin'
on conflict do nothing;

-- Demais papeis: menor privilegio -- cada um enxerga o proprio departamento.
with grants (role_key, permission_key) as (
  values
    -- Diretoria: consolidado, sem escrita.
    ('diretoria', 'dashboard.read'),
    ('diretoria', 'program.read'),
    ('diretoria', 'scoring.read_all'),
    ('diretoria', 'compliance.read'),
    ('diretoria', 'reports.export'),
    ('diretoria', 'evidence.read'),

    -- Monitor: super usuario operacional abaixo do admin.
    ('monitor', 'dashboard.read'),
    ('monitor', 'program.read'),
    ('monitor', 'scoring.read_all'),
    ('monitor', 'scoring.write'),
    ('monitor', 'compliance.read'),
    ('monitor', 'compliance.manage'),
    ('monitor', 'meetings.read'),
    ('monitor', 'meetings.manage'),
    ('monitor', 'field.review'),
    ('monitor', 'evidence.read'),
    ('monitor', 'evidence.upload'),
    ('monitor', 'reports.export'),
    ('monitor', 'users.read'),

    ('gerente_vendas', 'dashboard.read'),
    ('gerente_vendas', 'program.read'),
    ('gerente_vendas', 'scoring.read_all'),
    ('gerente_vendas', 'scoring.write'),
    ('gerente_vendas', 'meetings.read'),
    ('gerente_vendas', 'meetings.manage'),
    ('gerente_vendas', 'field.review'),
    ('gerente_vendas', 'evidence.read'),
    ('gerente_vendas', 'evidence.upload'),
    ('gerente_vendas', 'reports.export'),

    ('supervisor_vendas', 'program.read'),
    ('supervisor_vendas', 'scoring.read_own'),
    ('supervisor_vendas', 'scoring.write'),
    ('supervisor_vendas', 'meetings.read'),
    ('supervisor_vendas', 'meetings.manage'),
    ('supervisor_vendas', 'field.review'),
    ('supervisor_vendas', 'field.submit'),
    ('supervisor_vendas', 'evidence.upload'),

    ('coord_merchandising', 'program.read'),
    ('coord_merchandising', 'scoring.read_own'),
    ('coord_merchandising', 'scoring.write'),
    ('coord_merchandising', 'field.review'),
    ('coord_merchandising', 'evidence.read'),
    ('coord_merchandising', 'evidence.upload'),

    -- RH: turn-over e admissao/demissao sao dado pessoal (LGPD, PRD secao 7).
    -- Acesso restrito ao proprio departamento; sem scoring.read_all.
    ('rh', 'program.read'),
    ('rh', 'scoring.read_own'),
    ('rh', 'scoring.write'),
    ('rh', 'evidence.upload'),

    ('financeiro', 'program.read'),
    ('financeiro', 'scoring.read_own'),
    ('financeiro', 'scoring.write'),
    ('financeiro', 'compliance.read'),
    ('financeiro', 'compliance.manage'),
    ('financeiro', 'evidence.upload'),

    ('logistica', 'program.read'),
    ('logistica', 'scoring.read_own'),
    ('logistica', 'scoring.write'),
    ('logistica', 'evidence.upload'),

    ('supply_chain', 'program.read'),
    ('supply_chain', 'scoring.read_own'),
    ('supply_chain', 'scoring.write'),
    ('supply_chain', 'evidence.upload'),

    ('ti', 'program.read'),
    ('ti', 'scoring.read_own'),
    ('ti', 'scoring.write'),
    ('ti', 'evidence.upload'),

    -- Forca de campo: so o proprio checklist (PRD secao 4).
    ('vendedor', 'field.submit'),
    ('vendedor', 'scoring.read_own'),
    ('vendedor', 'evidence.upload'),
    ('promotor', 'field.submit'),
    ('promotor', 'scoring.read_own'),
    ('promotor', 'evidence.upload'),

    -- Auditor: le tudo o que pontua, escreve nada.
    ('auditor', 'dashboard.read'),
    ('auditor', 'program.read'),
    ('auditor', 'scoring.read_all'),
    ('auditor', 'compliance.read'),
    ('auditor', 'evidence.read'),
    ('auditor', 'audit.read'),
    ('auditor', 'reports.export')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from grants g
join public.roles r on r.key = g.role_key
join public.permissions p on p.key = g.permission_key
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Organizacoes de venda da Nestle (PRD secao 5.1, booster de OG)
-- ---------------------------------------------------------------------------
insert into public.sales_organizations (code, name, channel) values
  ('BRL1', 'Nestle Brasil - BRL1', 'Alimentos'),
  ('BRP2', 'Nestle Purina - BRP2', 'Pet / Canal Especializado'),
  ('BRN2', 'Nestle Professional Food - BRN2', 'Food Service'),
  ('BRN8', 'Nestle Professional Bebidas - BRN8', 'Food Service')
on conflict (code) do update
  set name = excluded.name,
      channel = excluded.channel;
