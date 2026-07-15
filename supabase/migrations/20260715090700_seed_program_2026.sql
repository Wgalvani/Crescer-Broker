-- Catalogo do CRESCER+BROKERS 2026 (PRD secao 5, extraido do livro oficial
-- "LIVRO CRESCER + 2026 - NIM OFICIAL - V3.pdf").
--
-- SOBRE AS LACUNAS DESTE SEED -- LEIA ANTES DE "CORRIGIR"
--
-- As somas do PRD nao fecham, e isso esta refletido aqui de proposito:
--
--   * Capitulo I: os pontos explicitos somam 44, nao 1.600. E 1.1.1, 1.1.2 e
--     1.2.1 nao trazem pontuacao nenhuma no PRD. Falta a matriz de alocacao
--     por organizacao x categoria x mes.
--   * Capitulo II: soma 232, nao 400. A numeracao salta de 2.9.3 para 2.11.1
--     -- a secao 2.10 inteira esta ausente do PRD, provavel causa do buraco.
--   * Compliance: soma 62, e nao da para saber se esta dentro dos 400 ou fora.
--
-- Esses criterios levam points_pending_review = true e max_points nulo.
-- NAO preencher com valores estimados para "fechar" 1.600/400: o PRD secao 3
-- determina que a plataforma nao altera regras do programa, e a secao 10 trata
-- manipulacao de dados como a penalidade maxima -- anula a pontuacao e pode
-- gerar litigio. A fonte para fechar essas lacunas e o PDF oficial, e a
-- conferencia deve preceder o motor de calculo (Fase 3).
--
-- Faixas com buraco (valores que nao caem em nenhuma faixa) estao registradas
-- no campo `gaps` de scoring_rule. O motor deve FALHAR ALTO ao cair numa
-- lacuna, nunca silenciar em 0.

insert into public.program_versions
  (code, name, year, source_document, effective_from, effective_to, status)
values (
  'LIVRO-2026-V3',
  'Livro CRESCER+BROKERS 2026 - NIM Oficial - V3',
  2026,
  'LIVRO CRESCER + 2026 - NIM OFICIAL - V3.pdf',
  '2026-01-01',
  '2026-12-31',
  'active'
)
on conflict (code) do update
  set name = excluded.name,
      source_document = excluded.source_document,
      effective_from = excluded.effective_from,
      effective_to = excluded.effective_to;

