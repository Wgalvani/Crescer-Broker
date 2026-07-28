import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useRoundsEvolution } from '@/features/pre-avaliacao/hooks'
import { cn, formatPercent } from '@/lib/utils'

/*
 * Evolucao da prontidao entre rodadas -- a leitura executiva da Gestao a Vista.
 * Linha de tendencia (area) com a META de 80% marcada: num relance da para ver
 * se estamos subindo e se ja passamos do piso. O numero grande e a rodada atual;
 * a variacao e sempre contra a linha de base (primeira rodada).
 */
const META = 80

function bandColor(percent: number): string {
  if (percent >= 80) return 'var(--color-status-ok)'
  if (percent >= 50) return 'var(--color-status-warn)'
  return 'var(--color-status-risk)'
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
  const latest = rounds[rounds.length - 1]!
  const deltaBase = rounds.length > 1 ? latest.readiness.percent - baseline.readiness.percent : null

  const data = rounds.map((r) => ({
    label: r.label,
    percent: r.readiness.percent,
    assessed: r.readiness.assessed,
    applicable: r.readiness.applicable,
  }))

  const latestColor = bandColor(latest.readiness.percent)

  return (
    <section className="border-hairline rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-ink text-lg">Evolução das pré-avaliações</h2>
        <Link to="/pre-avaliacao" className="text-brand-blue text-sm hover:underline">
          Gestão à Vista →
        </Link>
      </div>

      {/* Resumo executivo: rodada atual em destaque + tendencia vs. linha de base. */}
      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="text-ink-muted text-xs">
            {latest.label}
            {latest.status === 'aberta' && (
              <span className="bg-status-ok/10 text-status-ok ml-2 rounded-full px-2 py-0.5 text-[0.65rem] font-medium">
                aberta
              </span>
            )}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              className="font-display text-4xl font-bold tabular-nums"
              style={{ color: latestColor }}
            >
              {formatPercent(latest.readiness.percent)}
            </span>
            <span className="text-ink-muted text-sm">de prontidão</span>
          </p>
        </div>

        {deltaBase !== null && (
          <div>
            <p className="text-ink-muted text-xs">vs. linha de base ({baseline.label})</p>
            <p
              className={cn(
                'font-display mt-1 text-xl font-bold tabular-nums',
                deltaBase > 0
                  ? 'text-status-ok'
                  : deltaBase < 0
                    ? 'text-status-risk'
                    : 'text-ink-muted'
              )}
            >
              {deltaBase > 0 ? '▲ +' : deltaBase < 0 ? '▼ ' : ''}
              {formatPercent(deltaBase)}
            </p>
          </div>
        )}

        <div>
          <p className="text-ink-muted text-xs">Critérios avaliados</p>
          <p className="text-ink font-display mt-1 text-xl font-bold tabular-nums">
            {latest.readiness.assessed}
            <span className="text-ink-muted text-sm font-normal">
              {' '}
              de {latest.readiness.applicable}
            </span>
          </p>
        </div>
      </div>

      {/* Tendencia. Linha da marca com a META de 80% (piso de compliance) marcada. */}
      <div className="mt-5 -ml-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="evolucao-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-hairline)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-hairline)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 80, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <ReferenceLine
              y={META}
              stroke="var(--color-status-warn)"
              strokeDasharray="5 4"
              label={{
                value: 'Meta 80%',
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--color-status-warn)',
              }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-hairline)' }}
              formatter={(value) => [`${value}%`, 'Prontidão']}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-hairline)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="percent"
              stroke="var(--color-brand-blue)"
              strokeWidth={2.5}
              fill="url(#evolucao-fill)"
              dot={{ r: 3.5, fill: 'var(--color-brand-blue)', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-ink-muted mt-3 text-xs">
        Prontidão geral (Excelência + Compliance) por rodada, contada por critério (conforme = 1,
        parcial = 0,5). A linha tracejada é a meta de 80%. Não é a pontuação oficial da Nestlé.
      </p>
    </section>
  )
}
