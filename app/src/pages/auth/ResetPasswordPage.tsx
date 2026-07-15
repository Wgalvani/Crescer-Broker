import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/features/auth/errors'
import { useSession } from '@/features/auth/hooks'
import { BrandSplash } from '@/components/brand/BrandSplash'

/*
 * Politica de senha (PRD 6.11). O minimo aplicado no cliente e conveniencia de
 * UX; a regra que vale e a configurada em Supabase > Auth > Password policy,
 * que o cliente nao pode burlar.
 */
const schema = z
  .object({
    password: z
      .string()
      .min(10, 'A senha deve ter ao menos 10 caracteres')
      .regex(/[A-Z]/, 'Inclua ao menos uma letra maiuscula')
      .regex(/[a-z]/, 'Inclua ao menos uma letra minuscula')
      .regex(/[0-9]/, 'Inclua ao menos um numero'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'As senhas nao conferem',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, loading } = useSession()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (loading) return <BrandSplash />

  // O link do e-mail cria uma sessao de recuperacao ao abrir a pagina
  // (detectSessionInUrl). Sem sessao, o link expirou ou ja foi usado.
  if (!session) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-ink text-xl">Link invalido ou expirado</h1>
        <p className="text-ink-muted mt-2 text-sm">
          Solicite um novo link de redefinicao de senha.
        </p>
        <button
          type="button"
          onClick={() => navigate('/esqueci-senha')}
          className="bg-brand-lime text-ink hover:bg-brand-lime-light mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-bold"
        >
          Solicitar novo link
        </button>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      setFormError(translateAuthError(error.message))
      return
    }

    await supabase.auth.signOut()
    navigate('/login?motivo=senha-alterada', { replace: true })
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl">
      <h1 className="text-ink text-xl">Definir nova senha</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="text-ink block text-sm font-medium">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'senha-erro' : undefined}
            className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            {...register('password')}
          />
          {errors.password && (
            <p id="senha-erro" className="text-status-risk mt-1 text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="text-ink block text-sm font-medium">
            Confirmar senha
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'confirm-erro' : undefined}
            className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            {...register('confirm')}
          />
          {errors.confirm && (
            <p id="confirm-erro" className="text-status-risk mt-1 text-xs">
              {errors.confirm.message}
            </p>
          )}
        </div>

        {formError && (
          <p
            role="alert"
            aria-live="polite"
            className="text-status-risk rounded-lg bg-red-50 px-3 py-2 text-sm"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-lime text-ink hover:bg-brand-lime-light w-full rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
