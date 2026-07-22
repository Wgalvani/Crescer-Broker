import { Link } from 'react-router-dom'
import { useRoundsEvolution } from '@/features/pre-avaliacao/hooks'
import { cn, formatPercent } from '@/lib/utils'

/*
 * Evolucao da prontidao entre rodadas (Gestao a Vista no Dashboard). A primeira
 * rodada e a linha de base; cada seguinte mostra a variacao -- subimos ou caimos.
 */
function barClass(percent: number): string {
  if (percent >= 80) return 'bg-status-ok'
  if (percent >= 50) return 'bg-status-warn'
  return 'bg-status-risk'
}

export function RoundsEvolution() {
  const { data: rounds, isLoading } = useRoundsEvolution()

  if (isLoading) {
    return (
      <section className="border-hairline rounded-xl border bg-white p-6">
        <p className="text-ink-muted text-sm">Carregando evolução...</p>
      </section>
    )
  }

  if (!rounds || rounds.length === 0) {
    return (
      <section className="border-hairline rounded-xl border bg-white p-6">
        <h2 className="text-ink text-lg">Evolução das pré-avaliações</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Abra e preencha uma rodada de pré-avaliação para acompanhar aqui se estamos evoluindo
          entre uma visita e outra.
        </p>
        <Link
          to="/pre-avaliacao/rodadas"
          className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold"
        >
          Abrir primeira rodada
        </Link>
      </section>
    )
  }

  const baseline = rounds[0]!

  return (
    <section className="border-hairline rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-ink text-lg">Evolução das pré-avaliações</h2>
        <Link to="/pre-avaliacao" className="text-brand-blue text-sm hover:underline">
          Gestão à Vista →
        </Link>
      </div>
      <p className="text-ink-muted mt-1 text-sm">
        Prontidão geral (Excelência + Compliance) por rodada. A primeira é a linha de base.
      </p>

      <ul className="mt-5 space-y-4">
        {rounds.map((round, i) => {
          const prev = i > 0 ? rounds[i - 1]! : null
          const deltaPrev = prev ? round.readiness.percent - prev.readiness.percent : null
          const deltaBase =
            i > 0 ? round.readiness.percent - baseline.readiness.percent : null
          return (
            <li key={round.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-ink text-sm font-medium">
                  {round.label}
                  {i === 0 && (
                    <span className="text-ink-muted ml-2 text-xs font-normal">linha de base</span>
                  )}
                  {round.status === 'aberta' && (
                    <span className="bg-status-ok/10 text-status-ok ml-2 rounded-full px-2 py-0.5 text-xs font-normal">
                      aberta
                    </span>
                  )}
                </p>
                <div className="flex items-baseline gap-3 text-sm">
                  {deltaPrev !== null && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        deltaPrev > 0
                          ? 'text-status-ok'
                          : deltaPrev < 0
                            ? 'text-status-risk'
                            : 'text-ink-muted'
                      )}
                      title="Variação vs. rodada anterior"
                    >
                      {deltaPrev > 0 ? '▲' : deltaPrev < 0 ? '▼' : '='}{' '}
                      {formatPercent(Math.abs(deltaPrev))}
                    </span>
                  )}
                  <span className="text-ink font-display font-bold tabular-nums">
                    {formatPercent(round.readiness.percent)}
                  </span>
                </div>
              </div>

              <div className="bg-surface mt-2 h-2.5 overflow-hidden rounded-full">
                <div
                  className={cn('h-full rounded-full transition-all', barClass(round.readiness.percent))}
                  style={{ width: `${round.readiness.percent}%` }}
                />
              </div>

              <p className="text-ink-muted mt-1 text-xs">
                {round.readiness.assessed} de {round.readiness.applicable} critérios avaliados
                {deltaBase !== null &&
                  ` · ${deltaBase >= 0 ? '+' : ''}${formatPercent(deltaBase)} vs. linha de base`}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