-- ===========================================================================
-- CAPITULO I -- PERFORMANCE (PRD secao 5.1)
-- ===========================================================================
with pv as (
  select id from public.program_versions where code = 'LIVRO-2026-V3'
)
insert into public.criteria (
  program_version_id, code, chapter, module, title, official_rule_text,
  evaluator, data_source, periodicity, responsible_department,
  max_points, points_pending_review, counts_toward_chapter, per_sales_org,
  scoring_rule, display_order
)
select pv.id, c.* from pv, (values

  ('1.1.1', 'performance'::public.chapter, 'VBC', 'VBC por organizacao',
   'Efetivo vs. meta da carta-meta',
   'sede_nestle'::public.evaluator, 'PRESER', 'mensal'::public.periodicity,
   'comercial'::public.department,
   null::numeric, true, true, true,
   '{"$schema":"crescer.scoring.v1","type":"target_bands",
     "metric":{"key":"vbc_pct_meta","unit":"percent","direction":"higher_better"},
     "per":["sales_org"],"aggregate":"sum","bands":[],
     "gaps":["PRD 5.1 nao informa a pontuacao deste criterio -- conferir no livro oficial"],
     "notes":"Efetivo vs. meta da carta-meta"}'::jsonb, 101),

  ('1.1.2', 'performance', 'VBC', 'VBC por grupo de categorias',
   '>=100% = pts Meta; >=110% = + pts Ideal',
   'sede_nestle', 'Dashboard VBC', 'mensal', 'comercial',
   null, true, true, false,
   '{"$schema":"crescer.scoring.v1","type":"target_bands",
     "metric":{"key":"vbc_categoria_pct_meta","unit":"percent","direction":"higher_better"},
     "per":["category"],"aggregate":"sum",
     "bands":[{"id":"meta","min":100,"min_inclusive":true,"points":null},
              {"id":"ideal","min":110,"min_inclusive":true,"points":null,"cumulative":true,"requires":"meta"}],
     "gaps":["PRD 5.1 descreve as faixas (>=100% Meta, >=110% Ideal) mas nao os pontos de cada uma"],
     "notes":">=100% = pts Meta; >=110% = + pts Ideal"}'::jsonb, 102),

  ('1.2.1', 'performance', 'Cobertura', 'Cobertura por categoria',
   'Cliente coberto = VBC > R$ 30',
   'sede_nestle', 'PRESER', 'mensal', 'comercial',
   null, true, true, false,
   -- Isto e a DEFINICAO da metrica, nao uma regra de pontuacao. O PRD nao
   -- informa quantos pontos a cobertura vale.
   '{"$schema":"crescer.scoring.v1","type":"metric_definition",
     "metric":{"key":"cobertura_categoria","unit":"count","direction":"higher_better"},
     "definition":{"cliente_coberto":{"op":"gt","field":"vbc_cliente","value":30,"currency":"BRL"}},
     "gaps":["PRD 5.1 traz a definicao de cliente coberto, mas nenhuma regra de pontuacao"],
     "notes":"Cliente coberto = VBC > R$ 30"}'::jsonb, 103),

  ('1.3.1', 'performance', 'Sortimento', 'Sortimento Prioritario Farma B',
   '8,0 pts faixa Ideal / 4,0 pts faixa Meta',
   'sede_nestle', 'PRESER', 'mensal', 'comercial',
   8.0, false, true, false,
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"sortimento_farma_b_pct","unit":"percent","direction":"higher_better"},
     "per":[],
     "tiers":[{"id":"ideal","points":8.0},{"id":"meta","points":4.0}],
     "gaps":["PRD 5.1 traz os pontos (8,0 Ideal / 4,0 Meta) mas nao os percentuais que definem cada faixa"],
     "notes":"8,0 pts faixa Ideal / 4,0 pts faixa Meta"}'::jsonb, 104),

  ('1.4.1', 'performance', 'BEES', 'VBC via BEES',
   '7,0 pts Meta por organizacao + 3,0 pts adicional Ideal',
   'sede_nestle', 'BEES', 'mensal', 'comercial',
   10.0, false, true, true,
   '{"$schema":"crescer.scoring.v1","type":"target_bands",
     "metric":{"key":"vbc_bees_pct_meta","unit":"percent","direction":"higher_better"},
     "per":["sales_org"],"aggregate":"sum",
     "bands":[{"id":"meta","min":100,"min_inclusive":true,"points":7.0},
              {"id":"ideal","min":110,"min_inclusive":true,"points":3.0,"cumulative":true,"requires":"meta"}],
     "max_points_per_unit":10.0,
     "notes":"7,0 pts Meta por organizacao + 3,0 pts adicional Ideal"}'::jsonb, 105),

  ('1.4.2', 'performance', 'BEES', 'Cobertura via BEES',
   '5,0 pts Meta por organizacao + 3,0 pts adicional Ideal',
   'sede_nestle', 'BEES', 'mensal', 'comercial',
   8.0, false, true, true,
   '{"$schema":"crescer.scoring.v1","type":"target_bands",
     "metric":{"key":"cobertura_bees_pct_meta","unit":"percent","direction":"higher_better"},
     "per":["sales_org"],"aggregate":"sum",
     "bands":[{"id":"meta","min":100,"min_inclusive":true,"points":5.0},
              {"id":"ideal","min":110,"min_inclusive":true,"points":3.0,"cumulative":true,"requires":"meta"}],
     "max_points_per_unit":8.0,
     "notes":"5,0 pts Meta por organizacao + 3,0 pts adicional Ideal"}'::jsonb, 106),

  ('1.5.1', 'performance', 'Ruptura', '% Ruptura Zero (SKUs Hero)',
   '10,0 pts se ruptura <= 5%; min. 60% dos PDVs roteirizados pesquisados',
   'sede_nestle', 'Dash Ruptura Zero 3.0 / Connect Merchan', 'mensal', 'merchandising',
   10.0, false, true, false,
   -- Os 60% de PDVs pesquisados sao gate de VALIDADE DA AMOSTRA, nao faixa de
   -- pontuacao: sem amostra suficiente o indicador nao e apuravel.
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"ruptura_sku_hero_pct","unit":"percent","direction":"lower_better"},
     "operator":"lte","value":5,"points_on_pass":10.0,"points_on_fail":0.0,
     "sample":{"min_coverage_pct":60,"of":"pdvs_roteirizados","on_insufficient":"not_measurable"},
     "notes":"10,0 pts se ruptura <= 5%; min. 60% dos PDVs roteirizados pesquisados"}'::jsonb, 107),

  ('1.5.2', 'performance', 'Ruptura', 'Positivacao de visitas em rota',
   '8,0 pts se positivacao > 70%',
   'sede_nestle', 'Broker 3.0', 'mensal', 'comercial',
   8.0, false, true, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"positivacao_visitas_pct","unit":"percent","direction":"higher_better"},
     "operator":"gt","value":70,"points_on_pass":8.0,"points_on_fail":0.0,
     "notes":"8,0 pts se positivacao > 70%"}'::jsonb, 108),

  -- Booster de crescimento OG. Nao e item somavel: e modificador do total do
  -- capitulo, dai counts_toward_chapter = false.
  ('1.9.0', 'performance', 'Booster', 'Booster de crescimento OG (NNS NIM)',
   'Crescimento OG (NNS NIM - BRL1, BRP2, BRN2, BRN8), somado ao realizado total, apurado por faixa trimestral',
   'sede_nestle', 'PRESER', 'trimestral', 'comercial',
   300.0, false, false, true,
   '{"$schema":"crescer.scoring.v1","type":"growth_booster",
     "metric":{"key":"crescimento_og_nns_nim_pct","unit":"percent","direction":"higher_better",
               "baseline":"mesmo_periodo_ano_anterior"},
     "scope":{"sales_orgs":["BRL1","BRP2","BRN2","BRN8"],"period":"quarter"},
     "applies_to":"chapter_total:performance","operation":"add",
     "tiers":[{"max":7.0,"max_inclusive":false,"points":0},
              {"min":7.01,"max":9.9,"points":100},
              {"min":10.0,"max":14.9,"points":150},
              {"min":15.0,"max":19.9,"points":200},
              {"min":20.0,"min_inclusive":false,"points":300}],
     "gaps":["Faixas nao cobrem 9,91-9,99 / 14,91-14,99 / 19,91-19,99 nem exatamente 20,00",
             "PRD 5.1 diz apuracao trimestral, mas o Capitulo I e mensal: a consolidacao anual do booster nao esta definida (soma dos 4 trimestres? melhor trimestre?)"],
     "notes":"NNS NIM - BRL1, BRP2, BRN2, BRN8; somado ao realizado total"}'::jsonb, 190)

) as c(code, chapter, module, title, official_rule_text, evaluator, data_source,
       periodicity, responsible_department, max_points, points_pending_review,
       counts_toward_chapter, per_sales_org, scoring_rule, display_order)
