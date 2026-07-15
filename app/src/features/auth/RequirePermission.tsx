import { Navigate, Outlet } from 'react-router-dom'
import { BrandSplash } from '@/components/brand/BrandSplash'
import { useCurrentUser } from '@/features/auth/hooks'

/**
 * Restringe uma rota a quem tem a permissao. O administrador passa sempre
 * (PRD 6.11: acesso irrestrito).
 */
export function RequirePermission({ perm }: { perm: string }) {
  const { data: currentUser, isLoading } = useCurrentUser()

  if (isLoading) return <BrandSplash />

  const isAdmin = currentUser?.roles.some((r) => r.key === 'admin') ?? false
  const allowed = isAdmin || (currentUser?.permissions.has(perm) ?? false)

  return allowed ? <Outlet /> : <Navigate to="/403" replace />
}
