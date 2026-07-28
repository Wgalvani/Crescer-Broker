import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGapsRadar, useRodadas } from '@/features/pre-avaliacao/hooks'
import { GapsRadar } from '@/components/pre-avaliacao/GapsRadar'
import { GapList } from '@/components/pre-avaliacao/GapList'

type Props = {
  /** No Dashboard: sem seletores nem lista, so o radar + link para o detalhe. */
  compact?: boolean
}

/*
 * Radar de Gaps completo: escolhe a rodada atual e a de comparacao, desenha o
 * radar por secao e lista os gaps por setor responsavel. No modo compacto vira
 * um card de teaser para o Dashboard.
 */
export function GapsRadarSection({ compact = false }: Props) {
  const { data: rodadas, isLoading } = useRodadas()

  // rodadas vem da mais recente para a mais antiga.
  const [currentId, setCurrentId] = useState<string | undefined>(undefined)
  const [compareId, setCompareId] = useState<string | undefined>(undefined)

  const resolvedCurrent = currentId ?? rodadas?.[0]?.id
  // Comparacao padrao: a rodada imediatamente anterior a atual, se houver.
  const defaultCompare = useMemo(() => {
    if (!rodadas || !resolvedCurrent) return undefined
    const idx = rodadas.findIndex((r) => r.id === resolvedCurrent)
    return rodadas[idx + 1]?.id
  }, [rodadas, resolvedCurrent])
  const resolvedCompare = compareId === undefined ? defaultCompare : compareId || undefined

  const { data, isLoading: loadingRadar } = useGapsRadar(resolvedCurrent, resolvedCompare)

  const currentRound = rodadas?.find((r) => r.id === resolvedCurrent)
  const compareRound = rodadas?.find((r) => r.id === resolvedCompare)

  if (isLoading) {
    return (
      <section className="border-hairline rounded-xl border bg-white p-6">
        <p className="text-ink-muted text-sm">Carregando radar...</p>
      </section>
    )
  }

  if (!rodadas || rodadas.length === 0) {
    if (compact) return null
    return (
      <section className="border-hairline rounded-xl border bg-white p-6">
        <h2 className="text-ink text-lg">Radar de Gaps</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Abra e preencha uma rodada de pré-avaliação para ver o radar de lacunas por setor.
        </p>
        <Link
          to="/pre-avaliacao/rodadas"
          className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold"
        >
          Gerenciar rodadas
        </Link>
      </section>
    )
  }

  const sections = data?.sections ?? []
  const gaps = data?.gaps ?? []

  if (compact) {
    return (
      <section className="border-hairline rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-ink text-lg">Radar de Gaps</h2>
          <Link to="/pre-avaliacao" className="text-brand-blue text-sm hover:underline">
            Ver radar completo →
          </Link>
        </div>
        <p className="text-ink-muted mt-1 text-sm">
          Prontidão por seção {currentRound && <>· {currentRound.label}</>}
          {compareRound && <> vs. {compareRound.label}</>}. Quanto mais para o centro, maior o gap.
        </p>
        <div className="mt-4">
          {loadingRadar ? (
            <p className="text-ink-muted text-sm">Carregando radar...</p>
          ) : (
            <GapsRadar
              sections={sections}
              currentLabel={currentRound?.label ?? 'Atual'}
              compareLabel={compareRound?.label ?? null}
            />
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="border-hairline rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-ink text-lg">Radar de Gaps</h2>
          <p className="text-ink-muted mt-1 text-sm">
            Prontidão por seção do livro. Cada eixo é uma seção; quanto mais o polígono se aproxima
            do centro, maior o gap. Compare duas rodadas para ver se as lacunas estão fechando.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="text-ink-muted block text-xs">Rodada</span>
            <select
              value={resolvedCurrent}
              onChange={(e) => {
                setCurrentId(e.target.value)
                setCompareId(undefined) // volta a comparacao ao padrao (anterior)
              }}
              className="border-hairline focus:border-brand-blue mt-1 rounded-lg border bg-white px-3 py-1.5 text-sm outline-none"
            >
              {rodadas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-ink-muted block text-xs">Comparar com</span>
            <select
              value={resolvedCompare ?? ''}
              onChange={(e) => setCompareId(e.target.value)}
              className="border-hairline focus:border-brand-blue mt-1 rounded-lg border bg-white px-3 py-1.5 text-sm outline-none"
            >
              <option value="">Nenhuma</option>
              {rodadas
                .filter((r) => r.id !== resolvedCurrent)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>

      {loadingRadar ? (
        <p className="text-ink-muted mt-6 text-sm">Carregando radar...</p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <GapsRadar
              sections={sections}
              currentLabel={currentRound?.label ?? 'Atual'}
              compareLabel={compareRound?.label ?? null}
            />
          </div>
          <div>
            <h3 className="text-ink mb-3 text-sm font-semibold">
              Gaps por setor
              <span className="text-ink-muted ml-2 text-xs font-normal">
                {gaps.length} {gaps.length === 1 ? 'critério' : 'critérios'} a resolver
              </span>
            </h3>
            <GapList gaps={gaps} />
          </div>
        </div>
      )}

      <p className="text-ink-muted mt-6 text-xs">
        Gap = critério não conforme, não avaliado ou parcial. Prontidão contada por critério
        (conforme = 1, parcial = 0,5); “não se aplica” fica fora da conta. Não é a pontuação
        oficial da Nestlé.
      </p>
    </section>
  )
}