on conflict (program_version_id, code) do update
  set title = excluded.title,
      module = excluded.module,
      official_rule_text = excluded.official_rule_text,
      evaluator = excluded.evaluator,
      data_source = excluded.data_source,
      periodicity = excluded.periodicity,
      responsible_department = excluded.responsible_department,
      max_points = excluded.max_points,
      points_pending_review = excluded.points_pending_review,
      counts_toward_chapter = excluded.counts_toward_chapter,
      per_sales_org = excluded.per_sales_org,
      scoring_rule = excluded.scoring_rule,
      display_order = excluded.display_order,
      updated_at = now();

-- ===========================================================================
-- CAPITULO II -- EXCELENCIA OPERACIONAL (PRD secao 5.2)
-- ===========================================================================
with pv as (
  select id from public.program_versions where code = 'LIVRO-2026-V3'
)
insert into public.criteria (
  program_version_id, code, chapter, module, title, official_rule_text,
  evaluator, data_source, periodicity, responsible_department,
  max_points, zeroes_on_failure, scoring_rule, display_order
)
select pv.id, c.* from pv, (values

  ('2.1.1', 'excelencia_operacional'::public.chapter, 'Pessoas', 'Turn-over',
   '8,0 pts se <= 15%',
   'coord_excelencia'::public.evaluator, 'Formulario Padrao / E-Social',
   'trimestral'::public.periodicity, 'rh'::public.department,
   8.0::numeric, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"turnover_pct","unit":"percent","direction":"lower_better"},
     "operator":"lte","value":15,"points_on_pass":8.0,"points_on_fail":0.0,
     "lgpd":{"personal_data":true,"note":"Admissao/demissao sao dados pessoais -- acesso restrito a RH/Admin"},
     "notes":"8,0 pts se <= 15%"}'::jsonb, 201),

  ('2.1.2', 'excelencia_operacional', 'Pessoas', 'Identidade visual / uniformes',
   '5,0 pts se 100% aderente',
   'coord_excelencia', 'In loco', 'trimestral', 'rh',
   5.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"aderencia_uniformes_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":100,"points_on_pass":5.0,"points_on_fail":0.0,
     "notes":"5,0 pts se 100% aderente"}'::jsonb, 202),

  ('2.2.1', 'excelencia_operacional', 'Planejamento de Vendas', 'Reuniao Matinal (5x/semana)',
   '8,0 pts; ATA ate o 5o dia util do mes seguinte',
   'broker', 'Plataforma CRESCER+BROKERS', 'mensal', 'comercial',
   8.0, true,
   -- A regra do 5o dia util e critica: perder o prazo ANULA a pontuacao do mes
   -- inteiro (PRD 6.4). E a maior fonte de perda "boba" de pontos citada.
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"matinais_por_semana","unit":"count","direction":"higher_better"},
     "operator":"gte","value":5,"points_on_pass":8.0,"points_on_fail":0.0,
     "deadlines":[{"key":"ata","rule":"5th_business_day_next_month","on_miss":"zero_month",
                   "alerts_days_before":[30,15,5]}],
     "evidence":{"required":true,"types":["ata_assinada_pdf"]},
     "notes":"8,0 pts; ATA ate o 5o dia util do mes seguinte"}'::jsonb, 203),

  ('2.2.2', 'excelencia_operacional', 'Planejamento de Vendas', 'RPS (min. 4/mes, sextas-feiras)',
   '5,0 pts',
   'broker', 'Plataforma CRESCER+BROKERS', 'mensal', 'comercial',
   5.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"rps_por_mes","unit":"count","direction":"higher_better"},
     "operator":"gte","value":4,"points_on_pass":5.0,"points_on_fail":0.0,
     "schedule":{"weekday":"friday"},
     "notes":"5,0 pts; minimo 4 por mes, as sextas-feiras"}'::jsonb, 204),

  ('2.2.3', 'excelencia_operacional', 'Planejamento de Vendas', 'Reuniao Mensal (Ciclo)',
   '5,0 pts; participacao min. 90%',
   'broker', 'Plataforma CRESCER+BROKERS', 'mensal', 'comercial',
   5.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"participacao_ciclo_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":90,"points_on_pass":5.0,"points_on_fail":0.0,
     "evidence":{"required":true,"types":["print_teleconferencia_lista_presenca"]},
     "notes":"5,0 pts; participacao minima de 90%"}'::jsonb, 205),

  ('2.2.4', 'excelencia_operacional', 'Planejamento de Vendas', 'Ferramenta de gestao de visitas (Flexx GPS)',
   '6,0 pts uso diario',
   'coord_excelencia', 'In loco', 'trimestral', 'ti',
   6.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"uso_diario_flexx_gps","unit":"count","direction":"higher_better"},
     "pass_when":{"op":"eq","value":true},"points_on_pass":6.0,"points_on_fail":0.0,
     "notes":"6,0 pts uso diario"}'::jsonb, 206),

  ('2.3.1', 'excelencia_operacional', 'Processos de Vendas', 'Prazo de processamento (faturamento)',
   '8,0 pts se >= 90% no prazo (48h/72h)',
   'coord_excelencia', 'In loco', 'trimestral', 'financeiro',
   8.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"faturamento_no_prazo_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":90,"points_on_pass":8.0,"points_on_fail":0.0,
     "sla":{"hours":[48,72]},
     "notes":"8,0 pts se >= 90% no prazo (48h/72h)"}'::jsonb, 207),

  ('2.3.2', 'excelencia_operacional', 'Processos de Vendas', 'Frequencia de atendimento sugerida',
   '6,0 pts (tolerancia 5%)',
   'coord_excelencia', 'In loco (sistema FLEXX)', 'trimestral', 'comercial',
   6.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"aderencia_frequencia_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":95,"points_on_pass":6.0,"points_on_fail":0.0,
     "tolerance_pct":5,
     "gaps":["PRD 5.2 informa apenas a tolerancia de 5%; o limite de 95% foi derivado dela (100% - 5%). Confirmar no livro oficial."],
     "notes":"6,0 pts (tolerancia 5%)"}'::jsonb, 208),

  ('2.4.1', 'excelencia_operacional', 'Vendedor', '12 passos da venda - Vendedor NiM',
   '20,0 (>95%) / 15,0 (85-94,99%) / 10,0 (80-84,99%) pts',
   'coord_excelencia', 'In loco (min. 6 PDVs)', 'trimestral', 'comercial',
   20.0, true,
   -- Maior peso individual do programa (PRD secao 11).
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"aderencia_12_passos_pct","unit":"percent","direction":"higher_better"},
     "per":[],
     "tiers":[{"min":95.0,"min_inclusive":false,"points":20.0},
              {"min":85.0,"min_inclusive":true,"max":94.99,"max_inclusive":true,"points":15.0},
              {"min":80.0,"min_inclusive":true,"max":84.99,"max_inclusive":true,"points":10.0},
              {"max":80.0,"max_inclusive":false,"points":0.0}],
     "eligibility":{"min_days_in_role":90,"waivable_by_broker":true},
     "sample":{"min_pdv":6},
     "zeroing":[{"when":"expired_product_found_at_pdv","scope":"criterion","source_criterion":"2.16.1"}],
     "gaps":["Valor exatamente 95,00 nao cai em nenhuma faixa (>95 vs 85-94,99)"],
     "notes":"20,0 (>95%) / 15,0 (85-94,99%) / 10,0 (80-84,99%) pts -- min. 6 PDVs"}'::jsonb, 209),

  ('2.4.2', 'excelencia_operacional', 'Vendedor', '8 passos - Professional Food (BRN2)',
   '15,0 (90-100%) / 6,0 (80-89,99%) pts',
   'coord_excelencia', 'In loco', 'trimestral', 'comercial',
   15.0, true,
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"aderencia_8_passos_brn2_pct","unit":"percent","direction":"higher_better"},
     "per":[],
     "tiers":[{"min":90.0,"min_inclusive":true,"max":100.0,"max_inclusive":true,"points":15.0},
              {"min":80.0,"min_inclusive":true,"max":89.99,"max_inclusive":true,"points":6.0},
              {"max":80.0,"max_inclusive":false,"points":0.0}],
     "eligibility":{"min_days_in_role":90,"waivable_by_broker":true},
     "zeroing":[{"when":"expired_product_found_at_pdv","scope":"criterion","source_criterion":"2.16.1"}],
     "notes":"15,0 (90-100%) / 6,0 (80-89,99%) pts"}'::jsonb, 210),

  ('2.4.3', 'excelencia_operacional', 'Vendedor', '9 passos - Professional Bebidas (BRN8)',
   '15,0 / 6,0 pts',
   'coord_excelencia', 'In loco', 'trimestral', 'comercial',
   15.0, true,
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"aderencia_9_passos_brn8_pct","unit":"percent","direction":"higher_better"},
     "per":[],
     "tiers":[{"min":90.0,"min_inclusive":true,"max":100.0,"max_inclusive":true,"points":15.0,"inferred_from":"2.4.2"},
              {"min":80.0,"min_inclusive":true,"max":89.99,"max_inclusive":true,"points":6.0,"inferred_from":"2.4.2"},
              {"max":80.0,"max_inclusive":false,"points":0.0}],
     "eligibility":{"min_days_in_role":90,"waivable_by_broker":true},
     "zeroing":[{"when":"expired_product_found_at_pdv","scope":"criterion","source_criterion":"2.16.1"}],
     "gaps":["PRD 5.2 traz apenas os pontos (15,0 / 6,0), sem os percentuais. As faixas aqui foram inferidas de 2.4.2 -- CONFIRMAR no livro oficial antes de calcular."],
     "notes":"15,0 / 6,0 pts"}'::jsonb, 211),

  ('2.4.4', 'excelencia_operacional', 'Vendedor', '9 passos - Canal Especializado Purina',
   '15,0 / 6,0 pts',
   'coord_excelencia', 'In loco', 'trimestral', 'comercial',
   15.0, true,
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"aderencia_9_passos_purina_pct","unit":"percent","direction":"higher_better"},
     "per":[],
     "tiers":[{"min":90.0,"min_inclusive":true,"max":100.0,"max_inclusive":true,"points":15.0,"inferred_from":"2.4.2"},
              {"min":80.0,"min_inclusive":true,"max":89.99,"max_inclusive":true,"points":6.0,"inferred_from":"2.4.2"},
              {"max":80.0,"max_inclusive":false,"points":0.0}],
     "eligibility":{"min_days_in_role":90,"waivable_by_broker":true},
     "zeroing":[{"when":"expired_product_found_at_pdv","scope":"criterion","source_criterion":"2.16.1"}],
     "gaps":["PRD 5.2 traz apenas os pontos (15,0 / 6,0), sem os percentuais. As faixas aqui foram inferidas de 2.4.2 -- CONFIRMAR no livro oficial antes de calcular."],
     "notes":"15,0 / 6,0 pts"}'::jsonb, 212),

  ('2.5.1', 'excelencia_operacional', 'Promotor', '8 passos do Promotor',
   '11,0 (7-8 passos) / 5,0 (5-6 passos) pts',
   'coord_excelencia', 'In loco', 'trimestral', 'merchandising',
   11.0, true,
   '{"$schema":"crescer.scoring.v1","type":"count_tiers",
     "metric":{"key":"passos_promotor_cumpridos","unit":"count","direction":"higher_better","total":8},
     "per":[],
     "tiers":[{"min":7,"max":8,"points":11.0},
              {"min":5,"max":6,"points":5.0},
              {"min":0,"max":4,"points":0.0}],
     "eligibility":{"min_days_in_role":90,"waivable_by_broker":true},
     "zeroing":[{"when":"expired_product_found_at_pdv","scope":"criterion","source_criterion":"2.16.1"}],
     "notes":"11,0 (7-8 passos) / 5,0 (5-6 passos) pts"}'::jsonb, 213),

  ('2.6.1', 'excelencia_operacional', 'Desenvolvimento da Rota', 'Visita de desenvolvimento de rota (Supervisor)',
   '6,0 pts (6 vendedores x 5 PDVs/mes)',
   'broker', 'Connect Merchan / Plataforma', 'mensal', 'comercial',
   6.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"visitas_desenvolvimento_rota","unit":"count","direction":"higher_better"},
     "operator":"gte","value":30,"points_on_pass":6.0,"points_on_fail":0.0,
     "composition":{"vendedores":6,"pdvs_por_vendedor":5,"periodo":"mes"},
     "notes":"6,0 pts (6 vendedores x 5 PDVs/mes)"}'::jsonb, 214),

  ('2.7.1', 'excelencia_operacional', 'TI', 'Equipamentos (reserva min. 10%)',
   '4,0 pts',
   'coord_excelencia', 'In loco', 'trimestral', 'ti',
   4.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"reserva_tecnica_equipamentos_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":10,"points_on_pass":4.0,"points_on_fail":0.0,
     "notes":"4,0 pts; reserva tecnica minima de 10%"}'::jsonb, 215),

  ('2.8.1', 'excelencia_operacional', 'Supply Chain', 'Performance Supply Chain',
   '10,0 (7-9 itens) / 5,0 (4-6) / 3,0 (3 itens) pts',
   'sede_operacoes_brokers', 'BI (Visao Performance Brokers)', 'mensal', 'supply_chain',
   10.0, false,
   '{"$schema":"crescer.scoring.v1","type":"count_tiers",
     "metric":{"key":"itens_supply_atingidos","unit":"count","direction":"higher_better","total":9},
     "per":[],
     "tiers":[{"min":7,"max":9,"points":10.0},
              {"min":4,"max":6,"points":5.0},
              {"min":3,"max":3,"points":3.0},
              {"min":0,"max":2,"points":0.0}],
     "notes":"10,0 (7-9 itens) / 5,0 (4-6) / 3,0 (3 itens) pts"}'::jsonb, 216),

  ('2.8.2', 'excelencia_operacional', 'Supply Chain', 'Check List - Processos Operacionais',
   '14,0 pts se >= 80%',
   'sede_operacoes_brokers', 'In loco', 'trimestral', 'supply_chain',
   14.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"checklist_processos_operacionais_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":80,"points_on_pass":14.0,"points_on_fail":0.0,
     "self_assessment":{"required":true,"periodicity":"mensal","accuracy_tracking":true},
     "notes":"14,0 pts se >= 80%"}'::jsonb, 217),

  ('2.8.3', 'excelencia_operacional', 'Supply Chain', 'Check List - Gestao e Performance',
   '14,0 pts se >= 80%',
   'sede_operacoes_brokers', 'In loco', 'trimestral', 'supply_chain',
   14.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"checklist_gestao_performance_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":80,"points_on_pass":14.0,"points_on_fail":0.0,
     "self_assessment":{"required":true,"periodicity":"mensal","accuracy_tracking":true},
     "notes":"14,0 pts se >= 80%"}'::jsonb, 218),

  ('2.8.4', 'excelencia_operacional', 'Supply Chain', 'Check List - Processos de Distribuicao',
   '14,0 pts se >= 80%',
   'sede_operacoes_brokers', 'In loco', 'trimestral', 'logistica',
   14.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"checklist_distribuicao_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":80,"points_on_pass":14.0,"points_on_fail":0.0,
     "self_assessment":{"required":true,"periodicity":"mensal","accuracy_tracking":true},
     "notes":"14,0 pts se >= 80%"}'::jsonb, 219),

  ('2.8.5', 'excelencia_operacional', 'Supply Chain', 'Check List - Processos de Qualidade',
   '14,0 pts se >= 95%',
   'sede_operacoes_brokers', 'In loco', 'trimestral', 'supply_chain',
   14.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"checklist_qualidade_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":95,"points_on_pass":14.0,"points_on_fail":0.0,
     "self_assessment":{"required":true,"periodicity":"mensal","accuracy_tracking":true},
     "notes":"14,0 pts se >= 95%"}'::jsonb, 220),

  ('2.8.6', 'excelencia_operacional', 'Supply Chain', 'Check List - Processos de SHE',
   '14,0 pts se >= 95%',
   'sede_operacoes_brokers', 'In loco', 'trimestral', 'supply_chain',
   14.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"checklist_she_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":95,"points_on_pass":14.0,"points_on_fail":0.0,
     "self_assessment":{"required":true,"periodicity":"mensal","accuracy_tracking":true},
     "notes":"14,0 pts se >= 95%"}'::jsonb, 221),

  ('2.9.1', 'excelencia_operacional', 'Operacoes Logisticas', 'Emissao de credito por indenizacao em ate 30 dias',
   '5,0 pts (100% das notas)',
   'coord_excelencia', 'In loco', 'trimestral', 'logistica',
   5.0, false,
   '{"$schema":"crescer.scoring.v1","type":"threshold",
     "metric":{"key":"credito_indenizacao_30d_pct","unit":"percent","direction":"higher_better"},
     "operator":"gte","value":100,"points_on_pass":5.0,"points_on_fail":0.0,
     "sla":{"days":30},
     "notes":"5,0 pts; 100% das notas em ate 30 dias"}'::jsonb, 222),

  ('2.9.2', 'excelencia_operacional', 'Operacoes Logisticas', 'Processo de indenizacao (conferencia de mercadoria)',
   '5,0 pts',
   'coord_excelencia', 'In loco', 'trimestral', 'logistica',
   5.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"processo_indenizacao_conforme","unit":"count","direction":"higher_better"},
     "pass_when":{"op":"eq","value":true},"points_on_pass":5.0,"points_on_fail":0.0,
     "notes":"5,0 pts; conferencia de mercadoria conforme o processo"}'::jsonb, 223),

  ('2.9.3', 'excelencia_operacional', 'Operacoes Logisticas', '% de produtos destruidos na planta',
   '5,0 (-10%) / 2,0 (-8%) / 1,0 (-6%) pts vs. 2025',
   'sede_nestle', 'Dash de DSP', 'trimestral', 'logistica',
   5.0, false,
   -- Direcao invertida (reducao e melhor) e baseline em ano anterior: exige a
   -- serie historica de 2025, que a Fundacao ainda nao tem.
   '{"$schema":"crescer.scoring.v1","type":"tiers",
     "metric":{"key":"variacao_produtos_destruidos_pct","unit":"percent","direction":"lower_better",
               "baseline":"ano_2025"},
     "per":[],
     "tiers":[{"max":-10.0,"max_inclusive":true,"points":5.0},
              {"min":-9.99,"max":-8.0,"max_inclusive":true,"points":2.0},
              {"min":-7.99,"max":-6.0,"max_inclusive":true,"points":1.0},
              {"min":-5.99,"points":0.0}],
     "requires":{"baseline_series":"destruicao_2025"},
     "notes":"5,0 (-10%) / 2,0 (-8%) / 1,0 (-6%) pts vs. 2025"}'::jsonb, 224)

) as c(code, chapter, module, title, official_rule_text, evaluator, data_source,
       periodicity, responsible_department, max_points, zeroes_on_failure,
       scoring_rule, display_order)
