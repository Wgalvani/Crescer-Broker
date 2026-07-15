-- Extensoes e tipos base da plataforma CRESCER+BROKERS Auditoria.
--
-- Os enums espelham vocabulario do livro oficial da Nestle (PRD secoes 4 e 5).
-- Alterar um enum aqui exige migration nova: valores nao saem de um enum em
-- Postgres. Onde a lista tende a crescer com o tempo (ex.: fonte de dado),
-- usamos text em vez de enum de proposito.

create extension if not exists "pgcrypto"; -- gen_random_uuid()
create extension if not exists "citext"; -- e-mail case-insensitive

-- Departamentos responsaveis (PRD secao 4).
create type public.department as enum (
  'comercial',
  'merchandising',
  'logistica',
  'supply_chain',
  'ti',
  'rh',
  'financeiro',
  'diretoria',
  'compliance'
);

-- Periodicidade de apuracao (PRD secao 5).
create type public.periodicity as enum (
  'mensal',
  'trimestral',
  'semestral',
  'anual'
);

-- Capitulos do programa. 'compliance' e um bloco a parte dos dois capitulos:
-- o PRD nao deixa claro se seus 62 pontos estao dentro dos 400 do Capitulo II
-- ou fora. Modelado separado para que a decisao nao exija migration depois.
create type public.chapter as enum (
  'performance',
  'excelencia_operacional',
  'compliance'
);

-- Quem avalia o criterio (PRD secao 5, coluna "Quem avalia").
create type public.evaluator as enum (
  'sede_nestle',
  'coord_excelencia',
  'sede_operacoes_brokers',
  'broker'
);

create type public.profile_status as enum ('ativo', 'inativo');

-- Versionamento do livro de regras (PRD secao 6.12).
create type public.program_status as enum ('draft', 'active', 'archived');

create type public.org_kind as enum ('matriz', 'filial');
