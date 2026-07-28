import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { SectionReadiness } from '@/features/pre-avaliacao/types'

type Props = {
  sections: SectionReadiness[]
  currentLabel: string
  compareLabel?: string | null
}

/*
 * Radar de acompanhamento: um eixo por secao do livro, valor = prontidao (0-100).
 * Quanto mais o poligono "afunda" numa secao, maior o gap ali. Dois poligonos
 * sobrepostos (rodada atual x comparacao) mostram se o gap esta fechando.
 *
 * O eixo mostra so o numero da secao (2.1, 2.8, 2.11) para nao poluir; o nome do
 * modulo aparece no tooltip e na lista de gaps ao lado.
 */
export function GapsRadar({ sections, currentLabel, compareLabel }: Props) {
  const hasCompare = sections.some((s) => s.comparePercent !== null)
  const data = sections.map((s) => ({
    section: s.section,
    atual: s.percent,
    anterior: s.comparePercent ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--color-hairline)" />
        <PolarAngleAxis
          dataKey="section"
          tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          angle={90}
          tick={{ fontSize: 10, fill: 'var(--color-ink-muted)' }}
        />
        {hasCompare && (
          <Radar
            name={compareLabel ?? 'Comparação'}
            dataKey="anterior"
            stroke="#9aa4b2"
            fill="#9aa4b2"
            fillOpacity={0.12}
          />
        )}
        <Radar
          name={currentLabel}
          dataKey="atual"
          stroke="var(--color-brand-blue)"
          fill="var(--color-brand-blue)"
          fillOpacity={0.28}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [`${value}%`, String(name)]}
          labelFormatter={(label) => {
            const key = String(label)
            const s = sections.find((x) => x.section === key)
            return s ? `${s.section} · ${s.module}` : key
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