on conflict (program_version_id, code) do update
  set title = excluded.title,
      module = excluded.module,
      official_rule_text = excluded.official_rule_text,
      evaluator = excluded.evaluator,
      data_source = excluded.data_source,
      periodicity = excluded.periodicity,
      responsible_department = excluded.responsible_department,
      max_points = excluded.max_points,
      zeroes_on_failure = excluded.zeroes_on_failure,
      scoring_rule = excluded.scoring_rule,
      display_order = excluded.display_order,
      updated_at = now();

-- ===========================================================================
-- ITENS DE COMPLIANCE (PRD secao 5.3)
-- ===========================================================================
-- Nao atingir 80% anula a pontuacao do trimestre onde a falha foi
-- identificada; no acumulado do ano, resulta em classificacao 1/1 na Matriz de
-- Meritocracia. E o maior risco do programa -- dai o modulo dedicado (PRD 6.6).
with pv as (
  select id from public.program_versions where code = 'LIVRO-2026-V3'
)
insert into public.criteria (
  program_version_id, code, chapter, module, title, official_rule_text,
  evaluator, data_source, periodicity, responsible_department,
  max_points, is_compliance, compliance_min_pct, zeroes_on_failure,
  scoring_rule, display_order
)
select pv.id, c.* from pv, (values

  ('2.11.1', 'compliance'::public.chapter, 'Compliance', 'Verbas em aberto ha mais de 60 dias',
   'Monitorar semanalmente arquivo de verbas',
   'coord_excelencia'::public.evaluator, 'Arquivo de verbas',
   'mensal'::public.periodicity, 'financeiro'::public.department,
   5.0::numeric, true, 80.0::numeric, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"verbas_abertas_mais_60d","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":5.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":5.0,"min_pct":80},
     "monitoring":{"frequency":"semanal"},
     "notes":"Monitorar semanalmente o arquivo de verbas"}'::jsonb, 301),

  ('2.12.1', 'compliance', 'Compliance', 'Alvaras atualizados',
   'Sem excecoes - protocolo a cada 6 meses se nao emitido',
   'coord_excelencia', 'Repositorio de documentos', 'trimestral', 'compliance',
   10.0, true, 80.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"alvaras_vencidos","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":10.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":10.0,"min_pct":80},
     "deadlines":[{"key":"validade_documento","rule":"document_expiry","on_miss":"fail_item",
                   "alerts_days_before":[30,15,5]}],
     "fallback":{"when":"orgao_nao_emitiu","action":"protocolo","renew_every_months":6},
     "notes":"Sem excecoes; protocolo a cada 6 meses se o orgao nao emitir"}'::jsonb, 302),

  ('2.12.2', 'compliance', 'Compliance', 'Certidoes negativas de debitos',
   'Enviar via Forms ate o fim do trimestre',
   'coord_excelencia', 'Forms', 'trimestral', 'financeiro',
   10.0, true, 80.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"certidoes_pendentes","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":10.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":10.0,"min_pct":80},
     "deadlines":[{"key":"envio","rule":"end_of_quarter","on_miss":"fail_item",
                   "alerts_days_before":[30,15,5]}],
     "notes":"Enviar via Forms ate o fim do trimestre; lista completa no Anexo XI"}'::jsonb, 303),

  ('2.13.1', 'compliance', 'Compliance', 'Expedicao de produtos salvage/bloqueados/restritos',
   'Produtos com <= 15 dias de vencimento - verificacao via MB51',
   'coord_excelencia', 'MB51', 'mensal', 'logistica',
   5.0, true, 80.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"expedicoes_irregulares","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":5.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":5.0,"min_pct":80},
     "threshold_days_to_expiry":15,
     "notes":"Produtos salvage/bloqueados/restritos com <= 15 dias de vencimento; via MB51"}'::jsonb, 304),

  ('2.14.1', 'compliance', 'Compliance', 'Processo de Transpasse',
   'Nota emitida = expedida no mesmo dia',
   'coord_excelencia', 'SAP', 'trimestral', 'logistica',
   12.0, true, 80.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"transpasses_fora_do_dia","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":12.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":12.0,"min_pct":80},
     "notes":"Nota emitida = expedida no mesmo dia"}'::jsonb, 305),

  ('2.15.1', 'compliance', 'Compliance', 'Processo de escrituracao',
   'Escrituracao em ate 30 dias - verificacao via SAP/NBS',
   'coord_excelencia', 'SAP / NBS', 'mensal', 'financeiro',
   9.0, true, 80.0, false,
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"escrituracoes_fora_prazo","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":9.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":9.0,"min_pct":80},
     "sla":{"days":30},
     "notes":"Escrituracao em ate 30 dias; via SAP/NBS"}'::jsonb, 306),

  ('2.16.1', 'compliance', 'Compliance', 'Produtos vencidos no PDV',
   'Qualquer unidade vencida zera o item',
   'coord_excelencia', 'In loco', 'trimestral', 'merchandising',
   11.0, true, 80.0, true,
   -- Este criterio tambem zera 2.4.1 a 2.5.1 quando disparado no PDV avaliado
   -- (PRD 6.5). O vinculo esta declarado no `zeroing` daqueles criterios.
   '{"$schema":"crescer.scoring.v1","type":"boolean_gate",
     "metric":{"key":"unidades_vencidas_pdv","unit":"count","direction":"lower_better"},
     "pass_when":{"op":"eq","value":0},"points_on_pass":11.0,"points_on_fail":0.0,
     "compliance":{"is_item":true,"weight":11.0,"min_pct":80},
     "zeroing":[{"when":"any_unit_expired","scope":"criterion",
                 "description":"Qualquer unidade vencida zera o item",
                 "also_zeroes":["2.4.1","2.4.2","2.4.3","2.4.4","2.5.1"]}],
     "notes":"Qualquer unidade vencida zera o item"}'::jsonb, 307)

) as c(code, chapter, module, title, official_rule_text, evaluator, data_source,
       periodicity, responsible_department, max_points, is_compliance,
       compliance_min_pct, zeroes_on_failure, scoring_rule, display_order)
on conflict (program_version_id, code) do update
  set title = excluded.title,
      module = excluded.module,
      official_rule_text = excluded.official_rule_text,
      evaluator = excluded.evaluator,
      data_source = excluded.data_source,
      periodicity = excluded.periodicity,
      responsible_department = excluded.responsible_department,
      max_points = excluded.max_points,
      is_compliance = excluded.is_compliance,
      compliance_min_pct = excluded.compliance_min_pct,
      zeroes_on_failure = excluded.zeroes_on_failure,
      scoring_rule = excluded.scoring_rule,
      display_order = excluded.display_order,
      updated_at = now();
