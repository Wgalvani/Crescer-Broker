import { useState } from 'react'
import { useInactivateUsuario } from '@/features/usuarios/hooks'
import type { UsuarioRow as Usuario } from '@/features/usuarios/types'
import { departmentLabel } from '@/features/usuarios/types'
import { EditUsuarioDialog } from '@/components/usuarios/EditUsuarioDialog'

type Props = {
  usuario: Usuario
  canManage: boolean
}

export function UsuarioRow({ usuario, canManage }: Props) {
  const [editing, setEditing] = useState(false)
  const inactivate = useInactivateUsuario()
  const [error, setError] = useState<string | null>(null)

  async function handleInactivate() {
    setError(null)
    if (!window.confirm(`Inativar ${usuario.full_name}? A pessoa perde o acesso imediatamente.`)) {
      return
    }
    try {
      await inactivate.mutateAsync(usuario.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível inativar.')
    }
  }

  const isAtivo = usuario.status === 'ativo'

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-ink text-sm font-medium">
          {usuario.full_name}
          <span
            className={
              isAtivo
                ? 'bg-status-ok/10 text-status-ok ml-2 rounded-full px-2 py-0.5 text-xs font-normal'
                : 'bg-ink/5 text-ink-muted ml-2 rounded-full px-2 py-0.5 text-xs font-normal'
            }
          >
            {isAtivo ? 'Ativo' : 'Inativo'}
          </span>
        </p>
        <p className="text-ink-muted mt-0.5 text-xs">
          {usuario.email} · {departmentLabel(usuario.department)}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {usuario.roles.length === 0 ? (
            <span className="text-ink-muted text-xs">Sem perfil atribuído</span>
          ) : (
            usuario.roles.map((r) => (
              <span
                key={r.key}
                className="bg-brand-blue/8 text-brand-blue rounded-full px-2 py-0.5 text-xs"
              >
                {r.name}
              </span>
            ))
          )}
        </div>
        {error && <p className="text-status-risk mt-1 text-xs">{error}</p>}
      </div>

      {canManage && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border-hairline text-ink hover:bg-surface rounded-lg border px-3 py-1.5 text-sm"
          >
            Editar
          </button>
          {isAtivo && (
            <button
              type="button"
              onClick={() => void handleInactivate()}
              disabled={inactivate.isPending}
              className="text-status-risk hover:bg-status-risk/5 rounded-lg px-3 py-1.5 text-sm disabled:opacity-60"
            >
              Inativar
            </button>
          )}
        </div>
      )}

      {editing && <EditUsuarioDialog usuario={usuario} onClose={() => setEditing(false)} />}
    </li>
  )
}
