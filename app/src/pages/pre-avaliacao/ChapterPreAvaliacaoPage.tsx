import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ReadinessGauge } from '@/components/pre-avaliacao/ReadinessGauge'
import { SectionCard } from '@/components/pre-avaliacao/SectionCard'
import {
  useChapterEntries,
  useRodadaAberta,
  useUpsertEntry,
} from '@/features/pre-avaliacao/hooks'
import { computeReadiness } from '@/features/pre-avaliacao/status'
import { useCurrentUser } from '@/features/auth/hooks'
import type { Chapter } from '@/features/pre-avaliacao/types'

export function ChapterPreAvaliacaoPage({
  chapter,
  heading,
}: {
  chapter: Chapter
  heading: string
}) {
  const location = useLocation()
  const { data: currentUser } = useCurrentUser()
  const { data: rodada, isLoading: loadingRodada } = useRodadaAberta()
  const { data: sections, isLoading: loadingSections } = useChapterEntries(chapter, rodada?.id)
  const upsert = useUpsertEntry(chapter, rodada?.id ?? '')

  const isAdmin = currentUser?.roles.some((r) => r.key === 'admin') ?? false
  const canWrite = isAdmin || (currentUser?.permissions.has('scoring.write') ?? false)

  // Rola ate a secao quando o menu lateral navega com hash (#sec-2-1).
  useEffect(() => {
    if (!location.hash || !sections) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, sections])

  if (loadingRodada) {
    return <p className="text-ink-muted text-sm">Carregando...</p>
  }

  if (!rodada) {
    return (
      <div className="space-y-4">
        <h1 className="text-ink text-2xl">{heading}</h1>
        <div className="border-hairline rounded-xl border bg-white p-6">
          <p className="text-ink text-sm">Nenhuma rodada de pré-avaliação aberta.</p>
          <p className="text-ink-muted mt-1 text-sm">
            Abra uma rodada para começar a registrar o que está feito e o que falta.
          </p>
          <Link
            to="/pre-avaliacao/rodadas"
            className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold"
          >
            Gerenciar rodadas
          </Link>
        </div>
      </div>
    )
  }

  const rodadaFechada = rodada.status !== 'aberta'
  const readOnly = rodadaFechada || !canWrite
  const allItems = (sections ?? []).flatMap((s) => s.items)
  const readiness = computeReadiness(allItems)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-ink text-2xl">{heading}</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Rodada <span className="font-medium">{rodada.label}</span> · pré-avaliação interna
          </p>
        </div>
        <Link to="/pre-avaliacao" className="text-brand-blue text-sm hover:underline">
          ← Gestão à Vista
        </Link>
      </div>

      <ReadinessGauge readiness={readiness} label={`Prontidão de ${heading}`} />

      {readOnly && (
        <p className="border-status-warn/30 bg-amber-50 text-ink rounded-lg border px-3 py-2 text-sm">
          {rodadaFechada
            ? 'Rodada fechada — as marcações estão congeladas e não podem ser editadas.'
            : 'Acesso somente leitura: seu perfil não tem permissão para editar a pré-avaliação (scoring.write). Fale com a equipe de TI para liberar.'}
        </p>
      )}

      {loadingSections ? (
        <p className="text-ink-muted text-sm">Carregando critérios...</p>
      ) : allItems.length === 0 ? (
        <p className="text-ink-muted text-sm">Nenhum critério neste capítulo.</p>
      ) : (
        <div className="space-y-4">
          {(sections ?? []).map((group) => (
            <SectionCard
              key={group.section}
              group={group}
              readOnly={readOnly}
              onSave={(input) => upsert.mutateAsync(input)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
