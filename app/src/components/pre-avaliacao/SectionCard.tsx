import { CriterionRow } from '@/components/pre-avaliacao/CriterionRow'
import { computeReadiness } from '@/features/pre-avaliacao/status'
import { sectionAnchor } from '@/features/pre-avaliacao/anchors'
import { formatPercent } from '@/lib/utils'
import type { ConformityStatus, SectionGroup } from '@/features/pre-avaliacao/types'

/*
 * Um bloco de secao (2.1, 2.8...) com as linhas de criterio. Carrega o id de
 * ancora usado pelo submenu lateral, e scroll-margin para o cabecalho fixo nao
 * cobrir o titulo ao pular.
 */
export function SectionCard({
  group,
  readOnly,
  onSave,
}: {
  group: SectionGroup
  readOnly: boolean
  onSave: (input: { criterionId: string; status: ConformityStatus; notes: string | null }) => Promise<void>
}) {
  const readiness = computeReadiness(group.items)

  return (
    <section
      id={sectionAnchor(group.section)}
      aria-labelledby={`${sectionAnchor(group.section)}-title`}
      className="border-hairline scroll-mt-20 overflow-hidden rounded-xl border bg-white"
    >
      <header className="border-hairline bg-surface flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 id={`${sectionAnchor(group.section)}-title`} className="text-ink text-sm font-bold">
          <span className="text-ink-muted font-normal">{group.section}</span> {group.module}
        </h3>
        <span className="text-ink-muted shrink-0 text-xs">
          {formatPercent(readiness.percent)} · {readiness.assessed}/{readiness.applicable}
        </span>
      </header>

      <div>
        {group.items.map((item) => (
          <CriterionRow
            key={item.criterion.id}
            item={item}
            readOnly={readOnly}
            onSave={onSave}
          />
        ))}
      </div>
    </section>
  )
}
