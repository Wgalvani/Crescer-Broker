/*
 * Tipos da pre-avaliacao (autoavaliacao / Gestao a Vista).
 *
 * Derivam dos tipos gerados pelo Supabase (Tables/Enums). Enquanto a migracao
 * 20260722090000_pre_assessments nao for aplicada e `npm run db:types` nao rodar,
 * as duas tabelas foram adicionadas a mao em src/types/database.types.ts como
 * ponte -- regenerar substitui por identico.
 */
import type { Tables, Enums } from '@/types/database.types'

/** 'aberta' | 'fechada'. */
export type AssessmentStatus = Enums<'assessment_status'>

/** 'nao_avaliado' | 'conforme' | 'parcial' | 'nao_conforme' | 'nao_aplicavel'. */
export type ConformityStatus = Enums<'conformity_status'>

export type Chapter = Enums<'chapter'>

export type Rodada = Tables<'pre_assessments'>
export type Entry = Tables<'pre_assessment_entries'>

/** Colunas do catalogo que a pre-avaliacao exibe/agrupa. */
export type Criterion = Pick<
  Tables<'criteria'>,
  | 'id'
  | 'code'
  | 'chapter'
  | 'module'
  | 'title'
  | 'official_rule_text'
  | 'periodicity'
  | 'responsible_department'
  | 'max_points'
  | 'points_pending_review'
  | 'is_compliance'
  | 'compliance_min_pct'
  | 'display_order'
>

/** Um criterio com o lancamento correspondente na rodada (se ja existir). */
export type CriterionWithEntry = {
  criterion: Criterion
  entry: Entry | null
}

/** Criterios de uma secao (2.1, 2.2...) agrupados sob o rotulo do modulo. */
export type SectionGroup = {
  /** Prefixo da secao a partir do code: '2.1', '2.8'. */
  section: string
  /** Rotulo do modulo vindo do catalogo: 'Pessoas', 'Supply Chain'. */
  module: string
  items: CriterionWithEntry[]
}
