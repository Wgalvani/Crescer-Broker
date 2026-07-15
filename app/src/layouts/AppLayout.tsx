import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, initials } from '@/lib/utils'
import { NAV_ITEMS } from '@/config/nav'
import { Wordmark } from '@/components/brand/BrandLogo'
import { useCurrentUser } from '@/features/auth/hooks'

export function AppLayout() {
  const { data: currentUser } = useCurrentUser()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = currentUser?.roles.some((r) => r.key === 'admin') ?? false
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.perm || isAdmin || currentUser?.permissions.has(item.perm)
  )

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh">
      {/* Requisito WCAG AA (PRD secao 7): pular a navegacao pelo teclado. */}
      <a
        href="#conteudo"
        className="text-ink sr-only rounded-md bg-white px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
      >
        Pular para o conteudo
      </a>

      <header className="bg-brand-deep-green sticky top-0 z-50 h-16">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-md">
            <Wordmark />
            <span className="hidden text-xs tracking-wide text-white/60 sm:inline">
              Auditoria
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Seletor de organizacao: somente leitura na Fundacao. Vira um
                seletor de verdade quando houver mais de uma filial ativa. */}
            {currentUser?.profile.organization && (
              <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 md:inline">
                {currentUser.profile.organization.name}
              </span>
            )}

            <button
              type="button"
              disabled
              title="Notificacoes (disponivel em fase futura)"
              className="grid size-9 place-items-center rounded-md text-white/40"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span className="sr-only">Notificacoes</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md py-1 pr-2 pl-1 text-white hover:bg-white/10"
              >
                <span className="bg-brand-lime text-ink grid size-8 place-items-center rounded-full text-xs font-bold">
                  {initials(currentUser?.profile.full_name ?? '')}
                </span>
                <span className="hidden text-sm sm:inline">
                  {currentUser?.profile.full_name}
                </span>
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="border-hairline absolute right-0 mt-2 w-60 rounded-xl border bg-white p-1 shadow-lg"
                >
                  <div className="border-hairline border-b px-3 py-2">
                    <p className="text-ink truncate text-sm font-semibold">
                      {currentUser?.profile.full_name}
                    </p>
                    <p className="text-ink-muted truncate text-xs">
                      {currentUser?.profile.email}
                    </p>
                    {currentUser?.roles.length ? (
                      <p className="text-brand-blue mt-1 text-xs">
                        {currentUser.roles.map((r) => r.name).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="text-ink flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <nav aria-label="Modulos" className="hidden w-56 shrink-0 md:block">
          <ul className="space-y-1">
            {visibleNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-brand-blue text-white'
                        : 'text-ink hover:bg-white'
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="conteudo" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
