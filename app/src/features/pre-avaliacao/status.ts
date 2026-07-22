/*
 * Metadados dos estados de conformidade e o calculo de prontidao.
 *
 * A prontidao e por CONTAGEM de criterios, nao por pontos: os pontos do livro
 * estao incompletos (max_points nulo, somas nao fecham -- ver a Skill do livro).
 * Ponderar por pontos aqui daria um numero que parece oficial e esta errado.
 */
import type { ConformityStatus, CriterionWithEntry } from '@/features/pre-avaliacao/types'

type StatusMeta = {
  label: string
  /** Peso na prontidao. null = fora do denominador (nao se aplica). */
  weight: number | null
  /** Classe do semaforo (bolinha). Cores de status, nunca a marca. */
  dotClass: string
  /** Classe do chip/selecao ativa. */
  activeClass: string
}

/*
 * Ordem em que os estados aparecem no seletor. 'nao_avaliado' primeiro porque e
 * o default (pendente). As cores seguem o index.css: status-ok/warn/risk para o
 * semaforo real; neutro para pendente e nao-se-aplica.
 */
export const CONFORMITY_ORDER: ConformityStatus[] = [
  'nao_avaliado',
  'conforme',
  'parcial',
  'nao_conforme',
  'nao_aplicavel',
]

export const CONFORMITY_META: Record<ConformityStatus, StatusMeta> = {
  nao_avaliado: {
    label: 'Não avaliado',
    weight: 0,
    dotClass: 'bg-hairline',
    activeClass: 'bg-surface text-ink border-hairline',
  },
  conforme: {
    label: 'Conforme',
    weight: 1,
    dotClass: 'bg-status-ok',
    activeClass: 'bg-status-ok/10 text-status-ok border-status-ok/30',
  },
  parcial: {
    label: 'Parcial',
    weight: 0.5,
    dotClass: 'bg-status-warn',
    activeClass: 'bg-status-warn/10 text-status-warn border-status-warn/30',
  },
  nao_conforme: {
    label: 'Não conforme',
    weight: 0,
    dotClass: 'bg-status-risk',
    activeClass: 'bg-status-risk/10 text-status-risk border-status-risk/30',
  },
  nao_aplicavel: {
    label: 'Não se aplica',
    weight: null,
    dotClass: 'bg-ink-muted',
    activeClass: 'bg-ink-muted/10 text-ink-muted border-ink-muted/30',
  },
}

export type Readiness = {
  /** Criterios que contam no denominador (exclui 'nao se aplica'). */
  applicable: number
  /** Criterios ja avaliados (qualquer estado != nao_avaliado e != nao_aplicavel). */
  assessed: number
  /** Total de criterios do escopo, incluindo os que nao se aplicam. */
  total: number
  /** 0-100. Soma dos pesos / applicable. */
  percent: number
}

/**
 * Prontidao de um conjunto de criterios. 'nao_avaliado' conta no denominador
 * (pendente e nao-pronto); 'nao_aplicavel' fica de fora. Se nada se aplica,
 * percent = 0 e applicable = 0 -- a UI mostra "0 de 0" em vez de dividir por zero.
 */
export function computeReadiness(items: CriterionWithEntry[]): Readiness {
  let applicable = 0
  let assessed = 0
  let weightSum = 0

  for (const { entry } of items) {
    const status: ConformityStatus = entry?.status ?? 'nao_avaliado'
    const meta = CONFORMITY_META[status]
    if (meta.weight === null) continue // nao se aplica: fora do denominador
    applicable += 1
    weightSum += meta.weight
    if (status !== 'nao_avaliado') assessed += 1
  }

  return {
    applicable,
    assessed,
    total: items.length,
    percent: applicable === 0 ? 0 : Math.round((weightSum / applicable) * 100),
  }
}
