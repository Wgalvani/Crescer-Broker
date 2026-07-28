import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCreateUsuario, useUsuarios } from '@/features/usuarios/hooks'
import type { Department } from '@/features/usuarios/types'
import { DepartmentSelect } from '@/components/usuarios/DepartmentSelect'
import { RoleMultiSelect } from '@/components/usuarios/RoleMultiSelect'
import { UsuarioRow } from '@/components/usuarios/UsuarioRow'

const schema = z.object({
  full_name: z.string().min(1, 'Informe o nome completo'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
})
type FormValues = z.infer<typeof schema>

export function UsuariosPage() {
  const { data: currentUser } = useCurrentUser()
  const { data: usuarios, isLoading } = useUsuarios()
  const createUsuario = useCreateUsuario()

  const [department, setDepartment] = useState<Department | ''>('')
  const [roleKeys, setRoleKeys] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)

  const isAdmin = currentUser?.roles.some((r) => r.key === 'admin') ?? false
  const canManage = isAdmin || (currentUser?.permissions.has('users.manage') ?? false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    setFormOk(null)
    try {
      await createUsuario.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        department: department || null,
        role_keys: roleKeys,
      })
      reset()
      setDepartment('')
      setRoleKeys([])
      setFormOk(`Usuário ${values.email} criado.`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível criar o usuário.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl">Usuários e acessos</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Cadastre as pessoas do Broker, defina o setor e o perfil (papel) de cada uma. O perfil
          determina o que a pessoa vê e edita na plataforma. Excluir significa{' '}
          <strong>inativar</strong> — o histórico é preservado.
        </p>
      </div>

      {canManage && (
        <section className="border-hairline rounded-xl border bg-white p-6">
          <h2 className="text-ink text-lg">Novo usuário</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="text-ink block text-sm font-medium">
                  Nome completo
                </label>
                <input
                  id="full_name"
                  type="text"
                  aria-invalid={Boolean(errors.full_name)}
                  className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-status-risk mt-1 text-xs">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="text-ink block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.email)}
                  className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-status-risk mt-1 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-ink block text-sm font-medium">
                  Senha inicial
                </label>
                <input
                  id="password"
                  type="text"
                  autoComplete="off"
                  placeholder="Mínimo 8 caracteres"
                  aria-invalid={Boolean(errors.password)}
                  className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-status-risk mt-1 text-xs">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="new-setor" className="text-ink block text-sm font-medium">
                  Setor
                </label>
                <DepartmentSelect id="new-setor" value={department} onChange={setDepartment} />
              </div>
            </div>

            <div>
              <span className="text-ink block text-sm font-medium">Perfis (papéis)</span>
              <p className="text-ink-muted text-xs">
                Um ou mais perfis por pessoa. Cada perfil já traz as permissões do seu setor.
              </p>
              <RoleMultiSelect selected={roleKeys} onChange={setRoleKeys} />
            </div>

            {formError && (
              <p role="alert" className="text-status-risk rounded-lg bg-red-50 px-3 py-2 text-sm">
                {formError}
              </p>
            )}
            {formOk && (
              <p className="text-status-ok bg-status-ok/10 rounded-lg px-3 py-2 text-sm">{formOk}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-lime text-ink hover:bg-brand-lime-light rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {isSubmitting ? 'Criando...' : 'Criar usuário'}
            </button>
          </form>
        </section>
      )}

      <section className="border-hairline rounded-xl border bg-white p-6">
        <h2 className="text-ink text-lg">Usuários</h2>
        {isLoading ? (
          <p className="text-ink-muted mt-4 text-sm">Carregando...</p>
        ) : !usuarios || usuarios.length === 0 ? (
          <p className="text-ink-muted mt-4 text-sm">Nenhum usuário para exibir.</p>
        ) : (
          <ul className="mt-2 divide-hairline divide-y">
            {usuarios.map((usuario) => (
              <UsuarioRow key={usuario.id} usuario={usuario} canManage={canManage} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
