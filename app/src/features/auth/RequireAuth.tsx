import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BrandSplash } from '@/components/brand/BrandSplash'
import { useCurrentUser, useSession } from '@/features/auth/hooks'

/*
 * Guard de rota autenticada.
 *
 * Nao substitui a RLS: o guard e conveniencia de navegacao e pode ser burlado
 * por qualquer um com o devtools aberto. Quem realmente protege o dado e a
 * policy no banco.
 */
export function RequireAuth() {
  const { session, loading } = useSession()
  const location = useLocation()
  const { data: currentUser, isLoading: loadingUser, isError } = useCurrentUser()

  const inactive = currentUser?.profile.status === 'inativo'

  useEffect(() => {
    // Um profile inativado perde acesso na proxima navegacao, sem esperar o
    // refresh do token.
    if (inactive) void supabase.auth.signOut()
  }, [inactive])

  if (loading) return <BrandSplash />

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (loadingUser) return <BrandSplash />

  // Sessao valida mas sem profile legivel: o trigger de provisionamento falhou
  // ou a RLS barrou. Deixar entrar mostraria uma tela vazia sem explicacao.
  if (isError || !currentUser) {
    return <Navigate to="/login?motivo=perfil-indisponivel" replace />
  }

  if (inactive) {
    return <Navigate to="/login?motivo=inativo" replace />
  }

  return <Outlet />
}
