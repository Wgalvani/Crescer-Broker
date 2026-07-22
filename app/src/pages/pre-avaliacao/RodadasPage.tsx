import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useActiveProgramVersion,
  useCloseRodada,
  useCreateRodada,
  useRodadas,
} from '@/features/pre-avaliacao/hooks'
import { useCurrentUser } from '@/features/auth/hooks'

const schema = z.object({
  label: z.string().min(1, 'Dê um nome à rodada (ex.: 1º semestre 2026)'),
  targetAuditOn: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function RodadasPage() {
  const { data: currentUser } = useCurrentUser()
  const { data: rodadas, isLoading } = useRodadas()
  const { data: programVersion } = useActiveProgramVersion()
  const createRodada = useCreateRodada()
  const closeRodada = useCloseRodada()
  const [formError, setFormError] = useState<string | null>(null)

  const isAdmin = currentUser?.roles.some((r) => r.key === 'admin') ?? false
  const canWrite = isAdmin || (currentUser?.permissions.has('scoring.write') ?? false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    if (!programVersion) {
      setFormError('Nenhuma versão do livro está ativa. Fale com a equipe de TI.')
      return
    }
    try {
      await createRodada.mutateAsync({
        label: values.label,
        programVersionId: programVersion.id,
        targetAuditOn: values.targetAuditOn || null,
      })
      reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível criar a rodada.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl">Rodadas de pré-avaliação</h1>
        <p className="text-ink-muted mt-1 text-sm">
          Cada rodada é um retrato da prontidão numa data. Feche-a para congelar e comparar
          com a próxima.
        </p>
      </div>

      {canWrite && (
        <section className="border-hairline rounded-xl border bg-white p-6">
          <h2 className="text-ink text-lg">Nova rodada</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="label" className="text-ink block text-sm font-medium">
                Nome da rodada
              </label>
              <input
                id="label"
                type="text"
                placeholder="1º semestre 2026"
                aria-invalid={Boolean(errors.label)}
                aria-describedby={errors.label ? 'label-erro' : undefined}
                className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                {...register('label')}
              />
              {errors.label && (
                <p id="label-erro" className="text-status-risk mt-1 text-xs">
                  {errors.label.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="targetAuditOn" className="text-ink block text-sm font-medium">
                Visita prevista da Nestlé <span className="text-ink-muted">(opcional)</span>
              </label>
              <input
                id="targetAuditOn"
                type="date"
                className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                {...register('targetAuditOn')}
              />
            </div>

            {formError && (
              <p role="alert" className="text-status-risk rounded-lg bg-red-50 px-3 py-2 text-sm">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-lime text-ink hover:bg-brand-lime-light rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {isSubmitting ? 'Criando...' : 'Abrir rodada'}
            </button>
          </form>
        </section>
      )}

      <section className="border-hairline rounded-xl border bg-white p-6">
        <h2 className="text-ink text-lg">Rodadas</h2>
        {isLoading ? (
          <p className="text-ink-muted mt-4 text-sm">Carregando...</p>
        ) : !rodadas || rodadas.length === 0 ? (
          <p className="text-ink-muted mt-4 text-sm">Nenhuma rodada ainda.</p>
        ) : (
          <ul className="mt-4 divide-hairline divide-y">
            {rodadas.map((rodada) => (
              <li key={rodada.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-ink text-sm font-medium">
                    {rodada.label}
                    <span
                      className={
                        rodada.status === 'aberta'
                          ? 'bg-status-ok/10 text-status-ok ml-2 rounded-full px-2 py-0.5 text-xs font-normal'
                          : 'bg-ink/5 text-ink-muted ml-2 rounded-full px-2 py-0.5 text-xs font-normal'
                      }
                    >
                      {rodada.status === 'aberta' ? 'Aberta' : 'Fechada'}
                    </span>
                  </p>
                  <p className="text-ink-muted mt-0.5 text-xs">
                    Aberta em {rodada.opened_on}
                    {rodada.target_audit_on && ` · visita prevista ${rodada.target_audit_on}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {rodada.status === 'aberta' && (
                    <>
                      <Link
                        to="/pre-avaliacao/excelencia"
                        className="text-brand-blue text-sm hover:underline"
                      >
                        Preencher
                      </Link>
                      {canWrite && (
                        <button
                          type="button"
                          disabled={closeRodada.isPending}
                          onClick={() => void closeRodada.mutateAsync(rodada.id)}
                          className="border-hairline text-ink hover:bg-surface rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
                        >
                          Fechar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
