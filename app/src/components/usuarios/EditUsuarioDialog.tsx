import { useState } from 'react'
import { X } from 'lucide-react'
import { useUpdateUsuario } from '@/features/usuarios/hooks'
import type { Department, ProfileStatus, UsuarioRow } from '@/features/usuarios/types'
import { DepartmentSelect } from '@/components/usuarios/DepartmentSelect'
import { RoleMultiSelect } from '@/components/usuarios/RoleMultiSelect'

type Props = {
  usuario: UsuarioRow
  onClose: () => void
}

/*
 * Edicao de um usuario existente. Modal feito a mao (o projeto nao usa lib de
 * componentes), no mesmo estilo do dropdown do AppLayout. Senha em branco = nao
 * altera. Papeis sao substituidos pelo conjunto marcado.
 */
export function EditUsuarioDialog({ usuario, onClose }: Props) {
  const update = useUpdateUsuario()
  const [fullName, setFullName] = useState(usuario.full_name)
  const [department, setDepartment] = useState<Department | ''>(usuario.department ?? '')
  const [status, setStatus] = useState<ProfileStatus>(usuario.status)
  const [roleKeys, setRoleKeys] = useState<string[]>(usuario.roles.map((r) => r.key))
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    if (!fullName.trim()) {
      setError('Informe o nome completo.')
      return
    }
    if (password && password.length < 8) {
      setError('A nova senha deve ter ao menos 8 caracteres.')
      return
    }
    try {
      await update.mutateAsync({
        id: usuario.id,
        full_name: fullName.trim(),
        department: department || null,
        status,
        role_keys: roleKeys,
        ...(password ? { password } : {}),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${usuario.full_name}`}
    >
      <div className="border-hairline my-8 w-full max-w-lg rounded-xl border bg-white shadow-lg">
        <header className="border-hairline flex items-center justify-between border-b px-5 py-3">
          <div className="min-w-0">
            <h2 className="text-ink truncate text-lg">Editar usuário</h2>
            <p className="text-ink-muted truncate text-xs">{usuario.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:bg-surface rounded-md p-1"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="edit-nome" className="text-ink block text-sm font-medium">
              Nome completo
            </label>
            <input
              id="edit-nome"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-setor" className="text-ink block text-sm font-medium">
                Setor
              </label>
              <DepartmentSelect id="edit-setor" value={department} onChange={setDepartment} />
            </div>
            <div>
              <label htmlFor="edit-status" className="text-ink block text-sm font-medium">
                Situação
              </label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProfileStatus)}
                className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <span className="text-ink block text-sm font-medium">Perfis (papéis)</span>
            <RoleMultiSelect selected={roleKeys} onChange={setRoleKeys} />
          </div>

          <div>
            <label htmlFor="edit-senha" className="text-ink block text-sm font-medium">
              Nova senha <span className="text-ink-muted">(deixe em branco para manter)</span>
            </label>
            <input
              id="edit-senha"
              type="text"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-status-risk rounded-lg bg-red-50 px-3 py-2 text-sm">
              {error}
            </p>
          )}
        </div>

        <footer className="border-hairline flex justify-end gap-3 border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="border-hairline text-ink hover:bg-surface rounded-lg border px-3 py-1.5 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={update.isPending}
            className="bg-brand-lime text-ink hover:bg-brand-lime-light rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            {update.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </div>
    </div>
  )
}
