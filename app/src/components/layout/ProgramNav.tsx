import { Link, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_TOP, NAV_CHAPTERS } from '@/config/nav'

/*
 * Navegacao lateral do programa. Cada capitulo e um card com espinha colorida,
 * cabecalho com icone e secoes do livro -- o menu espelha as "abas" do livro
 * fisico. Item ativo fica PREENCHIDO na cor do capitulo (realce inconfundivel
 * ao clicar); o numero em badge distingue topicos de numero parecido (2.1 x 2.11).
 *
 * `canSee` filtra por permissao (mesmo criterio do AppLayout). Extraido em
 * componente para poder ser pre-visualizado fora da area logada.
 */
export function ProgramNav({
  canSee,
  className,
}: {
  canSee: (perm?: string) => boolean
  className?: string
}) {
  const location = useLocation()
  const top = NAV_TOP.filter((item) => canSee(item.perm))
  const chapters = NAV_CHAPTERS.filter((chapter) => canSee(chapter.perm))

  return (
    <nav aria-label="Navegacao do programa" className={cn('w-60 shrink-0', className)}>
      <ul className="space-y-1">
        {top.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm'
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

      <div className="mt-5 space-y-3">
        {chapters.map((chapter) => {
          const basePath = chapter.to.split('#')[0]!
          const chapterActive = location.pathname === basePath
          const Icon = chapter.accent.icon
          return (
            <div
              key={chapter.key}
              className={cn(
                'overflow-hidden rounded-xl border border-hairline border-l-4 bg-white shadow-sm',
                chapter.accent.spine
              )}
            >
              <Link
                to={chapter.to}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-2 transition-colors',
                  chapterActive ? chapter.accent.headerBg : 'hover:bg-surface'
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-md',
                    chapter.accent.iconChip
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'font-display text-[0.7rem] leading-tight font-bold tracking-wide uppercase',
                    chapter.accent.label
                  )}
                >
                  {chapter.label}
                </span>
              </Link>

              <ul className="space-y-0.5 px-1.5 pb-1.5">
                {chapter.items.map((item) => {
                  const [itemPath, itemHash] = item.to.split('#')
                  const active =
                    location.pathname === itemPath &&
                    (itemHash ? location.hash === `#${itemHash}` : true)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 text-sm transition-colors',
                          active ? chapter.accent.itemActive : chapter.accent.itemIdle
                        )}
                      >
                        <span
                          className={cn(
                            'font-display inline-flex min-w-[2.2rem] justify-center rounded-md px-1 py-0.5 text-[0.7rem] font-bold tabular-nums',
                            active ? chapter.accent.numActive : chapter.accent.numIdle
                          )}
                        >
                          {item.num}
                        </span>
                        <span className={cn('leading-tight', active && 'font-semibold')}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
