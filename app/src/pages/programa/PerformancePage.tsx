import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useChapterCatalog } from '@/features/pre-avaliacao/hooks'
import { sectionAnchor } from '@/features/pre-avaliacao/anchors'
import { formatPontos } from '@/lib/utils'

/*
 * Capitulo I -- Performance, somente leitura. Performance e medido pela Nestle
 * via sistemas (PRESER/BEES), nao e checklist in loco: a pre-avaliacao dele
 * entra depois, como acompanhamento de meta. Por ora, a referencia do catalogo.
 */
export function PerformancePage() {
  const location = useLocation()
  const { data: sections, isLoading } = useChapterCatalog('performance')

  useEffect(() => {
    if (!location.hash || !sections) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, sections])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl">Capítulo I · Performance</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Medido pela Nestlé via sistemas (PRESER, BEES, dashboards). Referência do livro —
          a pré-avaliação de meta entra numa próxima fase.
        </p>
      </div>

      {isLoading ? (
        <p className="text-ink-muted text-sm">Carregando...</p>
      ) : (
        <div className="space-y-4">
          {(sections ?? []).map((group) => (
            <section
              key={group.section}
              id={sectionAnchor(group.section)}
              className="border-hairline scroll-mt-20 overflow-hidden rounded-xl border bg-white"
            >
              <header className="border-hairline bg-surface border-b px-4 py-3">
                <h2 className="text-ink text-sm font-bold">
                  <span className="text-ink-muted font-normal">{group.section}</span>{' '}
                  {group.module}
                </h2>
              </header>
              <ul className="divide-hairline divide-y">
                {group.items.map(({ criterion }) => (
                  <li key={criterion.id} className="px-4 py-3">
                    <p className="text-ink text-sm font-medium">
                      <span className="text-ink-muted font-normal">{criterion.code}</span>{' '}
                      {criterion.title}
                    </p>
                    <p className="text-ink-muted mt-0.5 text-xs">
                      {criterion.periodicity === 'trimestral' ? 'Trimestral' : 'Mensal'}
                      {criterion.points_pending_review
                        ? ' · pontos a definir no livro'
                        : criterion.max_points != null &&
                          ` · ${formatPontos(criterion.max_points)} pts`}
                    </p>
                    {criterion.official_rule_text && (
                      <p className="text-ink-muted mt-1 text-xs whitespace-pre-line">
                        {criterion.official_rule_text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
