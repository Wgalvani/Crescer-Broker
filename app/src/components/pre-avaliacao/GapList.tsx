import { CONFORMITY_META } from '@/features/pre-avaliacao/status'
import type { GapItem } from '@/features/pre-avaliacao/types'
import { departmentLabel } from '@/features/usuarios/types'
import { cn } from '@/lib/utils'

/*
 * Lista priorizada dos gaps da rodada, agrupada pelo SETOR responsavel -- o
 * radar diz "onde", esta lista diz "o que" e "quem resolve". O setor amarra com
 * o menu de Usuarios: cada setor tem suas pessoas e perfis.
 */
export function GapList({ gaps }: { gaps: GapItem[] }) {
  if (gaps.length === 0) {
    return (
      <p className="text-ink-muted text-sm">
        Nenhum gap nesta rodada — todos os critérios avaliados estão conformes.
      </p>
    )
  }

  const groups = new Map<string, GapItem[]>()
  for (const gap of gaps) {
    const key = gap.responsibleDepartment ?? '__sem__'
    const list = groups.get(key)
    if (list) list.push(gap)
    else groups.set(key, [gap])
  }

  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="space-y-5">
      {ordered.map(([deptKey, items]) => (
        <div key={deptKey}>
          <h3 className="text-ink flex items-baseline gap-2 text-sm font-semibold">
            {deptKey === '__sem__'
              ? 'Sem setor definido'
              : departmentLabel(items[0]!.responsibleDepartment)}
            <span className="text-ink-muted text-xs font-normal">
              {items.length} {items.length === 1 ? 'gap' : 'gaps'}
            </span>
          </h3>
          <ul className="divide-hairline mt-2 divide-y">
            {items.map((gap) => {
              const meta = CONFORMITY_META[gap.status]
              return (
                <li key={gap.criterionId} className="flex items-start gap-3 py-2">
                  <span
                    className={cn('mt-1.5 size-2 shrink-0 rounded-full', meta.dotClass)}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-ink text-sm">
                      <span className="text-ink-muted font-mono text-xs">{gap.code}</span>{' '}
                      {gap.title}
                    </p>
                    <p className="text-ink-muted text-xs">
                      {gap.module} · {meta.label}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
