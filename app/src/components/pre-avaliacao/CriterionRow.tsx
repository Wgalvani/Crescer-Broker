import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CONFORMITY_META,
  CONFORMITY_ORDER,
} from '@/features/pre-avaliacao/status'
import type { ConformityStatus, CriterionWithEntry } from '@/features/pre-avaliacao/types'

/*
 * Uma linha de criterio na pre-avaliacao: identificacao + texto oficial do livro
 * + seletor de conformidade + notas (o que esta feito / o que falta).
 *
 * O status salva na hora (clique); as notas salvam ao sair do campo (blur), so
 * se mudaram. `readOnly` desliga a edicao quando a rodada esta fechada.
 */
export function CriterionRow({
  item,
  readOnly,
  onSave,
}: {
  item: CriterionWithEntry
  readOnly: boolean
  onSave: (input: { criterionId: string; status: ConformityStatus; notes: string | null }) => Promise<void>
}) {
  const { criterion, entry } = item
  const savedStatus: ConformityStatus = entry?.status ?? 'nao_avaliado'
  const savedNotes = entry?.notes ?? ''

  const [notes, setNotes] = useState(savedNotes)
  const [saving, setSaving] = useState(false)
  const [showRule, setShowRule] = useState(false)

  // Mantem o campo em sincronia quando a query revalida apos salvar.
  useEffect(() => {
    setNotes(savedNotes)
  }, [savedNotes])

  async function persist(status: ConformityStatus, nextNotes: string) {
    setSaving(true)
    try {
      await onSave({
        criterionId: criterion.id,
        status,
        notes: nextNotes.trim() === '' ? null : nextNotes.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-hairline border-t px-4 py-3 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="text-ink text-sm font-medium">
            <span className="text-ink-muted font-normal">{criterion.code}</span>{' '}
            {criterion.title}
          </p>
          <p className="text-ink-muted mt-0.5 text-xs">
            {criterion.periodicity === 'trimestral' ? 'Trimestral' : 'Mensal'}
            {criterion.compliance_min_pct != null &&
              ` · mínimo ${criterion.compliance_min_pct}%`}
            {criterion.points_pending_review && ' · pontos a definir no livro'}
          </p>

          {criterion.official_rule_text && (
            <>
              <button
                type="button"
                onClick={() => setShowRule((v) => !v)}
                className="text-brand-blue mt-1 text-xs hover:underline"
                aria-expanded={showRule}
              >
                {showRule ? 'Ocultar regra do livro' : 'Ver regra do livro'}
              </button>
              {showRule && (
                <p className="text-ink-muted bg-surface mt-1 rounded-md p-2 text-xs whitespace-pre-line">
                  {criterion.official_rule_text}
                </p>
              )}
            </>
          )}
        </div>

        <div
          className="flex shrink-0 flex-wrap gap-1"
          role="group"
          aria-label={`Conformidade do critério ${criterion.code}`}
        >
          {CONFORMITY_ORDER.map((status) => {
            const meta = CONFORMITY_META[status]
            const active = savedStatus === status
            return (
              <button
                key={status}
                type="button"
                disabled={readOnly || saving}
                aria-pressed={active}
                onClick={() => void persist(status, notes)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60',
                  active
                    ? meta.activeClass
                    : 'border-hairline text-ink-muted hover:bg-surface'
                )}
              >
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      <textarea
        value={notes}
        readOnly={readOnly}
        rows={2}
        placeholder="O que já está feito, o que falta, onde estão as evidências..."
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== savedNotes) void persist(savedStatus, notes)
        }}
        className="border-hairline focus:border-brand-blue text-ink mt-2 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none read-only:opacity-70"
      />
    </div>
  )
}
