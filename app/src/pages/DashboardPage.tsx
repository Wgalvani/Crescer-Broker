import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/features/auth/hooks'

/*
 * Placeholder da Fundacao.
 *
 * O dashboard executivo de verdade (semaforo por capitulo/modulo/criterio,
 * simulacao de pontuacao, linha do tempo de prazos) e a Fase 1 do roadmap
 * (PRD 6.1 e 6.7). O que esta aqui prova que a fundacao funciona ponta a
 * ponta: sessao valida, RLS deixando ler, catalogo semeado.
 */
type CriteriaRow = {
  chapter: string
  max_points: number | null
  points_pending_review: boolean
}

const CHAPTER_LABEL: Record<string, string> = {
  performance: 'Capitulo I - Performance',
  excelencia_operacional: 'Capitulo II - Excelencia Operacional',
  compliance: 'Itens de Compliance',
}

export function DashboardPage() {
  const { data: currentUser } = useCurrentUser()

  const { data: criteria, isLoading } = useQuery({
    queryKey: ['criteria-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('criteria')
        .select('chapter, max_points, points_pending_review')
      if (error) throw error
      return data as CriteriaRow[]
    },
  })

  const byChapter = new Map<
    string,
    { count: number; points: number; pending: number }
  >()
  for (const row of criteria ?? []) {
    const acc = byChapter.get(row.chapter) ?? { count: 0, points: 0, pending: 0 }
    acc.count += 1
    if (row.points_pending_review) acc.pending += 1
    else acc.points += Number(row.max_points ?? 0)
    byChapter.set(row.chapter, acc)
  }

  const totalPending = [...byChapter.values()].reduce((s, c) => s + c.pending, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl">
          Ola, {currentUser?.profile.full_name.split(' ')[0]}
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          Programa CRESCER+BROKERS 2026 - Livro oficial v3
        </p>
      </div>

      <section
        aria-labelledby="catalogo-titulo"
        className="border-hairline rounded-xl border bg-white p-6"
      >
        <h2 id="catalogo-titulo" className="text-ink text-lg">
          Catalogo de criterios
        </h2>
        <p className="text-ink-muted mt-1 text-sm">
          Regras carregadas do livro oficial. A apuracao entra nas proximas fases.
        </p>

        {isLoading ? (
          <p className="text-ink-muted mt-4 text-sm">Carregando...</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {[...byChapter.entries()].map(([chapter, acc]) => (
              <li key={chapter} className="bg-surface rounded-lg p-4">
                <p className="text-ink-muted text-xs">
                  {CHAPTER_LABEL[chapter] ?? chapter}
                </p>
                <p className="text-ink mt-2 font-display text-2xl font-bold">
                  {acc.points.toLocaleString('pt-BR')}
                  <span className="text-ink-muted ml-1 text-sm font-normal">pts</span>
                </p>
                <p className="text-ink-muted mt-1 text-xs">
                  {acc.count} criterios
                  {acc.pending > 0 && ` · ${acc.pending} sem pontuacao definida`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {totalPending > 0 && (
        <section className="border-status-warn/30 rounded-xl border bg-amber-50 p-4">
          <h2 className="text-status-warn text-sm font-bold">
            {totalPending} criterios sem pontuacao definida
          </h2>
          <p className="text-ink mt-1 text-sm">
            O PRD nao informa os pontos desses criterios, e as somas dos capitulos
            nao fecham 1.600/400. Os valores precisam ser conferidos no livro
            oficial em PDF antes de qualquer calculo de pontuacao. Nenhum numero
            foi estimado.
          </p>
        </section>
      )}
    </div>
  )
}
