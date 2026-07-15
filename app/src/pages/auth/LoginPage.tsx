import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/features/auth/errors'
import { useSession } from '@/features/auth/hooks'
import { BrandSplash } from '@/components/brand/BrandSplash'

/*
 * Nao restringimos o dominio do e-mail aqui. E tentador exigir
 * @grupoarantes.emp.br, mas o PRD preve SSO futuro e nao afirma dominio unico;
 * o portao real e o convite feito pelo admin e o RBAC, nao o formato do campo.
 */
const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail invalido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

const REASONS: Record<string, string> = {
  inativo: 'Seu acesso foi inativado. Procure a equipe de TI.',
  'perfil-indisponivel':
    'Nao foi possivel carregar seu perfil. Procure a equipe de TI.',
  'senha-alterada': 'Senha alterada com sucesso. Entre com a nova senha.',
}

export function LoginPage() {
  const { session, loading } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const reason = searchParams.get('motivo')
  const notice = reason ? REASONS[reason] : null

  if (loading) return <BrandSplash />

  if (session) {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from?.pathname ?? '/dashboard'} replace />
  }

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setFormError(translateAuthError(error.message))
      return
    }

    const from = (location.state as { from?: Location } | null)?.from
    navigate(from?.pathname ?? '/dashboard', { replace: true })
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl">
      <h1 className="text-ink text-xl">Acessar a plataforma</h1>
      <p className="text-ink-muted mt-1 text-sm">
        Use seu e-mail corporativo.
      </p>

      {notice && (
        <p className="border-hairline bg-surface text-ink mt-4 rounded-lg border px-3 py-2 text-sm">
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="text-ink block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-erro' : undefined}
            className="border-hairline focus:border-brand-blue mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-erro" className="text-status-risk mt-1 text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-ink block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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

        {formError && (
          <p
            role="alert"
            aria-live="polite"
            className="text-status-risk rounded-lg bg-red-50 px-3 py-2 text-sm"
          >
            {formError}
          </p>
        )}

        {/* Lime como preenchimento com texto ink por cima: lime como cor de
            texto reprovaria o contraste AA exigido pelo PRD secao 7. */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-lime text-ink hover:bg-brand-lime-light w-full rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <Link
        to="/esqueci-senha"
        className="text-brand-blue mt-4 inline-block text-sm hover:underline"
      >
        Esqueci minha senha
      </Link>
    </div>
  )
}
