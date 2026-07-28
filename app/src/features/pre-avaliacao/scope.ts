/*
 * Recorte por setor das telas de pre-avaliacao.
 *
 * Espelha na UI o que a RLS ja faz nos dados: cada perfil enxerga so os criterios
 * do seu department (`criteria.responsible_department`); quem tem
 * scoring.read_all/admin ve tudo. Sem isto, um usuario via os CARDS de secoes de
 * outros setores (mesmo sem poder editar), o que confunde.
 */
import type { Enums } from '@/types/database.types'
import type { SectionGroup } from '@/features/pre-avaliacao/types'

type Department = Enums<'department'>

/**
 * Mantem apenas as secoes/criterios do setor informado. `seesAll` (admin ou
 * scoring.read_all) devolve tudo intacto. Sem department e sem seesAll, nao ha
 * escopo -> lista vazia. Secoes que ficam sem nenhum criterio somem.
 */
export function filterSectionsByDepartment(
  sections: SectionGroup[],
  department: Department | null,
  seesAll: boolean
): SectionGroup[] {
  if (seesAll) return sections
  if (!department) return []
  return sections
    .map((group) => ({
      ...group,
      items: group.items.filter((i) => i.criterion.responsible_department === department),
    }))
    .filter((group) => group.items.length > 0)
}
