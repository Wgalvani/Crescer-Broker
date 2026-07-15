import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { translateAuthError } from '@/features/auth/errors'

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail invalido'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    // Mostramos sucesso mesmo quando o e-mail nao existe: a tela nao pode
    // servir para descobrir quem tem conta.
    if (error && !/user not found/i.test(error.message)) {
      setFormError(translateAuthError(error.message))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-ink text-xl">Verifique seu e-mail</h1>
        <p className="text-ink-muted mt-2 text-sm">
          Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.
          O link vale por tempo limitado.
        </p>
        <Link to="/login" className="text-brand-blue mt-6 inline-block text-sm hover:underline">
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-2xl">
      <h1 className="text-ink text-xl">Redefinir senha</h1>
      <p className="text-ink-muted mt-1 text-sm">
        Enviaremos um link para o seu e-mail corporativo.
      </p>

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
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>

      <Link to="/login" className="text-brand-blue mt-4 inline-block text-sm hover:underline">
        Voltar ao login
      </Link>
    </div>
  )
}
