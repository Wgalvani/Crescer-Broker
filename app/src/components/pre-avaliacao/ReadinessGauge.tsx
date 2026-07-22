import { cn, formatPercent } from '@/lib/utils'
import type { Readiness } from '@/features/pre-avaliacao/status'

/*
 * Prontidao (autoavaliacao) -- NUNCA "pontuacao", que e oficial da Nestle. Mostra
 * o % e, ao lado, "X de Y avaliados", para o pendente nunca ficar escondido
 * atras de um numero redondo.
 */
export function ReadinessGauge({
  readiness,
  label,
  className,
}: {
  readiness: Readiness
  label?: string
  className?: string
}) {
  const { percent, assessed, applicable, total } = readiness
  const naoAplicavel = total - applicable

  // Faixa de cor por prontidao: risco / atencao / ok. Mesma semantica do livro.
  const barClass =
    percent >= 80
      ? 'bg-status-ok'
      : percent >= 50
        ? 'bg-status-warn'
        : 'bg-status-risk'

  return (
    <div className={cn('rounded-xl border border-hairline bg-white p-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          {label && <p className="text-ink-muted text-xs">{label}</p>}
          <p className="text-ink font-display text-2xl font-bold">
            {formatPercent(percent)}
            <span className="text-ink-muted ml-1 text-sm font-normal">de prontidão</span>
          </p>
        </div>
        <p className="text-ink-muted text-right text-xs">
          {assessed} de {applicable} avaliados
          {naoAplicavel > 0 && (
            <>
              <br />
              {naoAplicavel} não se aplica{naoAplicavel > 1 ? 'm' : ''}
            </>
          )}
        </p>
      </div>

      <div
        className="bg-surface mt-3 h-2 overflow-hidden rounded-full"
        role="img"
        aria-label={`Prontidão ${formatPercent(percent)}, ${assessed} de ${applicable} critérios avaliados`}
      >
        <div
          className={cn('h-full rounded-full transition-all', barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
