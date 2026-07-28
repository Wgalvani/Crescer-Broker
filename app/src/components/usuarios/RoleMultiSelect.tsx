import { useRolesCatalog } from '@/features/usuarios/hooks'
import { cn } from '@/lib/utils'

type Props = {
  selected: string[]
  onChange: (roleKeys: string[]) => void
}

/*
 * Selecao de perfis (papeis). Cada papel ja carrega suas permissoes no banco --
 * aqui so se ATRIBUI. O papel 'admin' aparece, mas a Edge Function recusa concede-lo
 * a quem nao e admin, entao a regra fica no servidor, nao na UI.
 */
export function RoleMultiSelect({ selected, onChange }: Props) {
  const { data: roles, isLoading } = useRolesCatalog()
  const set = new Set(selected)

  function toggle(key: string) {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange([...next])
  }

  if (isLoading) {
    return <p className="text-ink-muted mt-1 text-sm">Carregando perfis...</p>
  }

  return (
    <ul className="mt-1 grid gap-2 sm:grid-cols-2">
      {(roles ?? []).map((role) => {
        const active = set.has(role.key)
        return (
          <li key={role.id}>
            <label
              className={cn(
                'flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                active
                  ? 'border-brand-blue bg-brand-blue/5'
                  : 'border-hairline hover:bg-surface'
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(role.key)}
                className="accent-brand-blue mt-0.5"
              />
              <span className="min-w-0">
                <span className="text-ink block font-medium">{role.name}</span>
                {role.description && (
                  <span className="text-ink-muted block text-xs">{role.description}</span>
                )}
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
