/*
 * Dados da pre-avaliacao. Estabelece o padrao de ESCRITA do projeto (primeiro
 * write path): useMutation + invalidateQueries no queryClient compartilhado.
 *
 * As RLS da migracao exigem, em toda escrita, que created_by/updated_by seja o
 * proprio usuario e que a rodada esteja 'aberta' -- por isso os hooks de escrita
 * dependem de useCurrentUser e sempre carimbam o id do usuario.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useCurrentUser } from '@/features/auth/hooks'
import type {
  Chapter,
  Criterion,
  CriterionWithEntry,
  Entry,
  Rodada,
  SectionGroup,
} from '@/features/pre-avaliacao/types'

const CRITERION_COLUMNS =
  'id, code, chapter, module, title, official_rule_text, periodicity, ' +
  'responsible_department, max_points, points_pending_review, is_compliance, ' +
  'compliance_min_pct, display_order'

/** Secao a partir do code: '2.8.2' -> '2.8'. */
function sectionOf(code: string): string {
  const parts = code.split('.')
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : code
}

/** Agrupa criterios+lancamentos por secao, preservando a ordem do catalogo. */
function groupBySection(items: CriterionWithEntry[]): SectionGroup[] {
  const groups = new Map<string, SectionGroup>()
  for (const item of items) {
    const section = sectionOf(item.criterion.code)
    const group = groups.get(section)
    if (group) group.items.push(item)
    else groups.set(section, { section, module: item.criterion.module, items: [item] })
  }
  return [...groups.values()]
}

/** Versao do livro vigente (status 'active'). Base para criar rodadas. */
export function useActiveProgramVersion() {
  return useQuery({
    queryKey: ['program-version-active'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_versions')
        .select('id, code, name, year')
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

/** Todas as rodadas da organizacao, mais recentes primeiro. */
export function useRodadas() {
  return useQuery({
    queryKey: ['pre-avaliacao', 'rodadas'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_assessments')
        .select('*')
        .order('opened_on', { ascending: false })
      if (error) throw error
      return data as Rodada[]
    },
  })
}

/** A rodada aberta mais recente (a que se edita). null se nao houver. */
export function useRodadaAberta() {
  return useQuery({
    queryKey: ['pre-avaliacao', 'rodada-aberta'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_assessments')
        .select('*')
        .eq('status', 'aberta')
        .order('opened_on', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return (data as Rodada | null) ?? null
    },
  })
}

/**
 * Criterios de um capitulo com o lancamento da rodada (se houver), agrupados por
 * secao. Duas queries + merge no cliente -- o mesmo padrao do DashboardPage, e
 * mais claro que um embed do PostgREST com filtro na tabela embutida.
 */
export function useChapterEntries(chapter: Chapter, rodadaId: string | undefined) {
  return useQuery({
    queryKey: ['pre-avaliacao', 'chapter-entries', chapter, rodadaId ?? null],
    enabled: Boolean(rodadaId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SectionGroup[]> => {
      const criteriaResult = await supabase
        .from('criteria')
        .select(CRITERION_COLUMNS)
        .eq('chapter', chapter)
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('code', { ascending: true })
      if (criteriaResult.error) throw criteriaResult.error

      const entriesResult = await supabase
        .from('pre_assessment_entries')
        .select('*')
        .eq('pre_assessment_id', rodadaId!)
      if (entriesResult.error) throw entriesResult.error

      const byCriterion = new Map<string, Entry>()
      for (const entry of (entriesResult.data as Entry[]) ?? []) {
        byCriterion.set(entry.criterion_id, entry)
      }

      const merged: CriterionWithEntry[] = (
        (criteriaResult.data as unknown as Criterion[]) ?? []
      ).map((criterion) => ({
        criterion,
        entry: byCriterion.get(criterion.id) ?? null,
      }))

      return groupBySection(merged)
    },
  })
}

/**
 * Catalogo de um capitulo, agrupado por secao, SEM lancamentos. Para as telas
 * de referencia somente-leitura (Performance, enquanto a pre-avaliacao dele nao
 * existe). Leitura livre -- a RLS do catalogo e aberta a autenticados.
 */
export function useChapterCatalog(chapter: Chapter) {
  return useQuery({
    queryKey: ['pre-avaliacao', 'chapter-catalog', chapter],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SectionGroup[]> => {
      const { data, error } = await supabase
        .from('criteria')
        .select(CRITERION_COLUMNS)
        .eq('chapter', chapter)
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('code', { ascending: true })
      if (error) throw error
      const merged: CriterionWithEntry[] = ((data as unknown as Criterion[]) ?? []).map(
        (criterion) => ({
          criterion,
          entry: null,
        })
      )
      return groupBySection(merged)
    },
  })
}

/** Cria uma rodada. created_by/organization_id carimbados do usuario (RLS exige). */
export function useCreateRodada() {
  const { data: currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async (input: {
      label: string
      programVersionId: string
      targetAuditOn?: string | null
    }) => {
      if (!currentUser) throw new Error('Sessao nao carregada.')
      const { data, error } = await supabase
        .from('pre_assessments')
        .insert({
          label: input.label,
          program_version_id: input.programVersionId,
          organization_id: currentUser.profile.organization_id,
          created_by: currentUser.profile.id,
          target_audit_on: input.targetAuditOn ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      return data as Rodada
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-avaliacao', 'rodadas'] })
      queryClient.invalidateQueries({ queryKey: ['pre-avaliacao', 'rodada-aberta'] })
    },
  })
}

/** Fecha uma rodada (congela). So label/status/target_audit_on sao editaveis (grant). */
export function useCloseRodada() {
  return useMutation({
    mutationFn: async (rodadaId: string) => {
      const { error } = await supabase
        .from('pre_assessments')
        .update({ status: 'fechada' })
        .eq('id', rodadaId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-avaliacao'] })
    },
  })
}

/**
 * Salva o estado de um criterio na rodada (upsert na chave rodada+criterio).
 * updated_by carimbado do usuario -- a RLS rejeita gravar em nome de outro.
 */
export function useUpsertEntry(chapter: Chapter, rodadaId: string) {
  const { data: currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async (input: {
      criterionId: string
      status: Entry['status']
      notes: string | null
    }) => {
      if (!currentUser) throw new Error('Sessao nao carregada.')
      const { error } = await supabase.from('pre_assessment_entries').upsert(
        {
          pre_assessment_id: rodadaId,
          criterion_id: input.criterionId,
          status: input.status,
          notes: input.notes,
          updated_by: currentUser.profile.id,
        },
        { onConflict: 'pre_assessment_id,criterion_id' }
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pre-avaliacao', 'chapter-entries', chapter, rodadaId],
      })
    },
  })
}
