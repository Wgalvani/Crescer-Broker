import { LayoutDashboard, type LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** Permissao exigida. Ausente = visivel a qualquer usuario autenticado. */
  perm?: string
}

/*
 * Navegacao lateral. Filtrada por permissao no AppLayout, de modo que cada
 * papel so ve os modulos do seu departamento (PRD secao 4, menor privilegio).
 *
 * Na Fundacao so existe o Dashboard; os demais modulos entram conforme o
 * roadmap (PRD secao 11).
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
]
