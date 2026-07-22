import { Link } from 'react-router-dom'
import { ReadinessGauge } from '@/components/pre-avaliacao/ReadinessGauge'
import { useChapterEntries, useRodadaAberta } from '@/features/pre-avaliacao/hooks'
import { computeReadiness } from '@/features/pre-avaliacao/status'
import type { Chapter } from '@/features/pre-avaliacao/types'

const CHAPTERS: { chapter: Chapter; label: string; to: string }[] = [
  { chapter: 'excelencia_operacional', label: 'Capítulo II · Excelência Operacional', to: '/pre-avaliacao/excelencia' },
  { chapter: 'compliance', label: '2.10 · Itens de Compliance', to: '/pre-avaliacao/compliance' },
]

function ChapterCard({
  chapter,
  label,
  to,
  rodadaId,
}: {
  chapter: Chapter
  label: string
  to: string
  rodadaId: string
}) {
  const { data: sections, isLoading } = useChapterEntries(chapter, rodadaId)
  const items = (sections ?? []).flatMap((s) => s.items)
  const readiness = computeReadiness(items)

  return (
    <Link to={to} className="block rounded-xl transition-shadow hover:shadow-md">
      {isLoading ? (
        <div className="border-hairline text-ink-muted rounded-xl border bg-white p-4 text-sm">
          Carregando {label}...
        </div>
      ) : (
        <ReadinessGauge readiness={readiness} label={label} />
      )}
    </Link>
  )
}

export function PreAvaliacaoOverviewPage() {
  const { data: rodada, isLoading } = useRodadaAberta()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-ink text-2xl">Gestão à Vista</h1>
          <p className="text-ink-muted mt-1 text-sm">
            Pré-avaliação interna — onde estamos em cada capítulo antes da visita da Nestlé.
          </p>
        </div>
        <Link to="/pre-avaliacao/rodadas" className="text-brand-blue text-sm hover:underline">
          Gerenciar rodadas
        </Link>
      </div>

      {isLoading ? (
        <p className="text-ink-muted text-sm">Carregando...</p>
      ) : !rodada ? (
        <div className="border-hairline rounded-xl border bg-white p-6">
          <p className="text-ink text-sm">Nenhuma rodada de pré-avaliação aberta.</p>
          <p className="text-ink-muted mt-1 text-sm">
            Abra uma rodada para acompanhar a prontidão de cada capítulo.
          </p>
          <Link
            to="/pre-avaliacao/rodadas"
            className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold"
          >
            Gerenciar rodadas
          </Link>
        </div>
      ) : (
        <>
          <p className="text-ink-muted text-sm">
            Rodada aberta: <span className="text-ink font-medium">{rodada.label}</span>
            {rodada.target_audit_on && ` · visita prevista para ${rodada.target_audit_on}`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHAPTERS.map((c) => (
              <ChapterCard key={c.chapter} {...c} rodadaId={rodada.id} />
            ))}
          </div>
          <p className="text-ink-muted text-xs">
            Prontidão é autoavaliação interna, contada por critério (conforme = 1, parcial =
            0,5). Não é a pontuação oficial do programa — essa é sempre a publicada pela Nestlé.
          </p>
        </>
      )}
    </div>
  )
}
